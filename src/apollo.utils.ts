import { Connection } from "typeorm";
import { PubSub } from "apollo-server-express";
import { User } from "./entity/user";

export interface Context {
  connection: Connection;
  pubSub: PubSub;
  secret: string;
  currentUser?: User | null;
}

export enum PubSubMessage {
  userAdded = "userAdded"
}
