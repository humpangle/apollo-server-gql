import { ApolloServer, PubSub } from "apollo-server-express";
import { createTestClient } from "apollo-server-testing";
import { HttpLink } from "apollo-link-http";
import { execute, toPromise, GraphQLRequest, FetchResult } from "apollo-link";
import fetch from "node-fetch";
import { HttpOptions } from "apollo-link-http-common";
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";
import { Server } from "http";
import { AddressInfo } from "net";
import gql from "graphql-tag";

import { OurContext, typeDefsAndResolvers } from "../apollo-setup";
import { CreateUserInput } from "../apollo.generated";

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
  httpOptions: HttpOptions = {},
  options: { subscription?: boolean } = {}
) {
  /**
   * 0 argument means use random port. In case we run tests in parallel, we
   * don't want to hard code a port. We let the server choose any available
   * port.
   */
  const server = await webServer.listen(0);

  const { port } = server.address() as AddressInfo;

  const link = new HttpLink({
    ...httpOptions,
    uri: `http://127.0.0.1:${port}` + GRAPHQL_PATH,
    fetch: fetch as any
  });

  let wsClient: SubscriptionClient;
  let wsLink: WebSocketLink;
  let doSubscription: undefined | ExecuteGraphqlSubscriptionFn;

  if (options.subscription) {
    wsClient = new SubscriptionClient(
      `ws://127.0.0.1:${port}` + GRAPHQL_PATH,
      { reconnect: true },
      ws
    );

    wsLink = new WebSocketLink(wsClient);

    doSubscription = function executeGraphqlSubscription<T>(
      operation: GraphQLRequest
    ) {
      return toPromise(execute(wsLink, operation));
    };
  }

  return {
    link,

    stop: () => {
      webServer.close();

      if (wsClient) {
        wsClient.close();
      }
    },

    doQuery: function executeOperation(operation: GraphQLRequest) {
      return toPromise(execute(link, operation));
    },

    fetch,

    doSubscription: doSubscription
  };
}

export type ExecuteGraphqlQueryFn = (
  params: GraphQLRequest
) => Promise<
  FetchResult<
    {
      [key: string]: any;
    },
    Record<string, any>,
    Record<string, any>
  >
>;

export type ExecuteGraphqlSubscriptionFn = <T>(
  operation: GraphQLRequest
) => Promise<
  FetchResult<
    {
      [key: string]: any;
    },
    Record<string, any>,
    Record<string, any>
  >
>;

export const CREATE_USER = gql`
  mutation CreateAUser($input: CreateUserInput!) {
    createUser(input: $input) {
      jwt
    }
  }
`;

export const USER_CREATION_DATA: CreateUserInput = {
  username: "123456",
  email: "a@b.com",
  password: "123456"
};

export const LOGIN_USER_MUTATION = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      id
      jwt
    }
  }
`;

export const CREATE_MESSAGE_MUTATION = gql`
  mutation CreateAMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      insertedAt
      updatedAt
      user {
        id
      }
    }
  }
`;

export const LIST_MESSAGES_QUERY = gql`
  query ListMessages($input: ConnectionInput) {
    messages(input: $input) {
      edges {
        cursor

        node {
          id
          content
          insertedAt
          updatedAt
          user {
            id
            jwt
          }
        }
      }

      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
`;

export const SUBSCRIBE_TO_NEW_MESSAGE = gql`
  subscription NewMessageSubscription {
    messageCreated {
      message {
        id
        content

        user {
          id
          jwt
        }
      }
    }
  }
`;
