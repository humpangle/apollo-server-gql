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

  const subscriptionMessage = {
    [PubSubMessage.messageCreated]: { message }
  };

  // tslint:disable-next-line:no-console
  console.log(
    "\n\t\tLogging start\n\n\n\n subscriptionMessage\n",
    subscriptionMessage,
    "\n\n\n\n\t\tLogging ends\n"
  );

  // pubSub.publish(PubSubMessage.messageCreated, subscriptionMessage);

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

  Subscription: {
    messageCreated: {
      subscribe: (parent, args, { pubSub }) => {
        return pubSub.asyncIterator(PubSubMessage.messageCreated);
      }
    }
  },

  Message: {
    user: (parent, args, { currentUser }) => {
      return <User>currentUser;
    }
  }
};
