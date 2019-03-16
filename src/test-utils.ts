import { ApolloServer, PubSub } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { Connection } from "typeorm";

import { Context, typeDefsAndResolvers } from "./apollo.utils";

interface ConstructTestServerArgs {
  context?: Partial<Context>;
}

export const constructTestServer = (
  connection: Connection,
  { context = {} as Context }: ConstructTestServerArgs = {}
) => {
  const server = new ApolloServer({
    ...typeDefsAndResolvers,

    context: {
      secret: process.env.SECRET || "",
      pubSub: ({ publish: jest.fn() } as unknown) as PubSub,
      ...context,
      connection
    } as Context
  });

  return { server, ...createTestClient(server) };
};
