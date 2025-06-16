'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { ReliefLocation, ReliefLocationType } from '@/types/map';

interface ClusteredCustomMarkersProps {
  locations: ReliefLocation[];
  onMarkerClick: (location: ReliefLocation) => void;
}

const ClusteredCustomMarkers = ({ locations, onMarkerClick }: ClusteredCustomMarkersProps) => {
  const map = useMap();
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const getCustomIcon = useCallback((location: ReliefLocation) => {
    const markerConfig: Record<ReliefLocationType, { color: string; icon: string; label: string }> = {
      MEDICAL: {
        color: '#FF4444',
        icon: '🏥',
        label: 'Hospital'
      },
      FOOD: {
        color: '#FF8C00',
        icon: '🍽️',
        label: 'Food Distribution'
      },
      SHELTER: {
        color: '#4169E1',
        icon: '🏠',
        label: 'Shelter'
      },
      WATER: {
        color: '#00CED1',
        icon: '💧',
        label: 'Water Point'
      },
      SUPPLIES: {
        color: '#32CD32',
        icon: '📦',
        label: 'Supply Center'
      },
      OTHER: {
        color: '#808080',
        icon: 'ℹ️',
        label: 'Other'
      }
    };

    const config = markerConfig[location.type];

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-wrapper" style="position: relative;">
          <!-- Location Name Label -->
          <div style="
            position: absolute;
            top: -24px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1;
            backdrop-filter: blur(4px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${location.name}</div>
          
          <div class="location-pin" style="
            position: relative;
            width: 36px;
            height: 48px;
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <!-- Pin Head -->
            <div style="
              width: 36px;
              height: 36px;
              background-color: ${config.color};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              position: relative;
            ">
              <span style="
                font-size: 18px;
                transform: rotate(45deg);
                display: block;
              " role="img" aria-label="${config.label}">${config.icon}</span>
              ${location.status === 'NEEDS_SUPPORT' ? 
                '<span style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%; border: 2px solid white;"></span>' 
                : ''}
            </div>
            <!-- Pin Shadow -->
            <div style="
              width: 20px;
              height: 8px;
              background-color: rgba(0,0,0,0.2);
              border-radius: 50%;
              margin-top: -4px;
              filter: blur(2px);
            "></div>
          </div>
        </div>
      `,
      iconSize: [36, 72], // Increased height to accommodate the name label
      iconAnchor: [18, 72], // Adjusted anchor point
      popupAnchor: [0, -72], // Adjusted popup anchor
    });
  }, []);

  // Initialize marker cluster group
  useEffect(() => {
    if (!map) return;

    const initializeMarkerCluster = async () => {
      try {
        // Clear existing markers if any
        if (!markerClusterRef.current) {
          // Create a new marker cluster group only if it doesn't exist
          const mcg = new L.MarkerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            animate: true,
            animateAddingMarkers: true,
            iconCreateFunction: (cluster) => {
              const markers = cluster.getAllChildMarkers();
              const hasNeedsSupport = markers.some(
                marker => (marker.options).locationData?.status === 'NEEDS_SUPPORT'
              );
              const childCount = cluster.getChildCount();

              return L.divIcon({
                html: `
                  <div class="cluster-marker ${hasNeedsSupport ? 'needs-support' : ''}" style="
                    background: linear-gradient(45deg, 
                      ${hasNeedsSupport ? 'rgba(239, 68, 68, 0.95)' : 'rgba(59, 130, 246, 0.95)'}, 
                      ${hasNeedsSupport ? 'rgba(220, 38, 38, 0.95)' : 'rgba(37, 99, 235, 0.95)'}
                    );
                    width: ${Math.min(childCount * 8 + 30, 50)}px;
                    height: ${Math.min(childCount * 8 + 30, 50)}px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    backdrop-filter: blur(4px);
                  ">
                    <div class="cluster-content">
                      <span class="cluster-count">${childCount}</span>
                      ${hasNeedsSupport ? '<span class="cluster-alert"></span>' : ''}
                    </div>
                  </div>
                `,
                className: 'custom-cluster-marker',
                iconSize: L.point(40, 40),
                iconAnchor: L.point(20, 20),
              });
            }
          });

          map.addLayer(mcg);
          markerClusterRef.current = mcg;
        }

      } catch (error) {
        console.error('Error initializing marker cluster:', error);
      }
    };

    initializeMarkerCluster();

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
        markersRef.current.clear();
      }
    };
  }, [map]);


  // Update markers when locations change
  useEffect(() => {
    if (!markerClusterRef.current) return;

    // Remove markers that are no longer in the locations array
    markersRef.current.forEach((marker, id) => {
      if (!locations.find(loc => loc.id === id)) {
        markerClusterRef.current?.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    locations.forEach((location) => {
      location.newsUpdates?.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      if (!markersRef.current.has(location.id)) {
        const marker = L.marker(location.location as L.LatLngExpression, {
          icon: getCustomIcon(location),
          locationData: location
        });

        // Only show the latest news update in the popup
        const latestUpdate = location.newsUpdates?.[0];

        // Create popup content
        const popupContent = `
          <div class="marker-popup p-3">
            <h3 class="text-lg font-semibold mb-2">${location.name}</h3>
            ${latestUpdate ? `
              <div style="font-size: 0.9em; color: #888;">${latestUpdate.time}</div>
              <div style="font-size: 1em; margin-bottom: 0.2em;">
                ${latestUpdate.content}
              </div>
              ${latestUpdate.link ? `<a href="${latestUpdate.link}" target="_blank" style="font-size:0.85em; color:#007bff;">رابط الخبر</a>` : ''}
            ` : ''}
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs ${
                location.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                location.status === 'NEEDS_SUPPORT' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }">${location.status}</span>
            </div>
          </div>
        `;

        const popup = L.popup({
          maxWidth: 300,
          className: 'custom-popup',
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
          closeOnEscapeKey: false
        }).setContent(popupContent);

        marker.bindPopup(popup);

        // Show popup on hover
        marker.on('mouseover', () => {
          marker.openPopup();
        });

        // Hide popup on mouseout
        marker.on('mouseout', () => {
          marker.closePopup();
        });

        // Handle click events
        marker.on('click', () => {
          onMarkerClick(location);
        });

        // Add click handler to map to close popups when clicking outside
        map.on('click', () => {
          map.closePopup();
        });

        markerClusterRef?.current?.addLayer(marker);
        markersRef.current.set(location.id, marker);
      }
    });

    // Cleanup map click handler
    return () => {
      map.off('click');
    };
  }, [locations, onMarkerClick, getCustomIcon, map]);

  return null;
};

export default ClusteredCustomMarkers;