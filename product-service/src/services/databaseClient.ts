import { Client } from 'pg';
import { InternalError } from "@utils/exceptions";
import { winstonLogger } from "@utils/winstonLogger";

export class DatabaseConnection {
  private databaseClient: Client;

  constructor() {
    this.connectToDatabase();
  }

  private connectToDatabase() {
    try {
      this.databaseClient = new Client();
      this.databaseClient.connect();
    } catch (e) {
      winstonLogger.logError(e);
      throw new InternalError('Database connection is failed');
    }
  }

  getDatabaseClient() {
    return this.databaseClient;
  }
}