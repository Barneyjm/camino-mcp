# Camino AI MCP Server

A comprehensive location intelligence MCP (Model Context Protocol) server that provides spatial reasoning tools for AI agents. Built with TypeScript and powered by Camino AI's location services.

## Features

This MCP server provides 6 powerful location intelligence tools:

### 1. 🔍 **camino_query** - Natural Language Place Search
Search for places using natural language queries with AI-powered ranking.
- Example: "coffee shops near me", "hospitals in downtown"
- Supports location-based filtering and AI ranking
- Powered by OpenStreetMap data

### 2. 🏛️ **camino_search** - Specific Place Search  
Find specific, named places using Nominatim/OpenStreetMap geocoding.
- Example: "Eiffel Tower", "Hotel Principe di Savoia Milan"
- Precise location identification for landmarks and businesses

### 3. 📐 **camino_spatial_relationship** - Spatial Analysis
Calculate spatial relationships between two points.
- Distance, direction, travel time estimates
- Human-readable spatial descriptions

### 4. 🌍 **camino_place_context** - Location Context
Get context-aware information about any location.
- Nearby places and area descriptions
- Accessibility information and local context
- Tailored insights for different purposes

### 5. 🗺️ **camino_journey_planning** - Multi-waypoint Journey Planning
Plan optimized journeys with multiple stops.
- Route optimization and feasibility analysis
- Multiple transport modes (walking, driving, cycling)
- Time budget constraints and intelligent recommendations

### 6. 🛣️ **camino_route_planning** - Detailed Route Planning
Get detailed route information between two points.
- Distance, duration, and turn-by-turn directions
- Multiple transport modes
- Optional detailed geometry for mapping

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Camino AI API key (get one at [getcamino.ai](https://getcamino.ai))

### Installation

#### Option 1: Via Smithery (Recommended)

Install directly from the Smithery MCP registry:

```bash
# Install via Smithery
smithery install camino-location-server

# Configure your API key
smithery config camino-location-server apiKey=your_api_key_here
```

#### Option 2: Local Development

1. Clone this repository:
```bash
git clone https://github.com/Barneyjm/camino-mcp.git
cd camino-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
# Set your API key
export CAMINO_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Usage

#### With Claude Desktop

##### Via Smithery (Automatic):
If you installed via Smithery, it will automatically appear in Claude Desktop. Configuration:

```bash
# Set your API key
smithery config camino-location-server apiKey=your_api_key_here

# Optional: customize base URL
smithery config camino-location-server baseUrl=https://api.getcamino.ai
```

##### Manual Configuration:
For local development, add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "camino-location": {
      "command": "npx",
      "args": ["@smithery/cli", "run", "/path/to/camino-mcp"],
      "env": {
        "CAMINO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### Standalone Usage

```bash
# Development mode with Smithery CLI
npm run dev

# Test server structure locally
npm run build && node test-all-endpoints.js
```

## Configuration

### Environment Variables

- `CAMINO_API_KEY` - Your Camino AI API key (required)
- `CAMINO_API_BASE_URL` - API base URL (default: https://api.getcamino.ai)
- `API_TIMEOUT` - Request timeout in milliseconds (default: 30000)
- `MCP_DEBUG` - Enable debug logging to file (default: false)
- `NODE_ENV` - Set to 'development' for debug logging (optional)

## Tool Examples

### Natural Language Search
```json
{
  "tool": "camino_query",
  "arguments": {
    "query": "Italian restaurants near Times Square",
    "latitude": 40.7580,
    "longitude": -73.9855,
    "radius": 2000,
    "limit": 10
  }
}
```

### Spatial Relationship
```json
{
  "tool": "camino_spatial_relationship", 
  "arguments": {
    "start_latitude": 40.7831,
    "start_longitude": -73.9712,
    "end_latitude": 40.7580,
    "end_longitude": -73.9855,
    "include": ["distance", "direction", "travel_time", "description"]
  }
}
```

### Journey Planning
```json
{
  "tool": "camino_journey_planning",
  "arguments": {
    "waypoints": [
      {"latitude": 40.7831, "longitude": -73.9712, "purpose": "pickup coffee"},
      {"latitude": 40.7580, "longitude": -73.9855, "purpose": "business meeting"}, 
      {"latitude": 40.7614, "longitude": -73.9776, "purpose": "lunch"}
    ],
    "transport_mode": "walking",
    "time_budget": "2 hours"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## API Integration

This server integrates with the Camino AI backend API. All tools make requests to your Camino API endpoints:

- `/query` - Natural language place search
- `/search` - Nominatim place search  
- `/relationship` - Spatial calculations
- `/context` - Place context analysis
- `/journey` - Journey planning
- `/route` - Route planning

All requests use the `X-API-Key` header for authentication.

## Error Handling & Logging

The server includes comprehensive error handling:
- API failures return structured error responses
- Invalid tool arguments are validated using Zod schemas
- Network timeouts and connectivity issues are handled gracefully
- All errors include helpful error messages for debugging

### Logging
- **Production Mode**: No console output (Claude Desktop compatible)
- **Debug Mode**: Logs written to `camino-mcp.log` file
- **Enable Debug**: Set `MCP_DEBUG=true` or `NODE_ENV=development`
- **Log Levels**: INFO, DEBUG, ERROR with timestamps and structured data

## Deployment

### Smithery Registry

This MCP server is available on [Smithery](https://smithery.ai), making it easy to discover and install:

```bash
# List all available MCP servers
smithery list

# Install Camino location server
smithery install camino-location-server

# Configure your API key
smithery config camino-location-server CAMINO_API_KEY=your_key_here
```

### Docker Deployment

Build and run using Docker:

```bash
# Build the image
docker build -t camino-mcp .

# Run the container (for MCP stdio communication)
docker run -i -e CAMINO_API_KEY=your_key_here camino-mcp

# Or run interactively for testing
docker run -it -e CAMINO_API_KEY=your_key_here camino-mcp
```

**Note:** Docker deployment uses a traditional MCP server (stdio transport) rather than the Smithery runtime. This is suitable for production environments where you want direct container control.

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Documentation: [docs.getcamino.ai](https://docs.getcamino.ai)
- Issues: [GitHub Issues](https://github.com/Barneyjm/camino-mcp/issues)
- Repository: [GitHub](https://github.com/Barneyjm/camino-mcp)
- Email: support@getcamino.ai