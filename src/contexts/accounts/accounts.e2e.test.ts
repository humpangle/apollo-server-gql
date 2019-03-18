import { Connection, createConnection } from "typeorm";
import { GraphQLError } from "graphql";

import { constructServer } from "../../apollo.utils";
import {
  startTestServer,
  ExecuteGraphqlFn,
  toGraphQlPromise
} from "../../test-utils";
import { dbConnectionOptions } from "../../typeorm.config";
import {
  CREATE_USER,
  USER_CREATION_DATA,
  LOGIN_USER_MUTATION
} from "./accounts-test-utils";
import {
  CreateUserMutationArgs,
  LoginMutationArgs
} from "../../apollo.generated";
import { User } from "../../entity/user";
import { createUser } from "./create-user";
import { INVALID_LOGIN_INPUT_ERROR } from "./login-user";

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

  it("logs in user successfully", async () => {
    const user = await createUser(USER_CREATION_DATA, connection);
    /**
     * jwt is only available automatically in resolvers
     */
    expect(user.jwt).toBeUndefined();

    const variables: LoginMutationArgs = {
      input: {
        username: user.username,
        password: USER_CREATION_DATA.password
      }
    };

    const result = await toGraphQlPromise(
      executeGraphql({
        query: LOGIN_USER_MUTATION,
        variables
      })
    );

    const login = (result.data as { login: User }).login;
    expect(login.jwt).toBeTruthy();
    expect(+login.id).toBe(user.id);
  });

  it("returns error if user login does not succeed", async () => {
    const variables: LoginMutationArgs = {
      input: {
        username: "unknown",
        password: "unknown"
      }
    };

    const result = await toGraphQlPromise(
      executeGraphql({
        query: LOGIN_USER_MUTATION,
        variables
      })
    );

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      INVALID_LOGIN_INPUT_ERROR
    );
  });
});
