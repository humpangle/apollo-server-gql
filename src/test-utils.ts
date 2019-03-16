import { ApolloServer, PubSub } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";

import { Context, typeDefsAndResolvers } from "./apollo.utils";

interface ConstructTestServerArgs {
  context?: Partial<Context>;
}

export const constructTestServer = ({
  context = {} as Context
}: ConstructTestServerArgs = {}) => {
  const server = new ApolloServer({
    ...typeDefsAndResolvers,

    context: {
      connection: {},
      secret: "secret",
      pubSub: ({ publish: jest.fn() } as unknown) as PubSub,
      ...context
    } as Context
  });

  return { server, ...createTestClient(server) };
};
