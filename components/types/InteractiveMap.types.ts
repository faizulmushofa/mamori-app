import type { Coordinates } from '../../utils/types/haversine.types';

export interface IncidentMarkerData {
  id: string;
  title: string;
  category: string;
  coords: Coordinates;
}
