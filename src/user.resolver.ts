import { IResolvers } from "./apollo.generated";
import { createUser } from "./contexts/accounts/create-user";
import { createToken } from "./context.utils";
import { PubSubMessage } from "./apollo.utils";

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
    }
  }
} as IResolvers;
