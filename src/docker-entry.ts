#!/usr/bin/env node

/**
 * Docker entry point for Camino MCP Server
 * This creates a traditional MCP server instance for stdio transport
 * when running in Docker containers (non-Smithery environments)
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import createStatelessServer, { configSchema } from './index.js';

async function main() {
  // Get configuration from environment variables
  const apiKey = process.env.CAMINO_API_KEY;
  const baseUrl = process.env.CAMINO_API_BASE_URL || 'https://api.getcamino.ai';
  const debug = process.env.DEBUG === 'true';

  if (!apiKey) {
    console.error('CAMINO_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Validate configuration
    const config = configSchema.parse({
      apiKey,
      baseUrl,
      debug,
    });

    // Create server instance
    const server = createStatelessServer({
      config,
      sessionId: `docker-${Date.now()}`,
    });

    // Connect to stdio transport for MCP
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    if (debug) {
      console.error('Camino MCP Server running in Docker');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});