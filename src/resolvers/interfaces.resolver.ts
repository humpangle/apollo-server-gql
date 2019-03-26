import { IResolvers } from "../apollo.generated";

export const interfacesResolvers = {
  Query: {},

  Node: {
    __resolveType() {
      // tslint:disable-next-line: no-any
      return {} as any;
    }
  },

  Connection: {
    __resolveType() {
      // tslint:disable-next-line: no-any
      return {} as any;
    }
  }
} as IResolvers;
