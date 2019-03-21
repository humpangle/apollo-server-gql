import { IResolvers } from "../apollo.generated";

export const interfacesResolvers = {
  Query: {},

  Node: {
    __resolveType() {
      return {} as any;
    }
  },

  Connection: {
    __resolveType() {
      return {} as any;
    }
  }
} as IResolvers;
