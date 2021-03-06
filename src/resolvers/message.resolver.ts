import { combineResolvers } from "graphql-resolvers";

import {
  IResolvers,
  MutationResolvers,
  QueryResolvers
} from "../apollo.generated";
import { isAuthenticated, isMessageOwner } from "./resolvers";
import { createMessage, listMessages, deleteMessage } from "../contexts/chats";
import { User } from "../entity/user";
import { pubsub, PubSubMessage } from "../subscriptions";
import { getUserById } from "../contexts/accounts";

const createMessageResolver: MutationResolvers.CreateMessageResolver = async function createMessageResolverFunc(
  root,
  { input },
  { connection, currentUser }
) {
  const message = await createMessage(input, connection, currentUser as User);

  pubsub.publish(PubSubMessage.messageCreated, {
    messageCreated: { message }
  });

  return message;
};

const messagesResolver: QueryResolvers.MessagesResolver = async function messagesResolverFunc(
  root,
  { input },
  { connection, currentUser }
) {
  const { edges, pageInfo } = await listMessages(
    connection,
    (currentUser as User).id,
    input
  );

  return {
    pageInfo,
    edges
  };
};

const deleteMessageResolver: MutationResolvers.DeleteMessageResolver = async function deleteMessageResolverFunc(
  root,
  { id },
  { connection }
) {
  return deleteMessage(connection, id);
};

export const messageResolver: IResolvers = {
  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,

      createMessageResolver
    ),

    deleteMessage: combineResolvers(
      isMessageOwner,

      deleteMessageResolver
    )
  },

  Query: {
    messages: combineResolvers(isAuthenticated, messagesResolver)
  },

  Subscription: {
    messageCreated: {
      subscribe: (parent, args, context) => {
        return pubsub.asyncIterator(PubSubMessage.messageCreated);
      }
    }
  },

  Message: {
    user: (parent, args, context) => {
      const { connection } = context;

      return parent.user || getUserById(connection, parent.userId);
    }
  }
};
