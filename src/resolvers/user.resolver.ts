import { IResolvers } from "../apollo.generated";
import { createUser, loginUser } from "../contexts/accounts";
import { createToken } from "../contexts";
import { PubSubMessage } from "../apollo-setup";

export const userResolver = {
  Query: {},

  Mutation: {
    createUser: async (parent, { input: args }, context) => {
      const { pubSub, connection } = context;

      const user = await createUser(args, connection);

      pubSub.publish(PubSubMessage.userAdded, {
        [PubSubMessage.userAdded]: user
      });

      return user;
    },

    login: async (parent, { input: args }, context) => {
      const { connection } = context;

      const user = await loginUser(args, connection);

      return user;
    }
  },

  User: {
    jwt: (user, args, context) => {
      const { secret } = context;

      return createToken(user, secret);
    }
  }
} as IResolvers;
