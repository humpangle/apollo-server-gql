import { Connection, createConnection } from "typeorm";
import { HttpOptions } from "apollo-link-http-common";

import { dbConnectionOptions } from "../../typeorm.config";
import {
  startTestServer,
  ExecuteGraphqlFn,
  toGraphQlPromise
} from "../../test-utils";
import {
  constructServer,
  AUTHORIZATION_HEADER_PREFIX
} from "../../apollo-setup";
import { CREATE_MESSAGE_MUTATION } from "./chats-test.utils";
import { CreateMessageMutationArgs } from "../../apollo.generated";
import { createToken } from "..";
import { createUser } from "../accounts";
import { USER_CREATION_DATA } from "../accounts/accounts-test-utils";
import { Message } from "../../entity/message";

const secret = "secret";
let connection: Connection;
let stopServer: () => void;
let executeGraphql: ExecuteGraphqlFn;

describe("Create message mutation", () => {
  afterEach(() => {
    if (stopServer) {
      stopServer();
    }

    if (connection) {
      connection.close();
    }
  });

  it("creates message successfully", async () => {
    connection = await createConnection(dbConnectionOptions);

    const user = await createUser(
      { ...USER_CREATION_DATA, username: "bees" },
      connection
    );

    await setUp({
      headers: {
        Authorization: `${AUTHORIZATION_HEADER_PREFIX} ${await createToken(
          user,
          secret
        )}`
      }
    });

    const variables: CreateMessageMutationArgs = {
      input: {
        content: "yes"
      }
    };

    const result = await toGraphQlPromise(
      executeGraphql({
        query: CREATE_MESSAGE_MUTATION,

        variables
      })
    );

    const { createMessage: message } = <{ createMessage: Message }>result.data;

    expect(+message.sender.id).toBe(user.id);
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

async function setUp(httpOptions: HttpOptions = {}) {
  const { stop, graphql } = await startTestServer(
    constructServer(connection, secret),
    httpOptions
  );
  stopServer = stop;
  executeGraphql = graphql;
}
