import "reflect-metadata";
import { Connection } from "typeorm";
import { ApolloServerExpressConfig, ApolloServer } from "apollo-server-express";
import { importSchema } from "graphql-import";
import { DocumentNode } from "graphql";
import cors from "cors";
import express from "express";
import morganLogger from "morgan";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-core";
import { Logger as WinstonLogger } from "winston";

import resolvers from "./resolvers";
import { User } from "./entity/user";
import { getUserById } from "./contexts/accounts";

export interface OurContext {
  connection: Connection;
  secret: string;
  currentUser?: User | null;
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

type WithAuthorization<T = {}> = T & {
  connection: { Authorization?: string; context?: OurContext };
};

export function constructServer(
  connection: Connection,
  secret: string,
  logger?: WinstonLogger
) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  /* istanbul ignore next: we don't care about logging in tests */
  if (!IS_TEST) {
    if (logger) {
      app.use(
        morganLogger("combined", {
          stream: {
            write: function(message) {
              logger.info(message, {
                type: "[HTTP]"
              });
            }
          }
        })
      );
    } else {
      app.use(morganLogger("combined"));
    }
  }

  const apolloServer = new ApolloServer({
    ...typeDefsAndResolvers,

    introspection: IS_DEV,

    playground: IS_DEV,

    context: async function createContext(
      args: WithAuthorization<ExpressContext>
    ) {
      {
        let currentUser: null | User = null;

        /**
         * from normal HTTP client
         */
        if (args.req) {
          currentUser = await getUserFromRequest(
            connection,
            secret,
            args.req.headers.authorization
          );

          /**
           * from websocket client
           */
        } else if (args.connection) {
          const { context, Authorization } = args.connection;

          if (context && context.currentUser) {
            return context;
          }

          currentUser = await getUserFromRequest(
            connection,
            secret,
            Authorization
          );
        }

        return {
          connection,
          secret,
          currentUser
        };
      }
    },

    subscriptions: {
      onConnect: async function onConnect(connectionParameters: {
        Authorization?: string;
      }) {
        const currentUser = await getUserFromRequest(
          connection,
          secret,
          connectionParameters.Authorization
        );

        return {
          connection,
          secret,
          currentUser
        };
      }
    }
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
  connection: Connection,
  secret: string,
  authorization: string = ""
): Promise<User | null> {
  let token = "";
  let prefix = "";

  /**
   * Simply return null in case of any problems
   */

  if (!authorization) {
    return null;
  }

  [prefix, token] = authorization.split(" ");

  if (prefix !== AUTHORIZATION_HEADER_PREFIX || !token) {
    return null;
  }

  /**
   * We will always assume session has expired if any problem arises here
   */
  try {
    const { id: userId } = (await jwt.verify(token, secret)) as { id: string };

    return (await getUserById(connection, userId)) || null;
  } catch (error) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }
}
