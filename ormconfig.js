const dbConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: process.env.NODE_ENV === "development",
  synchronize: process.env.NODE_ENV === "test",
  dropSchema: process.env.NODE_ENV === "test",
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};

module.exports = dbConnectionOptions;
