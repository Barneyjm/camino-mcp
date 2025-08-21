#!/usr/bin/env node

import { config } from 'dotenv';
import { CaminoMCPServer } from './server.js';
import { Logger } from './utils/logger.js';

// Load environment variables
config();

async function main() {
  // Get configuration from environment variables
  const apiBaseUrl = process.env.CAMINO_API_BASE_URL || 'https://api.getcamino.ai';
  const apiKey = process.env.CAMINO_API_KEY;

  if (!apiKey) {
    process.stderr.write('CAMINO_API_KEY environment variable is required\n');
    process.stderr.write('Set it in your .env file or environment: CAMINO_API_KEY=your_api_key_here\n');
    process.exit(1);
  }

  Logger.info('Starting Camino MCP Server', { apiBaseUrl, apiKeyPrefix: apiKey.substring(0, 8) });

  try {
    const server = new CaminoMCPServer(apiBaseUrl, apiKey);
    await server.run();
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  Logger.info('Shutting down Camino MCP Server (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.info('Shutting down Camino MCP Server (SIGTERM)');
  process.exit(0);
});

main().catch((error) => {
  Logger.error('Unhandled error', error);
  process.exit(1);
});