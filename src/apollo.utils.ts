import "reflect-metadata";
import { Connection } from "typeorm";
import { PubSub, ApolloServerExpressConfig } from "apollo-server-express";
import { importSchema } from "graphql-import";
import { DocumentNode } from "graphql";

import { userResolver } from "./user.resolver";
import { User } from "./entity/user";

export interface Context {
  connection: Connection;
  pubSub: PubSub;
  secret: string;
  currentUser?: User | null;
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
