import { Connection, createConnection } from "typeorm";

import { startTestServer, toGraphQlPromise } from "../test-utils";
import { constructServer, AUTHORIZATION_HEADER_PREFIX } from "../apollo-setup";
import {
  CREATE_MESSAGE_MUTATION,
  LIST_MESSAGES_QUERY
  // SUBSCRIBE_TO_NEW_MESSAGE
} from "../contexts/chats/chats-test.utils";
import {
  CreateMessageMutationArgs,
  MessagesQueryArgs,
  MessageConnection,
  PageInfo,
  MessageEdge
} from "../apollo.generated";
import { createToken } from "../contexts";
import { createUser } from "../contexts/accounts";
import { USER_CREATION_DATA } from "../contexts/accounts/accounts-test-utils";
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

describe("Create message mutation", () => {
  it("creates message successfully", async () => {
    const { user, doQuery } = await setUp();

    // doSubscription({
    //   query: SUBSCRIBE_TO_NEW_MESSAGE
    // });

    const variables: CreateMessageMutationArgs = {
      input: {
        content: "yes"
      }
    };

    const result = await toGraphQlPromise(
      doQuery({
        query: CREATE_MESSAGE_MUTATION,

        variables
      })
    );

    const { createMessage: message } = <{ createMessage: Message }>result.data;

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

    const result = await toGraphQlPromise(
      doQuery({
        query: LIST_MESSAGES_QUERY,

        variables
      })
    );

    const {
      messages: { edges, pageInfo }
    } = <{ messages: MessageConnection }>result.data;

    const receivedMessages = [
      { content: "yes 2", user: user1 },
      { content: "yes 4", user: user1 }
    ];

    edges.forEach((edge, index) => {
      const { node } = <MessageEdge>edge;

      const { user, content } = <Message>node;

      expect(user.id).toBe(userId);

      expect(content).toBe(receivedMessages[index].content);
    });

    expect(pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false
    } as PageInfo);
  });
});

async function setUp() {
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
          user,
          secret
        )}`
      }
    }
  );

  stopServer = stop;

  return { user, doSubscription, doQuery };
}
