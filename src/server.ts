import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { CaminoApiService } from './services/camino-api.js';
import { Tool } from './types/index.js';
import { Logger } from './utils/logger.js';

export class CaminoMCPServer {
  private server: Server;
  private caminoApi: CaminoApiService;

  constructor(apiBaseUrl: string, apiKey: string) {
    this.server = new Server(
      {
        name: 'camino-ai-location-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.caminoApi = new CaminoApiService({
      baseUrl: apiBaseUrl,
      apiKey: apiKey
    });

    this.setupToolHandlers();
    this.setupErrorHandler();
  }

  private setupErrorHandler(): void {
    this.server.onerror = (error) => {
      Logger.error('MCP Server Error', error);
    };
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.executeTool(name, args || {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'camino_query',
        description: 'Search for places using natural language queries (e.g., "coffee shops near me", "hospitals in downtown"). Powered by OpenStreetMap data and AI ranking.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language query for places (e.g., "coffee shops", "restaurants near Times Square")',
            },
            latitude: {
              type: 'number',
              description: 'Latitude for search center (optional). If provided, longitude is required.',
            },
            longitude: {
              type: 'number',
              description: 'Longitude for search center (optional). If provided, latitude is required.',
            },
            radius: {
              type: 'integer',
              description: 'Search radius in meters (default: 1000). Only used if lat/lon are provided.',
              minimum: 100,
              maximum: 50000,
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Maximum results to return (1-100, default: 20)',
            },
            rank: {
              type: 'boolean',
              description: 'Use AI to rank results by relevance (default: true)',
            },
            generate_answer: {
              type: 'boolean',
              description: 'Generate human-readable summary of results (default: true)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'camino_search',
        description: 'Search for specific, named places like "Eiffel Tower" or "Hotel Principe di Savoia Milan". Uses Nominatim/OpenStreetMap geocoding for precise location identification.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query for a specific place name (e.g., "Eiffel Tower", "Starbucks Times Square", "Hotel Principe di Savoia Milan")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'camino_spatial_relationship',
        description: 'Calculate spatial relationships between two points including distance, direction, travel time estimates, and human-readable description.',
        inputSchema: {
          type: 'object',
          properties: {
            start_latitude: {
              type: 'number',
              description: 'Starting point latitude',
            },
            start_longitude: {
              type: 'number',
              description: 'Starting point longitude',
            },
            end_latitude: {
              type: 'number',
              description: 'Ending point latitude',
            },
            end_longitude: {
              type: 'number',
              description: 'Ending point longitude',
            },
            include: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['distance', 'direction', 'travel_time', 'description'],
              },
              description: 'What information to include in response',
            },
          },
          required: ['start_latitude', 'start_longitude', 'end_latitude', 'end_longitude'],
        },
      },
      {
        name: 'camino_place_context',
        description: 'Get context-aware information about a location including nearby places, area description, accessibility info, and local context.',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Location latitude',
            },
            longitude: {
              type: 'number',
              description: 'Location longitude',
            },
            radius: {
              type: 'string',
              description: 'Search radius (e.g., "500m", "1km")',
            },
            context: {
              type: 'string',
              description: 'Optional context for tailored insights (e.g., "business meeting", "family outing")',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'camino_journey_planning',
        description: 'Multi-waypoint journey planning with route optimization, feasibility analysis, and intelligent recommendations.',
        inputSchema: {
          type: 'object',
          properties: {
            waypoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  purpose: { type: 'string' },
                },
                required: ['latitude', 'longitude', 'purpose'],
              },
              description: 'List of waypoints with purposes',
              minItems: 2,
            },
            transport_mode: {
              type: 'string',
              enum: ['walking', 'driving', 'cycling'],
              description: 'Mode of transportation',
            },
            time_budget: {
              type: 'string',
              description: 'Time budget for journey (e.g., "2 hours", "30 minutes")',
            },
          },
          required: ['waypoints'],
        },
      },
      {
        name: 'camino_route_planning',
        description: 'Get detailed route information between two points with distance, duration, and optional turn-by-turn directions.',
        inputSchema: {
          type: 'object',
          properties: {
            start_latitude: {
              type: 'number',
              description: 'Starting point latitude',
            },
            start_longitude: {
              type: 'number',
              description: 'Starting point longitude',
            },
            end_latitude: {
              type: 'number',
              description: 'Ending point latitude',
            },
            end_longitude: {
              type: 'number',
              description: 'Ending point longitude',
            },
            mode: {
              type: 'string',
              enum: ['car', 'bike', 'foot'],
              description: 'Mode of transport',
            },
            include_geometry: {
              type: 'boolean',
              description: 'Include detailed route geometry for mapping',
            },
          },
          required: ['start_latitude', 'start_longitude', 'end_latitude', 'end_longitude'],
        },
      },
    ];
  }

  private async executeTool(name: string, args: Record<string, any>): Promise<any> {
    Logger.debug('Executing tool', { name, args });
    
    switch (name) {
      case 'camino_query':
        return await this.executeQueryTool(args);
      case 'camino_search':
        return await this.executeSearchTool(args);
      case 'camino_spatial_relationship':
        return await this.executeSpatialRelationshipTool(args);
      case 'camino_place_context':
        return await this.executePlaceContextTool(args);
      case 'camino_journey_planning':
        return await this.executeJourneyPlanningTool(args);
      case 'camino_route_planning':
        return await this.executeRoutePlanningTool(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async executeQueryTool(args: Record<string, any>): Promise<any> {
    const request = {
      query: args.query,
      latitude: args.latitude,
      longitude: args.longitude,
      radius: args.radius || 1000,
      rank: args.rank !== false,
      limit: args.limit || 20,
      generate_answer: args.generate_answer !== false,
    };

    const response = await this.caminoApi.executeQuery(request);
    return response.success ? response.data : response;
  }

  private async executeSearchTool(args: Record<string, any>): Promise<any> {
    const request = { query: args.query };
    const response = await this.caminoApi.executeSearch(request);
    return response.success ? response.data : response;
  }

  private async executeSpatialRelationshipTool(args: Record<string, any>): Promise<any> {
    const request = {
      start_latitude: args.start_latitude,
      start_longitude: args.start_longitude,
      end_latitude: args.end_latitude,
      end_longitude: args.end_longitude,
      include: args.include || ['distance', 'direction', 'travel_time', 'description'],
    };

    const response = await this.caminoApi.calculateSpatialRelationship(request);
    return response.success ? response.data : response;
  }

  private async executePlaceContextTool(args: Record<string, any>): Promise<any> {
    const request = {
      latitude: args.latitude,
      longitude: args.longitude,
      radius: args.radius || '500m',
      context: args.context,
    };

    const response = await this.caminoApi.getPlaceContext(request);
    return response.success ? response.data : response;
  }

  private async executeJourneyPlanningTool(args: Record<string, any>): Promise<any> {
    const request = {
      waypoints: args.waypoints,
      transport_mode: args.transport_mode || 'walking',
      time_budget: args.time_budget,
    };

    const response = await this.caminoApi.planJourney(request);
    return response.success ? response.data : response;
  }

  private async executeRoutePlanningTool(args: Record<string, any>): Promise<any> {
    const request = {
      start_latitude: args.start_latitude,
      start_longitude: args.start_longitude,
      end_latitude: args.end_latitude,
      end_longitude: args.end_longitude,
      mode: args.mode || 'car',
      include_geometry: args.include_geometry || false,
    };

    const response = await this.caminoApi.planRoute(request);
    return response.success ? response.data : response;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    Logger.info('Camino MCP Server started');
  }
}