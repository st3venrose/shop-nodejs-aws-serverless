import { Client } from 'pg';
import { InternalServerError } from '@utils/exceptions';
import { logger } from '@services/loggerService';

export class DatabaseConnection {
  private databaseClient: Client;

  constructor() {
    this.connectToDatabase();
  }

  getDatabaseClient(): Client {
    return this.databaseClient;
  }

  private connectToDatabase(): void {
    try {
      this.databaseClient = new Client();
      this.databaseClient.connect();
    } catch (err) {
      logger.logError(err);
      throw new InternalServerError('Database connection is failed.');
    }
  }
}