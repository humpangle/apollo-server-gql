import { ConnectionOptions } from "typeorm";

export const dbConnectionOptions: ConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === "development",
  synchronize: process.env.NODE_ENV !== "production",
  dropSchema: process.env.NODE_ENV === "test",
  entities: [__dirname + "/entity/**/*.ts"],
  migrations: [__dirname + "/migration/**/*.ts"],
  subscribers: [__dirname + "/subscriber/**/*.ts"],
  cli: {
    entitiesDir: __dirname + "/entity",
    migrationsDir: __dirname + "/migration",
    subscribersDir: __dirname + "/subscriber"
  }
};
