import { createLogger, transports, format as winstonFormat } from "winston";
import * as Transport from "winston-transport";
import { Logger as ITypeORMLogger } from "typeorm";
import path from "path";
import { Format } from "logform";

const NODE_ENV = process.env.NODE_ENV;

let logLevel = "debug";

let format: Format = winstonFormat.combine(
  /**
   * does not work outside development if I don't provide json
   */
  winstonFormat.json(),
  winstonFormat.timestamp()
);

const fileTransport = new transports.File({
  maxFiles: 5,
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  dirname: path.resolve(__dirname, "..", "logs"),
  filename: (process.env.NODE_ENV || "development") + ".log"
});

const winstonTransports: Transport[] = [fileTransport];

if (NODE_ENV === "development") {
  winstonTransports.push(
    new transports.Console({
      level: "debug",
      handleExceptions: true
    })
  );

  format = winstonFormat.combine(
    winstonFormat.json(),
    winstonFormat.timestamp(),
    winstonFormat.prettyPrint(),
    winstonFormat.colorize()
  );
} else {
  logLevel = "info";
}

export const logger = createLogger({
  level: logLevel,

  transports: winstonTransports,

  exitOnError: false,

  format
});

export class TypeORMLogger implements ITypeORMLogger {
  private static winstonLogger = createLogger({
    level: "info",

    exitOnError: false,

    transports: [fileTransport],

    format
  });

  public logQuery(query: string, parameters?: any[] | undefined) {
    TypeORMLogger.winstonLogger.info(this.prefix("Query"), {
      query,
      parameters
    });
  }

  public logQueryError(
    error: string,
    query: string,
    parameters?: any[] | undefined
  ) {
    TypeORMLogger.winstonLogger.warn(this.prefix("Query Error"), {
      error,
      query,
      parameters
    });
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[] | undefined
  ) {
    TypeORMLogger.winstonLogger.warn(this.prefix(`Query Slow ${time}`), {
      query,
      parameters
    });
  }

  public logSchemaBuild(message: string) {
    TypeORMLogger.winstonLogger.info(this.prefix("Schema Build"), {
      message
    });
  }

  public logMigration(message: string) {
    TypeORMLogger.winstonLogger.info(this.prefix("Migration"), {
      message
    });
  }

  public log(level: "log" | "info" | "warn", message: any) {
    TypeORMLogger.winstonLogger.info(this.prefix(level), {
      message
    });
  }

  private prefix(arg: string | number) {
    return `[TypeORM] ${arg}:`;
  }
}
