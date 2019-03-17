import gql from "graphql-tag";
import { GraphQLError } from "graphql";
import { GraphQLResponse } from "graphql-extensions";
import { ApolloError } from "apollo-server-core";

import { constructTestServer } from "../../test-utils";
import { CreateUserMutationArgs } from "../../apollo.generated";
import { User } from "../../entity/user";

jest.mock("./create-user");

import { createUser } from "./create-user";

const CREATE_USER = gql`
  mutation CreateAUser($input: CreateUserInput!) {
    createUser(input: $input) {
      jwt
    }
  }
`;

describe("Mutations", () => {
  it("creates user successfully", async () => {
    const input = {
      username: "123456",
      email: "a@b.com",
      password: "123456"
    };

    const variables: CreateUserMutationArgs = {
      input
    };

    (createUser as jest.Mock).mockReturnValue(Promise.resolve({ ...input }));

    const { mutate } = constructTestServer();

    const result = await mutate({
      mutation: CREATE_USER,
      variables
    } as any);

    expect((result.data as { createUser: User }).createUser.jwt).toBeTruthy();
  });

  it("does not create user but returns error", async () => {
    (createUser as jest.Mock).mockReturnValue(
      Promise.reject(new ApolloError("already exists"))
    );

    const { mutate } = constructTestServer();

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
