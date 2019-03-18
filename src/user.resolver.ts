import { IResolvers } from "./apollo.generated";
import { createUser, loginUser } from "./contexts/accounts";
import { createToken } from "./context.utils";
import { PubSubMessage } from "./apollo-setup";

export const userResolver = {
  Query: {},

  Mutation: {
    createUser: async (parent, { input: args }, context) => {
      const { secret, pubSub, connection } = context;

      const user = await createUser(args, connection);

      user.jwt = await createToken(user, secret);

      pubSub.publish(PubSubMessage.userAdded, {
        [PubSubMessage.userAdded]: user
      });

      return user;
    },

    login: async (parent, { input: args }, context) => {
      const { secret, connection } = context;

      const user = await loginUser(args, connection);

      user.jwt = await createToken(user, secret);

      return user;
    }
  }
} as IResolvers;
