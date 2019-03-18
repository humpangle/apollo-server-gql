import { GraphQLError } from "graphql";
import { GraphQLResponse } from "graphql-extensions";
import { ApolloError } from "apollo-server-core";

import { constructTestServer } from "../../test-utils";
import { CreateUserMutationArgs } from "../../apollo.generated";
import { User } from "../../entity/user";
import { CREATE_USER, USER_CREATION_DATA } from "./accounts-test-utils";

jest.mock("./create-user");

import { createUser } from "./create-user";

describe("Mutations", () => {
  it("creates user successfully", async () => {
    const variables: CreateUserMutationArgs = {
      input: USER_CREATION_DATA
    };

    (createUser as jest.Mock).mockReturnValue(
      Promise.resolve({ ...USER_CREATION_DATA })
    );

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
      input: USER_CREATION_DATA
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
