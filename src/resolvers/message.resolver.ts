import { combineResolvers } from "graphql-resolvers";

import { IResolvers, MutationResolvers } from "../apollo.generated";
import { isAuthenticated } from "./resolvers";
import { createMessage } from "../contexts/chats";
import { UserObject } from "../entity/user";
import { PubSubMessage } from "../apollo-setup";

const createMessageResolver: MutationResolvers.CreateMessageResolver = async function createMessageResolver(
  root,
  { input },
  { connection, currentUser, pubSub }
) {
  const message = await createMessage(input, connection, <UserObject>(
    currentUser
  ));

  pubSub.publish(PubSubMessage.messageCreated, {
    [PubSubMessage.messageCreated]: message
  });

  return message;
};

export const messageResolver: IResolvers = {
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,

      createMessageResolver
    )
  }
};
