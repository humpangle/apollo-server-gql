import { Connection, createConnection } from "typeorm";

import {
  startTestServer,
  ExecuteGraphqlSubscriptionFn,
  CREATE_MESSAGE_MUTATION,
  LIST_MESSAGES_QUERY,
  SUBSCRIBE_TO_NEW_MESSAGE,
  USER_CREATION_DATA,
  DELETE_MESSAGE_MUTATION
} from "./utils";
import { constructServer, AUTHORIZATION_HEADER_PREFIX } from "../apollo-setup";
import {
  CreateMessageMutationArgs,
  MessagesQueryArgs,
  MessageConnection,
  PageInfo,
  MessageEdge,
  MessageCreated,
  DeleteMessageMutationArgs
} from "../apollo.generated";
import { createToken } from "../contexts";
import { createUser } from "../contexts/accounts";
import { Message } from "../entity/message";
import { User } from "../entity/user";
import { insertManyUsers, insertManyMessages } from "../entity/database";

const secret = "secret";
let connection: Connection;
let stopServer: () => void;

afterEach(() => {
  if (stopServer) {
    stopServer();
  }

  if (connection) {
    connection.close();
  }
});

describe("Message mutation", () => {
  it("creates message successfully", async () => {
    const { user, doQuery, subscribe } = await setUp({ subscription: true });

    const subscription = subscribe({
      query: SUBSCRIBE_TO_NEW_MESSAGE
    });

    const variables: CreateMessageMutationArgs = {
      input: {
        content: "yes"
      }
    };

    const result = await doQuery({
      query: CREATE_MESSAGE_MUTATION,

      variables
    });

    const { createMessage: message } = result.data as {
      createMessage: Message;
    };

    expect(+message.user.id).toBe(user.id);
    expect(message.content).toBe("yes");

    /**
     * Check that message.insertedAt is a valid date string.
     * This test should run in less than two years (smile emoji)
     */
    expect(
      new Date().getFullYear() - new Date(message.insertedAt).getFullYear()
    ).toBeLessThan(2);

    expect(typeof +message.id).toBe("number");

    const {
      data: {
        messageCreated: { message: subscriptionResult }
      }
    } = (await subscription) as {
      data: {
        messageCreated: MessageCreated;
      };
    };

    expect(subscriptionResult).toMatchObject({
      id: message.id,
      content: message.content
    } as Message);
  });

  it("deletes message successfully", async () => {
    const { user, doQuery } = await setUp();

    const [message] = (await insertManyMessages(connection, {
      content: "yes 1",
      user
    })) as Message[];

    const variables: DeleteMessageMutationArgs = {
      id: "" + message.id
    };

    const result = await doQuery({
      query: DELETE_MESSAGE_MUTATION,

      variables
    });

    const { deleteMessage: deleteResult } = result.data as {
      deleteMessage: boolean;
    };

    expect(deleteResult).toBe(true);
  });
});

describe("messages query", () => {
  it("lists messages", async () => {
    const { user: user1, doQuery } = await setUp();

    const userId = "" + user1.id;

    const [user2] = (await insertManyUsers(
      connection,

      {
        ...USER_CREATION_DATA,
        username: "locust",
        email: "b@b.com",
        passwordHash: "1111111"
      }
    )) as User[];

    await insertManyMessages(
      connection,
      { content: "yes 1", user: user2 },
      { content: "yes 2", user: user1 },
      { content: "yes 3", user: user2 },
      { content: "yes 4", user: user1 },
      { content: "yes 5", user: user1 }
    );

    const variables: MessagesQueryArgs = {
      input: {
        first: 2
      }
    };

    const result = await doQuery({
      query: LIST_MESSAGES_QUERY,

      variables
    });

    const {
      messages: { edges, pageInfo }
    } = result.data as { messages: MessageConnection };

    const receivedMessages = [
      { content: "yes 2", user: user1 },
      { content: "yes 4", user: user1 }
    ];

    edges.forEach((edge, index) => {
      const { node } = edge as MessageEdge;

      const { user, content } = node as Message;

      expect(user.id).toBe(userId);

      expect(content).toBe(receivedMessages[index].content);
    });

    expect(pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false
    } as PageInfo);
  });
});

async function setUp({ subscription }: { subscription?: boolean } = {}) {
  connection = await createConnection();

  const user = await createUser(
    { ...USER_CREATION_DATA, username: "bees" },
    connection
  );

  const { stop, doQuery, doSubscription } = await startTestServer(
    constructServer(connection, secret),

    {
      headers: {
        Authorization: `${AUTHORIZATION_HEADER_PREFIX} ${await createToken(
          user.id,
          secret
        )}`
      }
    },

    { subscription }
  );

  stopServer = stop;

  const subscribe = doSubscription as ExecuteGraphqlSubscriptionFn;

  return { user, subscribe, doQuery };
}
