import { IResolvers } from "./apollo.generated";
import { getUserBy, createUser, createToken } from "./accounts.context";
import { PubSubMessage } from "./apollo.utils";

export const userResolver = {
  Query: {
    me: (parent, args, context) => {
      return getUserBy(args, context);
    }
  },

  Mutation: {
    createUser: async (parent, { input: args }, context) => {
      const { secret, pubSub, connection } = context;

      const user = await createUser(args, connection);

      user.jwt = await createToken(user, secret);

      pubSub.publish(PubSubMessage.userAdded, {
        [PubSubMessage.userAdded]: user
      });

      return user;
    }
  }
} as IResolvers;
