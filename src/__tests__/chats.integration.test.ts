import { GraphQLError } from "graphql";

import { NOT_AUTHENTICATED_ERROR } from "../resolvers/resolvers";
import {
  CreateMessageMutationArgs,
  MessagesQueryArgs
} from "../apollo.generated";
import {
  CREATE_MESSAGE_MUTATION,
  LIST_MESSAGES_QUERY
} from "../contexts/chats/chats-test.utils";
import { constructTestServer } from "../test-utils";

describe("Create message mutation", () => {
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
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_ERROR
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
    } as any);

    expect((result.errors as ReadonlyArray<GraphQLError>)[0].message).toMatch(
      NOT_AUTHENTICATED_ERROR
    );
  });
});
