import * as L from 'leaflet';
import { ReliefLocation } from './map';

declare module 'leaflet' {
  // Extend MarkerOptions to include our custom properties
  interface MarkerOptions {
    locationData?: ReliefLocation;
  }

  interface MarkerClusterGroupOptions extends L.LayerOptions {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    singleMarkerMode?: boolean;
    disableClusteringAtZoom?: number;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  }

  class MarkerCluster extends L.Marker {
    getAllChildMarkers(): L.Marker[];
    getChildCount(): number;
  }

  class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: L.Layer): this;
    addLayers(layers: L.Layer[]): this;
    removeLayers(layers: L.Layer[]): this;
    clearLayers(): this;
  }
}