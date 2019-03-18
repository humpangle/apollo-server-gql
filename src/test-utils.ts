import { ApolloServer, PubSub } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { HttpLink } from "apollo-link-http";
import { execute, toPromise, GraphQLRequest, FetchResult } from "apollo-link";
import fetch from "node-fetch";
import Observable from "zen-observable-ts";

import { OurContext, typeDefsAndResolvers } from "./apollo-setup";
import { Server } from "http";

interface ConstructTestServerArgs {
  context?: Partial<OurContext>;
}

export const constructTestServer = ({
  context = {} as OurContext
}: ConstructTestServerArgs = {}) => {
  const server = new ApolloServer({
    ...typeDefsAndResolvers,

    context: {
      connection: {},
      secret: "secret",
      pubSub: ({ publish: jest.fn() } as unknown) as PubSub,
      ...context
    } as OurContext
  });

  return { server, ...createTestClient(server) };
};

export async function startTestServer({
  webServer,
  GRAPHQL_PATH
}: {
  webServer: Server;
  GRAPHQL_PATH: string;
}) {
  await webServer.listen(4996);

  const link = new HttpLink({
    uri: "http://localhost:4996" + GRAPHQL_PATH,
    fetch
  });

  return {
    link,

    stop: () => webServer.close(),

    graphql: function executeOperation({
      query,
      variables = {}
    }: GraphQLRequest) {
      return execute(link, { query, variables });
    }
  };
}

export type ExecuteGraphqlFn = (
  params: GraphQLRequest
) => Observable<
  FetchResult<
    {
      [key: string]: any;
    },
    Record<string, any>,
    Record<string, any>
  >
>;

export const toGraphQlPromise = toPromise;
