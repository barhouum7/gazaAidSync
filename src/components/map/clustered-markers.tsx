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
        <div class="marker-wrapper">
          <div class="marker-container" style="
            background-color: ${config.color};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
          ">
            <span style="font-size: 18px;" role="img" aria-label="${config.label}">${config.icon}</span>
            ${location.status === 'NEEDS_SUPPORT' ? 
              '<span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>' 
              : ''}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    const initializeMarkerCluster = async () => {
      try {
        // Create a new marker cluster group
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

        // Add markers to the cluster group
        locations.forEach((location) => {
          const marker = L.marker(location.location as L.LatLngExpression, {
            icon: getCustomIcon(location),
            locationData: location
          });

          // Create popup content
          const popupContent = `
            <div class="marker-popup p-3">
              <h3 class="text-lg font-semibold mb-2">${location.name}</h3>
              ${location.description ? `
                <p class="text-sm text-gray-600 mb-2">${location.description}</p>
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

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
          });

          marker.on('click', () => onMarkerClick(location));
          mcg.addLayer(marker);
        });

        // Add the cluster group to the map
        map.addLayer(mcg);
        markerClusterRef.current = mcg;

      } catch (error) {
        console.error('Error initializing marker cluster:', error);
      }
    };

    initializeMarkerCluster();

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
      }
    };
  }, [map, locations, onMarkerClick, getCustomIcon]);

  return null;
};

export default ClusteredCustomMarkers;