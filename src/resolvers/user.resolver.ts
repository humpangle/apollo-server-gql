import { IResolvers } from "../apollo.generated";
import { createUser, loginUser } from "../contexts/accounts";
import { createToken } from "../contexts";
import { pubsub, PubSubMessage } from "../subscriptions";

export const userResolver = {
  Query: {},

  Mutation: {
    createUser: async (parent, { input: args }, context) => {
      const { connection } = context;

      const user = await createUser(args, connection);

      pubsub.publish(PubSubMessage.userAdded, {
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

      return createToken(user.id, secret);
    }
  }
} as IResolvers;
