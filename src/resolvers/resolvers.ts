import { skip } from "graphql-resolvers";
import { ForbiddenError } from "apollo-server-core";

import { MutationResolvers } from "../apollo.generated";
import { Message } from "../entity/message";

export const NOT_AUTHENTICATED_ERROR = "Not authenticated as user.";

export const isAuthenticated: MutationResolvers.CreateMessageResolver = (
  parent,
  args,
  { currentUser }
) => {
  return ((currentUser
    ? skip
    : new ForbiddenError(NOT_AUTHENTICATED_ERROR)) as unknown) as Message;
};
