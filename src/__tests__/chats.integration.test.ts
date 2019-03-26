import { GraphQLError } from "graphql";

import {
  NOT_AUTHENTICATED_AS_USER_ERROR,
  NOT_AUTHENTICATED_AS_OWNER_ERROR,
  MESSAGE_NOT_FOUND_ERROR
} from "../resolvers/resolvers";
import {
  CreateMessageMutationArgs,
  MessagesQueryArgs,
  DeleteMessageMutationArgs
} from "../apollo.generated";
import {
  constructTestServer,
  CREATE_MESSAGE_MUTATION,
  LIST_MESSAGES_QUERY,
  DELETE_MESSAGE_MUTATION
} from "./utils";
import { OurContext } from "../apollo-setup";

jest.mock("../entity/database");

import { getOneMessage } from "../entity/database";

const mockGetOneMessage = getOneMessage as jest.Mock;

describe("Message mutation", () => {
  it("returns error if unauthenticated user", async () => {
    const variables: CreateMessageMutationArgs = {
      input: {
        content: "yes"
      }
    };

    const { mutate } = constructTestServer();

    const result = await mutate({
      query: CREATE_MESSAGE_MUTATION,

      variables
      // tslint:disable-next-line: no-any
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_AS_USER_ERROR
    );
  });

  it("returns error if non message owner tries to delete message", async () => {
    mockGetOneMessage.mockResolvedValue({
      id: 5
    });

    const context = {
      currentUser: {}
    } as OurContext;

    const { mutate } = constructTestServer({ context });

    const variables: DeleteMessageMutationArgs = {
      id: "1"
    };

    const result = await mutate({
      query: DELETE_MESSAGE_MUTATION,
      variables
      // tslint:disable-next-line: no-any
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_AS_OWNER_ERROR
    );
  });

  it("returns error if message to be deleted is not found", async () => {
    mockGetOneMessage.mockResolvedValue(null);

    const context = {
      currentUser: {}
    } as OurContext;

    const { mutate } = constructTestServer({ context });

    const variables: DeleteMessageMutationArgs = {
      id: "1"
    };

    const result = await mutate({
      query: DELETE_MESSAGE_MUTATION,
      variables
      // tslint:disable-next-line: no-any
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      MESSAGE_NOT_FOUND_ERROR
    );
  });

  it("returns error if user not authenticated", async () => {
    const { mutate } = constructTestServer({});

    const variables: DeleteMessageMutationArgs = {
      id: "1"
    };

    const result = await mutate({
      query: DELETE_MESSAGE_MUTATION,
      variables
      // tslint:disable-next-line: no-any
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_AS_OWNER_ERROR
    );
  });
});

describe("list messages query", () => {
  it("returns error if unauthenticated user", async () => {
    const { mutate } = constructTestServer();

    const variables: MessagesQueryArgs = {
      input: {}
    };

    const result = await mutate({
      query: LIST_MESSAGES_QUERY,
      variables
      // tslint:disable-next-line: no-any
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_AS_USER_ERROR
    );
  });
});
