import { combineResolvers } from "graphql-resolvers";

import {
  IResolvers,
  MutationResolvers,
  QueryResolvers
} from "../apollo.generated";
import { isAuthenticated } from "./resolvers";
import { createMessage, listMessages } from "../contexts/chats";
import { User } from "../entity/user";
import { pubsub, PubSubMessage } from "../subscriptions";
import { getUserById } from "../contexts/accounts";

const createMessageResolver: MutationResolvers.CreateMessageResolver = async function createMessageResolver(
  root,
  { input },
  { connection, currentUser }
) {
  const message = await createMessage(input, connection, <User>currentUser);

  pubsub.publish(PubSubMessage.messageCreated, {
    messageCreated: { message }
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
    (currentUser as User).id,
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
