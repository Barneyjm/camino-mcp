export interface Coordinate {
  lat: number;
  lon: number;
}

export interface Waypoint extends Coordinate {
  purpose: string;
}

export interface QueryRequest {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  rank?: boolean;
  limit?: number;
  generate_answer?: boolean;
}

export interface SearchRequest {
  query: string;
}

export interface SpatialRelationshipRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  include?: Array<'distance' | 'direction' | 'travel_time' | 'description'>;
}

export interface PlaceContextRequest {
  latitude: number;
  longitude: number;
  radius?: string;
  context?: string;
}

export interface JourneyPlanningRequest {
  waypoints: Waypoint[];
  transport_mode?: 'walking' | 'driving' | 'cycling';
  time_budget?: string;
}

export interface RoutePlanningRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  mode?: 'car' | 'bike' | 'foot';
  include_geometry?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CaminoApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}