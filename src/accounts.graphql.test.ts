import gql from "graphql-tag";
import { createConnection, Connection } from "typeorm";

import { dbConnectionOptions } from "./typeorm.config";
import { constructTestServer } from "./test-utils";
import { CreateUserMutationArgs } from "./apollo.generated";
import { User } from "./entity/user";
import { GraphQLError } from "graphql";
import { GraphQLResponse } from "graphql-extensions";
import { createUser } from "./accounts.context";

const CREATE_USER = gql`
  mutation CreateAUser($input: CreateUserInput!) {
    createUser(input: $input) {
      jwt
    }
  }
`;

let connection: Connection;

beforeEach(async () => {
  connection = await createConnection(dbConnectionOptions);
});

afterEach(() => {
  connection.close();
});

describe("Mutations", () => {
  it("creates user successfully", async () => {
    const { mutate } = constructTestServer(connection);

    const variables: CreateUserMutationArgs = {
      input: {
        username: "123456",
        email: "a@b.com",
        password: "123456"
      }
    };

    const result = await mutate({
      mutation: CREATE_USER,
      variables
    } as any);

    expect((result.data as { createUser: User }).createUser.jwt).toBeTruthy();
  });

  it("does not create user but returns error", async () => {
    await createUser(
      {
        username: "123456",
        password: "123456",
        email: "a@b.com"
      },
      connection
    );

    const { mutate } = constructTestServer(connection);

    const variables: CreateUserMutationArgs = {
      input: {
        username: "123456",
        email: "a@b.com",
        password: "123456"
      }
    };

    const result = (await mutate({
      mutation: CREATE_USER,
      variables
    } as any)) as GraphQLResponse;

    expect((result.errors as GraphQLError[])[0].message).toMatch(
      "already exists"
    );
  });
});
