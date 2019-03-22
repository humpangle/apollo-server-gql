import { ApolloServer, PubSub } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { HttpLink } from "apollo-link-http";
import { execute, toPromise, GraphQLRequest, FetchResult } from "apollo-link";
import fetch from "node-fetch";
import Observable from "zen-observable-ts";
import { HttpOptions } from "apollo-link-http-common";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";

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

export async function startTestServer(
  {
    webServer,
    GRAPHQL_PATH
  }: {
    webServer: Server;
    GRAPHQL_PATH: string;
  },
  httpOptions: HttpOptions = {}
) {
  await webServer.listen(4996);

  const link = new HttpLink({
    ...httpOptions,
    uri: "http://127.0.0.1:4996" + GRAPHQL_PATH,
    fetch
  });

  const wsClient = new SubscriptionClient(
    "ws://127.0.0.1:4996" + GRAPHQL_PATH,
    { reconnect: true },
    ws
  );

  const wsLink = new WebSocketLink(wsClient);

  return {
    link,

    stop: () => webServer.close(),

    doQuery: function executeOperation(operation: GraphQLRequest) {
      return execute(link, operation);
    },

    fetch,

    wsLink,

    doSubscription: function executeGraphqlSubscription<T>(
      operation: GraphQLRequest
    ) {
      return toPromise(execute(wsLink, operation));
    }
  };
}

export type ExecuteGraphqlQueryFn = (
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
