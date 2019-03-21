import { combineResolvers } from "graphql-resolvers";

import {
  IResolvers,
  MutationResolvers,
  QueryResolvers
} from "../apollo.generated";
import { isAuthenticated } from "./resolvers";
import { createMessage, listMessages } from "../contexts/chats";
import { UserObject, User } from "../entity/user";
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

const messagesResolver: QueryResolvers.MessagesResolver = async function messagesResolver(
  root,
  { input },
  { connection, currentUser }
) {
  const { edges, pageInfo } = await listMessages(
    connection,
    (currentUser as UserObject).id,
    input
  );

  return {
    pageInfo,
    edges
  };
};

export const messageResolver: IResolvers = {
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,

      createMessageResolver
    )
  },

  Query: {
    messages: combineResolvers(isAuthenticated, messagesResolver)
  },

  Message: {
    user: (parent, args, { currentUser }) => {
      return <User>currentUser;
    }
  }
};
