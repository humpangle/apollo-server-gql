import { skip } from "graphql-resolvers";
import { ForbiddenError } from "apollo-server-core";

import { MutationResolvers } from "../apollo.generated";
import { Message } from "../entity/message";
import { getMessageById } from "../contexts/chats";

export const NOT_AUTHENTICATED_AS_USER_ERROR = "Not authenticated as user.";

export const NOT_AUTHENTICATED_AS_OWNER_ERROR = "Not authenticated as owner.";

export const MESSAGE_NOT_FOUND_ERROR = "Message not found.";

export const isAuthenticated: MutationResolvers.CreateMessageResolver = (
  parent,
  args,
  { currentUser }
) => {
  return ((currentUser
    ? skip
    : new ForbiddenError(
        NOT_AUTHENTICATED_AS_USER_ERROR
      )) as unknown) as Message;
};

export const isMessageOwner: MutationResolvers.DeleteMessageResolver = async (
  parent,
  { id },
  { connection, currentUser }
) => {
  const error = (new ForbiddenError(
    NOT_AUTHENTICATED_AS_OWNER_ERROR
  ) as unknown) as boolean;

  if (!currentUser) {
    return error;
  }

  const message = await getMessageById(connection, id);

  if (!message) {
    return (new ForbiddenError(MESSAGE_NOT_FOUND_ERROR) as unknown) as boolean;
  }

  if (+message.userId !== +currentUser.id) {
    return error;
  }

  return (skip as unknown) as boolean;
};
