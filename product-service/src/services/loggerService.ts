import { createLogger, format, transports } from 'winston';

class LoggerService {
  private readonly logger: any;
  private readonly format: any;

  constructor() {
      this.format = format.combine(
          format.colorize(),
          format.timestamp(),
          format.align(),
          format.errors({ stack: true }),
          format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      );

      this.logger = createLogger({
          level: process.env.ENV_STAGE === 'prod' ? 'error' : 'info',
          format: this.format,
          transports: [new transports.Console()],
      });
  }

  logInfo(...messages: string[]): void {
    this.logger.info(this.convertArrayToString(messages));
  }

  logLambdaEvent(event: any): void {
    this.logInfo(`Incoming event: ${JSON.stringify(event)}`);
  }

  logError(...messages: string[]) {
    this.logger.error(this.convertArrayToString(messages));
  }

  private convertArrayToString(messages: string[]): string {
    return messages.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
      ''
    );
  }
}

export const logger = new LoggerService();
