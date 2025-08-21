import axios, { AxiosInstance } from 'axios';
import {
  QueryRequest,
  SearchRequest,
  SpatialRelationshipRequest,
  PlaceContextRequest,
  JourneyPlanningRequest,
  RoutePlanningRequest,
  ApiResponse,
  CaminoApiConfig
} from '../types/index.js';

export class CaminoApiService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: CaminoApiConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': config.apiKey
      }
    });
  }

  async executeQuery(request: QueryRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/query', {
        params: {
          q: request.query,
          lat: request.latitude,
          lon: request.longitude,
          radius: request.radius,
          rank: request.rank,
          limit: request.limit,
          answer: request.generate_answer
        }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Query execution failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          query: request.query,
          results: [],
          total_found: 0,
          ai_ranked: false
        }
      };
    }
  }

  async executeSearch(request: SearchRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/search', null, {
        params: { 
          q: request.query
        }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Search execution failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          query: request.query,
          results: [],
          total_found: 0,
          source: 'nominatim'
        }
      };
    }
  }

  async calculateSpatialRelationship(request: SpatialRelationshipRequest): Promise<ApiResponse> {
    try {
      const requestBody = {
        start: {
          lat: request.start_latitude,
          lon: request.start_longitude
        },
        end: {
          lat: request.end_latitude,
          lon: request.end_longitude
        },
        include: request.include
      };
      const response = await this.client.post('/relationship', requestBody);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Spatial relationship calculation failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          start_location: { 
            lat: request.start_latitude, 
            lon: request.start_longitude 
          },
          end_location: { 
            lat: request.end_latitude, 
            lon: request.end_longitude 
          }
        }
      };
    }
  }

  async getPlaceContext(request: PlaceContextRequest): Promise<ApiResponse> {
    try {
      const requestBody = {
        location: {
          lat: request.latitude,
          lon: request.longitude
        },
        radius: request.radius,
        context: request.context
      };
      const response = await this.client.post('/context', requestBody);
      return { success: true, data: response.data };
    } catch (error: any) {
      Logger.error('Place context retrieval failed', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          location: { 
            lat: request.latitude, 
            lon: request.longitude 
          },
          relevant_places: {},
          total_places_found: 0
        }
      };
    }
  }

  async planJourney(request: JourneyPlanningRequest): Promise<ApiResponse> {
    try {
      const requestBody = {
        waypoints: request.waypoints.map(wp => ({
          lat: wp.lat,
          lon: wp.lon,
          purpose: wp.purpose
        })),
        constraints: {
          transport: request.transport_mode || 'walking',
          time_budget: request.time_budget
        }
      };
      const response = await this.client.post('/journey', requestBody);
      return { success: true, data: response.data };
    } catch (error: any) {
      Logger.error('Journey planning failed', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          waypoints: request.waypoints,
          feasible: false
        }
      };
    }
  }

  async planRoute(request: RoutePlanningRequest): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/route', {
        params: {
          start_lat: request.start_latitude,
          start_lon: request.start_longitude,
          end_lat: request.end_latitude,
          end_lon: request.end_longitude,
          mode: request.mode,
          include_geometry: request.include_geometry
        }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      Logger.error('Route planning failed', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message,
        data: {
          start_location: { 
            lat: request.start_latitude, 
            lon: request.start_longitude 
          },
          end_location: { 
            lat: request.end_latitude, 
            lon: request.end_longitude 
          },
          mode: request.mode || 'car'
        }
      };
    }
  }
}