import "reflect-metadata";
import { Connection } from "typeorm";
import { ApolloServerExpressConfig, ApolloServer } from "apollo-server-express";
import { importSchema } from "graphql-import";
import { DocumentNode } from "graphql";
import cors from "cors";
import express, { Express as AppExpress } from "express";
import morganLogger from "morgan";
import { ContextFunction } from "apollo-server-core";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-core";

import resolvers from "./resolvers";
import { UserObject } from "./entity/user";

export interface OurContext {
  connection: Connection;
  secret: string;
  currentUser?: UserObject | null;
}

export enum PubSubMessage {
  userAdded = "userAdded",

  messageCreated = "MESSAGE_CREATED"
}

export const typeDefsAndResolvers: Pick<
  ApolloServerExpressConfig,
  "typeDefs" | "resolvers"
> = {
  typeDefs: (importSchema(
    __dirname + "/graphql/schema.graphql"
  ) as unknown) as DocumentNode,

  resolvers
};

const IS_DEV = process.env.NODE_ENV === "development";
const IS_TEST = process.env.NODE_ENV === "test";

export type UserGetterFunc = (
  req: AppExpress["request"],
  secret: string
) => Promise<UserObject | null>;

export type MakeContext = (
  connection: Connection,
  secret?: string | undefined,
  userGetterFunc?: UserGetterFunc | undefined
) => ContextFunction<ExpressContext, OurContext>;

const defaultContextFn: MakeContext = (
  connection,
  /* istanbul ignore next: we will always provide the secret from env variables */
  secret = "",
  userGetterFunc = getUserFromRequest
) => async args => {
  const { req } = args;

  return {
    connection,
    secret,
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

  /* istanbul ignore next: we don't care about logging in tests */
  if (!IS_TEST) {
    app.use(morganLogger("combined"));
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
   * manually. 1
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
  let token = "";
  let prefix = "";

  /**
   * Simply return null in case of any problems
   */
  try {
    const {
      headers: { authorization }
    } = req;

    if (!authorization) {
      return null;
    }

    [prefix, token] = authorization.split(" ");

    if (prefix !== AUTHORIZATION_HEADER_PREFIX || !token) {
      return null;
    }
  } catch (error) {
    return null;
  }

  /**
   * We will always assume session has expired if any problem arises here
   */
  try {
    return await (jwt.verify(token, secret) as UserObject);
  } catch (error) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }
}
