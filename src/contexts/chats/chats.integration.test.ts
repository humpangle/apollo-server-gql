import { GraphQLError } from "graphql";

import { NOT_AUTHENTICATED_ERROR } from "../../resolvers/resolvers";
import { CreateMessageMutationArgs } from "../../apollo.generated";
import { CREATE_MESSAGE_MUTATION } from "./chats-test.utils";
import { constructTestServer } from "../../test-utils";

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
