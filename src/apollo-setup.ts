import "reflect-metadata";
import { Connection } from "typeorm";
import {
  PubSub,
  ApolloServerExpressConfig,
  ApolloServer
} from "apollo-server-express";
import { importSchema } from "graphql-import";
import { DocumentNode } from "graphql";
import cors from "cors";
import express, { Express as AppExpress } from "express";
import logger from "morgan";
import { ContextFunction } from "apollo-server-core";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-core";

import { userResolver } from "./user.resolver";
import { UserObject } from "./entity/user";

export interface Context {
  connection: Connection;
  pubSub: PubSub;
  secret: string;
  currentUser?: UserObject | null;
}

export enum PubSubMessage {
  userAdded = "userAdded"
}

export const typeDefsAndResolvers: Pick<
  ApolloServerExpressConfig,
  "typeDefs" | "resolvers"
> = {
  typeDefs: (importSchema(
    __dirname + "/graphql/schema.graphql"
  ) as unknown) as DocumentNode,

  resolvers: [userResolver] as any
};

const IS_DEV = process.env.NODE_ENV === "development";

export type UserGetterFunc = (
  req: AppExpress["request"],
  secret: string
) => Promise<UserObject | null>;

export type MakeContext = (
  connection: Connection,
  secret?: string | undefined,
  userGetterFunc?: UserGetterFunc | undefined
) => ContextFunction<ExpressContext, Context>;

const defaultContextFn: MakeContext = (
  connection,
  secret = "",
  userGetterFunc = getUserFromRequest
) => async ({ req }) => {
  return {
    connection,
    secret,
    pubSub: new PubSub(),
    currentUser: await userGetterFunc(req, secret)
  };
};

export function constructServer(
  connection: Connection,
  secret: string,
  contextFn: MakeContext = defaultContextFn
) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (IS_DEV) {
    app.use(logger("dev"));
  }

  const apolloServer = new ApolloServer({
    ...typeDefsAndResolvers,

    introspection: IS_DEV,

    playground: IS_DEV,

    context: contextFn(connection, secret)
  });

  const GRAPHQL_PATH = "/graphql";

  apolloServer.applyMiddleware({
    app,
    path: GRAPHQL_PATH
  });

  // Wrap the Express server
  const webServer = createServer(app);

  apolloServer.installSubscriptionHandlers(webServer);

  /**
   * We do not start the server here because in development and production,
   * we start the server automatically whereas in test, we start the server
   * manually.
   */

  return {
    apolloServer,
    app,
    webServer,
    GRAPHQL_PATH
  };
}

export const INVALID_SESSION_MESSAGE =
  "Your session has expired. Please sign in again.";

export const AUTHORIZATION_HEADER_PREFIX = "Bearer";

export async function getUserFromRequest(
  req: AppExpress["request"],
  secret: string
): Promise<UserObject | null> {
  const {
    headers: { authorization }
  } = req;

  if (!authorization) {
    return null;
  }

  const [prefix, token] = authorization.split(" ");

  if (prefix !== AUTHORIZATION_HEADER_PREFIX) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }

  try {
    return await (jwt.verify(token || "", secret) as UserObject);
  } catch (error) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }
}
