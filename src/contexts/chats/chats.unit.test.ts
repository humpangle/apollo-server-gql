import { createConnection, Connection } from "typeorm";
import { dbConnectionOptions } from "../../typeorm.config";
import { createMessage, listMessages } from ".";
import {
  CreateMessageInput,
  PageInfo,
  ConnectionInput
} from "../../apollo.generated";
import { User } from "../../entity/user";
import { createUser } from "../accounts";
import { USER_CREATION_DATA } from "../accounts/accounts-test-utils";
import { insertManyUsers, insertManyMessages } from "../../entity/database";

let connection: Connection;

beforeEach(async () => {
  connection = await createConnection(dbConnectionOptions);
});

afterEach(() => {
  if (connection) {
    connection.close();
  }
});

describe("create message", () => {
  it("returns error if associated user has no id", async () => {
    const MESSAGE_CREATION_DATA: CreateMessageInput = {
      content: "yes sir"
    };

    try {
      await createMessage(MESSAGE_CREATION_DATA, connection, {} as User);
    } catch (error) {
      expect(error.message).toMatch(
        JSON.stringify({
          user: "not found."
        })
      );
    }
  });

  it("returns error if associated user not found", async () => {
    const MESSAGE_CREATION_DATA: CreateMessageInput = {
      content: "yes sir"
    };

    try {
      await createMessage(MESSAGE_CREATION_DATA, connection, { id: 0 } as User);
    } catch (error) {
      expect(error.message).toMatch(
        JSON.stringify({
          user: "not found."
        })
      );
    }
  });

  it("returns error if content too short", async () => {
    const MESSAGE_CREATION_DATA: CreateMessageInput = {
      content: ""
    };

    const user = await createUser(USER_CREATION_DATA, connection);

    try {
      await createMessage(MESSAGE_CREATION_DATA, connection, user);
    } catch (error) {
      expect(error.message).toMatch(
        JSON.stringify({
          content: "is required."
        })
      );
    }
  });

  it("creates message successfully", async () => {
    const MESSAGE_CREATION_DATA: CreateMessageInput = {
      content: "some nice message"
    };

    const user = await createUser(USER_CREATION_DATA, connection);

    const message = await createMessage(
      MESSAGE_CREATION_DATA,
      connection,
      user
    );

    expect(typeof message.id).toBe("number");
    expect(message.user.id).toBe(user.id);
  });
});

describe("list messages", () => {
  it("paginates forward", async () => {
    const [user1, user2] = (await insertManyUsers(
      connection,

      {
        ...USER_CREATION_DATA,

        passwordHash: "1111111"
      },

      {
        ...USER_CREATION_DATA,
        username: "234567",
        email: "b@b.com",
        passwordHash: "1111111"
      }
    )) as User[];

    const messages = await insertManyMessages(
      connection,
      { content: "yes 1", user: user2 },
      { content: "yes 2", user: user1 },
      { content: "yes 3", user: user2 },
      { content: "yes 4", user: user1 },
      { content: "yes 5", user: user2 }
    );

    const paginationArgs: ConnectionInput = {};

    const { edges: edges1, pageInfo: pageInfo1 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    /**
     * should return MAX_LIMITS IF paginationArgs is undefined or empty map
     */
    expect(edges1.length).toBe(5);

    const {
      node: { userId: userId1, id: id1 },
      cursor: cursor1
    } = edges1[2];

    const message2 = messages[2];

    expect(id1).toBe(message2.id);
    expect(userId1).toBe(user2.id);

    const expectedPageInfo1: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: false
    };

    expect(pageInfo1).toMatchObject(expectedPageInfo1);

    paginationArgs.after = cursor1; // we start at yes 3 message
    paginationArgs.first = 1;

    const { edges: edges2, pageInfo: pageInfo2 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    expect(edges2.length).toBe(1);

    const {
      node: { userId: userId2, id: id2 },
      cursor: cursor2
    } = edges2[0];

    const message3 = messages[3];

    expect(id2).toBe(message3.id);
    expect(userId2).toBe(user1.id);

    const expectedPageInfo2: PageInfo = {
      hasNextPage: true,
      hasPreviousPage: true
    };

    expect(pageInfo2).toMatchObject(expectedPageInfo2);

    paginationArgs.after = cursor2;
    paginationArgs.first = 5000;

    const { edges: edges3, pageInfo: pageInfo3 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    const {
      node: { userId: userId3, id: id3 },
      cursor: cursor3
    } = edges3[0];

    const message4 = messages[4];

    expect(id3).toBe(message4.id);
    expect(userId3).toBe(user2.id);

    const expectedPageInfo3: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: true
    };

    expect(pageInfo3).toMatchObject(expectedPageInfo3);

    paginationArgs.after = cursor3;

    const { edges: edges4, pageInfo: pageInfo4 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    expect(edges4).toEqual([]);

    expect(pageInfo4).toMatchObject({
      hasNextPage: false,

      hasPreviousPage: true
    } as PageInfo);
  });

  it("paginates backwards", async () => {
    const [user1, user2] = (await insertManyUsers(
      connection,

      {
        ...USER_CREATION_DATA,

        passwordHash: "1111111"
      },

      {
        ...USER_CREATION_DATA,
        username: "234567",
        email: "b@b.com",
        passwordHash: "1111111"
      }
    )) as User[];

    const messages = await insertManyMessages(
      connection,
      { content: "yes 1", user: user2 },
      { content: "yes 2", user: user1 },
      { content: "yes 3", user: user2 },
      { content: "yes 4", user: user1 },
      { content: "yes 5", user: user2 }
    );

    const paginationArgs: ConnectionInput = {
      last: 4
    };

    const { edges: edges1, pageInfo: pageInfo1 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    /**
     * if you don't specify before or after cursor, we always get total number
     * of firs/last/MAX_LIMIT
     */
    expect(edges1.length).toBe(4);

    const {
      node: { userId: userId1, id: id1 },
      cursor: cursor1
    } = edges1[3];

    const message3 = messages[3];

    expect(id1).toBe(message3.id);
    expect(userId1).toBe(user1.id);

    const expectedPageInfo1: PageInfo = {
      hasNextPage: true,
      hasPreviousPage: false
    };

    expect(pageInfo1).toMatchObject(expectedPageInfo1);

    paginationArgs.last = 2;
    paginationArgs.before = cursor1;

    const { edges: edges2, pageInfo: pageInfo2 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    const [
      {
        node: { id: id2 },
        cursor: cursor2
      },

      {
        node: { id: id3 }
        // cursor: cursor2
      }
    ] = edges2;

    let message1 = messages[1];
    let message2 = messages[2];

    expect(id2).toBe(message1.id);
    expect(id3).toBe(message2.id);

    const expectedPageInfo2: PageInfo = {
      hasNextPage: true,
      hasPreviousPage: true
    };

    expect(pageInfo2).toMatchObject(expectedPageInfo2);

    /**
     * before message 2 and last > 1 = message 1
     */

    paginationArgs.last = undefined; // will get maximum limit
    paginationArgs.before = cursor2;

    const { edges: edges3, pageInfo: pageInfo3 } = await listMessages(
      connection,
      null,
      paginationArgs
    );

    const {
      node: { id: id4 }
    } = edges3[0];

    const message0 = messages[0];

    expect(id4).toBe(message0.id);

    const expectedPageInfo3: PageInfo = {
      hasNextPage: false,
      hasPreviousPage: true
    };

    expect(pageInfo3).toMatchObject(expectedPageInfo3);
  });
});
