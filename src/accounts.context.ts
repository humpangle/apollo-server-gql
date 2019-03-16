import bcrypt from "bcrypt-nodejs";
import jwt from "jsonwebtoken";

import { User, toUserObjectLiteral } from "./entity/user";
import { MeQueryArgs, CreateUserInput } from "./apollo.generated";
import { Context, PubSubMessage } from "./apollo.utils";

export function getUserBy(params: MeQueryArgs, { connection }: Context) {
  return connection.getRepository(User).findOne({ where: params });
}

export async function createUser(
  params: CreateUserInput,
  { connection, pubSub, secret }: Context
) {
  const { username, email, password } = params;

  const repo = connection.getRepository(User);

  const user = await repo.save(
    new User({
      username,
      email,
      passwordHash: bcrypt.hashSync(password, bcrypt.genSaltSync(8))
    })
  );

  user.passwordHash = "";
  user.jwt = await createToken(user, secret);

  pubSub.publish(PubSubMessage.userAdded, {
    [PubSubMessage.userAdded]: user
  });

  return user;
}

export async function createToken(
  user: User,
  secret: string,
  expiresIn: string = "30min"
) {
  return await jwt.sign(toUserObjectLiteral(user), secret, { expiresIn });
}
