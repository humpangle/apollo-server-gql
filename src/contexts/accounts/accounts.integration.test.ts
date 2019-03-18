import { GraphQLError } from "graphql";
import { GraphQLResponse } from "graphql-extensions";
import { ApolloError } from "apollo-server-core";

import { constructTestServer } from "../../test-utils";
import {
  CreateUserMutationArgs,
  LoginMutationArgs
} from "../../apollo.generated";
import { User } from "../../entity/user";
import {
  CREATE_USER,
  USER_CREATION_DATA,
  LOGIN_USER_MUTATION
} from "./accounts-test-utils";

jest.mock(".");

import { createUser, loginUser, INVALID_LOGIN_INPUT_ERROR } from ".";

describe("Create user mutations", () => {
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

describe("Login user mutation", () => {
  const mockLoginUser = loginUser as jest.Mock;

  it("returns error", async () => {
    mockLoginUser.mockRejectedValue(new Error(INVALID_LOGIN_INPUT_ERROR));

    const variables: LoginMutationArgs = {
      input: {
        password: "123456"
      }
    };

    const { mutate } = constructTestServer();

    const result = (await mutate({
      mutation: LOGIN_USER_MUTATION,
      variables
    } as any)) as GraphQLResponse;

    expect((result.errors as GraphQLError[])[0].message).toMatch(
      INVALID_LOGIN_INPUT_ERROR
    );
  });

  it("logs in user", async () => {
    const user = new User(USER_CREATION_DATA);
    user.id = 1;
    mockLoginUser.mockResolvedValue(user);

    const variables: LoginMutationArgs = {
      input: {
        password: "123456"
      }
    };

    const { mutate } = constructTestServer();

    const result = (await mutate({
      mutation: LOGIN_USER_MUTATION,
      variables
    } as any)) as GraphQLResponse;

    const {
      login: { id, jwt }
    } = result.data as { login: User };

    expect(id).toBe("1");
    expect(typeof jwt).toBe("string");
  });
});
