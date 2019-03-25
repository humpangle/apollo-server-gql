const IS_TEST = process.env.NODE_ENV === "test";
const IS_DEV = process.env.NODE_ENV === "development";

const ROOT_PREFIX = IS_DEV || IS_TEST ? "src" : "build";
const FILE_SUFFIX = IS_DEV || IS_TEST ? "ts" : "js";

const dbConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  logging: IS_DEV,
  synchronize: IS_TEST,
  dropSchema: IS_TEST,
  entities: [ROOT_PREFIX + "/entity/**/*." + FILE_SUFFIX],
  migrations: [ROOT_PREFIX + "/migration/**/*." + FILE_SUFFIX],
  subscribers: [ROOT_PREFIX + "/subscriber/**/*." + FILE_SUFFIX],
  cli: {
    entitiesDir: ROOT_PREFIX + "/entity",
    migrationsDir: ROOT_PREFIX + "/migration",
    subscribersDir: ROOT_PREFIX + "/subscriber"
  }
};

module.exports = dbConnectionOptions;
