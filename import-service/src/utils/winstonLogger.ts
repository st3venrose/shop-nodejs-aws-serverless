import { createLogger, format, transports } from 'winston';

class WinstonLogger {
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

  logInfo(message: string){
    this.logger.info(message);
  }

  logRequest(event: Object){
    this.logInfo(`Incoming event: ${JSON.stringify(event)}`);
  }

  logError(message: any){
    this.logger.error(message);
  }
}

export const winstonLogger = new WinstonLogger();
