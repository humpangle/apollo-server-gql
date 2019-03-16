import { IResolvers } from "./apollo.generated";
import { getUserBy, createUser } from "./accounts.context";

export const userResolver = {
  Query: {
    me: (parent, args, context) => {
      return getUserBy(args, context);
    }
  },

  Mutation: {
    createUser: (parent, { input: args }, context) => {
      return createUser(args, context);
    }
  }
} as IResolvers;
