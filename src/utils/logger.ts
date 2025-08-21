import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private static logFile: string = path.join(process.cwd(), 'camino-mcp.log');
  private static debugMode: boolean = process.env.NODE_ENV === 'development' || process.env.MCP_DEBUG === 'true';

  static debug(message: string, data?: any): void {
    if (this.debugMode) {
      this.writeToFile('DEBUG', message, data);
    }
  }

  static info(message: string, data?: any): void {
    this.writeToFile('INFO', message, data);
  }

  static error(message: string, error?: any): void {
    this.writeToFile('ERROR', message, error);
    // Only log errors to stderr, no console output for Claude Desktop compatibility
    if (this.debugMode && error) {
      process.stderr.write(`[MCP Error] ${message}: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  private static writeToFile(level: string, message: string, data?: any): void {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        data: data || undefined
      };
      
      fs.appendFileSync(
        this.logFile, 
        JSON.stringify(logEntry) + '\n',
        { flag: 'a' }
      );
    } catch (err) {
      // Silently fail if logging doesn't work - don't interfere with MCP
    }
  }

  static clearLogs(): void {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
      }
    } catch (err) {
      // Silently fail
    }
  }
}