/**
 * Camino AI MCP Server - Location Intelligence Tools
 * 
 * Comprehensive spatial reasoning tools for AI agents including:
 * - Natural language place search with AI ranking
 * - Spatial relationship calculations  
 * - Context-aware location analysis
 * - Multi-waypoint journey planning
 * - Detailed route planning
 * - Specific place search via Nominatim
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CaminoApiService } from "./services/camino-api.js";

// Configuration schema for user-level settings
export const configSchema = z.object({
  apiKey: z.string().describe("Your Camino AI API key (required)"),
  baseUrl: z.string().default("https://api.getcamino.ai").describe("API base URL"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createStatelessServer({
  config,
  sessionId,
}: {
  config: z.infer<typeof configSchema>;
  sessionId: string;
}) {
  const server = new McpServer({
    name: "camino-location-server",
    version: "1.0.0",
  });

  // Initialize API service with user config
  const caminoApi = new CaminoApiService({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  // Tool 1: Natural Language Place Search
  server.tool(
    "camino_query",
    "Search for places using natural language queries (e.g., 'coffee shops near me', 'hospitals in downtown'). Powered by OpenStreetMap data and AI ranking.",
    {
      query: z.string().describe("Natural language query for places (e.g., 'coffee shops', 'restaurants near Times Square')"),
      latitude: z.number().optional().describe("Latitude for search center (optional). If provided, longitude is required."),
      longitude: z.number().optional().describe("Longitude for search center (optional). If provided, latitude is required."),
      radius: z.number().min(100).max(50000).default(1000).describe("Search radius in meters (default: 1000). Only used if lat/lon are provided."),
      limit: z.number().min(1).max(100).default(20).describe("Maximum results to return (1-100, default: 20)"),
      rank: z.boolean().default(true).describe("Use AI to rank results by relevance (default: true)"),
      generate_answer: z.boolean().default(true).describe("Generate human-readable summary of results (default: true)"),
    },
    async ({ query, latitude, longitude, radius, limit, rank, generate_answer }) => {
      const request = {
        query,
        latitude,
        longitude,
        radius,
        rank,
        limit,
        generate_answer,
      };

      const response = await caminoApi.executeQuery(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: Specific Place Search
  server.tool(
    "camino_search",
    "Search for specific, named places like 'Eiffel Tower' or 'Hotel Principe di Savoia Milan'. Uses Nominatim/OpenStreetMap geocoding for precise location identification.",
    {
      query: z.string().describe("The search query for a specific place name (e.g., 'Eiffel Tower', 'Starbucks Times Square', 'Hotel Principe di Savoia Milan')"),
    },
    async ({ query }) => {
      const request = { query };
      const response = await caminoApi.executeSearch(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 3: Spatial Relationships
  server.tool(
    "camino_spatial_relationship",
    "Calculate spatial relationships between two points including distance, direction, travel time estimates, and human-readable description.",
    {
      start_latitude: z.number().describe("Starting point latitude"),
      start_longitude: z.number().describe("Starting point longitude"),
      end_latitude: z.number().describe("Ending point latitude"),
      end_longitude: z.number().describe("Ending point longitude"),
      include: z.array(z.enum(["distance", "direction", "travel_time", "description"])).default(["distance", "direction", "travel_time", "description"]).describe("What information to include in response"),
    },
    async ({ start_latitude, start_longitude, end_latitude, end_longitude, include }) => {
      const request = {
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
        include,
      };

      const response = await caminoApi.calculateSpatialRelationship(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 4: Place Context
  server.tool(
    "camino_place_context",
    "Get context-aware information about a location including nearby places, area description, accessibility info, and local context.",
    {
      latitude: z.number().describe("Location latitude"),
      longitude: z.number().describe("Location longitude"),
      radius: z.string().default("500m").describe("Search radius (e.g., '500m', '1km')"),
      context: z.string().optional().describe("Optional context for tailored insights (e.g., 'business meeting', 'family outing')"),
    },
    async ({ latitude, longitude, radius, context }) => {
      const request = {
        latitude,
        longitude,
        radius,
        context,
      };

      const response = await caminoApi.getPlaceContext(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 5: Journey Planning
  server.tool(
    "camino_journey_planning",
    "Multi-waypoint journey planning with route optimization, feasibility analysis, and intelligent recommendations.",
    {
      waypoints: z.array(
        z.object({
          lat: z.number().describe("Waypoint latitude"),
          lon: z.number().describe("Waypoint longitude"),
          purpose: z.string().describe("Purpose of this waypoint"),
        })
      ).min(2).describe("List of waypoints with purposes"),
      transport_mode: z.enum(["walking", "driving", "cycling"]).default("walking").describe("Mode of transportation"),
      time_budget: z.string().optional().describe("Time budget for journey (e.g., '2 hours', '30 minutes')"),
    },
    async ({ waypoints, transport_mode, time_budget }) => {
      const request = {
        waypoints,
        transport_mode,
        time_budget,
      };

      const response = await caminoApi.planJourney(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 6: Route Planning
  server.tool(
    "camino_route_planning",
    "Get detailed route information between two points with distance, duration, and optional turn-by-turn directions.",
    {
      start_latitude: z.number().describe("Starting point latitude"),
      start_longitude: z.number().describe("Starting point longitude"),
      end_latitude: z.number().describe("Ending point latitude"),
      end_longitude: z.number().describe("Ending point longitude"),
      mode: z.enum(["car", "bike", "foot"]).default("car").describe("Mode of transport"),
      include_geometry: z.boolean().default(false).describe("Include detailed route geometry for mapping"),
    },
    async ({ start_latitude, start_longitude, end_latitude, end_longitude, mode, include_geometry }) => {
      const request = {
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
        mode,
        include_geometry,
      };

      const response = await caminoApi.planRoute(request);
      const result = response.success ? response.data : response;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server.server;
}