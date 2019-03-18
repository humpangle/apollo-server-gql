import { Connection, createConnection } from "typeorm";
import { GraphQLError } from "graphql";

import { constructServer } from "../../apollo.utils";
import {
  startTestServer,
  ExecuteGraphqlFn,
  toGraphQlPromise
} from "../../test-utils";
import { dbConnectionOptions } from "../../typeorm.config";
import { CREATE_USER, USER_CREATION_DATA } from "./accounts-test-utils";
import { CreateUserMutationArgs } from "../../apollo.generated";
import { User } from "../../entity/user";
import { createUser } from "./create-user";

let connection: Connection;
let stop: () => void;
let executeGraphql: ExecuteGraphqlFn;

beforeEach(async () => {
  connection = await createConnection(dbConnectionOptions);
  const server = constructServer(connection, "some secret");
  const testServer = await startTestServer(server);
  stop = testServer.stop;
  executeGraphql = testServer.graphql;
});

afterEach(() => {
  if (stop) {
    stop();
  }

  if (connection) {
    connection.close();
  }
});

describe("User mutation", () => {
  it("creates user successfully", async () => {
    const variables: CreateUserMutationArgs = {
      input: USER_CREATION_DATA
    };

    const result = await toGraphQlPromise(
      executeGraphql({
        query: CREATE_USER,
        variables
      })
    );

    expect((result.data as { createUser: User }).createUser.jwt).toBeTruthy();
  });

  it("returns error if username not unique", async () => {
    await createUser(USER_CREATION_DATA, connection);

    const input = {
      ...USER_CREATION_DATA,

      email: "a1@b.com"
    };

    const variables: CreateUserMutationArgs = {
      input
    };

    const result = await toGraphQlPromise(
      executeGraphql({
        query: CREATE_USER,
        variables
      })
    );

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      JSON.stringify({
        username: "already exists."
      })
    );
  });
});
