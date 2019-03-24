import { PubSub } from "apollo-server-express";

export enum PubSubMessage {
  userAdded = "userAdded",

  messageCreated = "MESSAGE_CREATED"
}

export const pubsub = new PubSub();
export default pubsub;
