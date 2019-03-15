import { Connection } from "typeorm";
import { PubSub } from "apollo-server-express";

export interface Context {
  connection: Connection;
  pubSub: PubSub;
  secret: string;
}
