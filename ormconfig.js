const dbConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === "development",
  synchronize: process.env.NODE_ENV !== "production",
  dropSchema: process.env.NODE_ENV === "test",
  entities: [__dirname + "/src/entity/**/*.ts"],
  migrations: [__dirname + "/src/migration/**/*.ts"],
  subscribers: [__dirname + "/src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: __dirname + "/src/entity",
    migrationsDir: __dirname + "/src/migration",
    subscribersDir: __dirname + "/src/subscriber"
  }
};

module.exports = dbConnectionOptions;
