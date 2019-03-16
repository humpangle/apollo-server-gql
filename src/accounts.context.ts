import bcrypt from "bcrypt-nodejs";
import { validate } from "class-validator";

import { User } from "./entity/user";
import { MeQueryArgs, CreateUserInput } from "./apollo.generated";
import { Context } from "./apollo.utils";
import { Connection } from "typeorm";
import { normalizeDbError } from "./context.utils";

export function getUserBy(params: MeQueryArgs, { connection }: Context) {
  return connection.getRepository(User).findOne({ where: params });
}

export async function createUser(
  params: CreateUserInput,
  connection: Connection
) {
  const { username, email, password } = params;

  const repo = connection.getRepository(User);

  const userObj = new User({
    username,
    email,
    passwordHash: bcrypt.hashSync(password, bcrypt.genSaltSync(8))
  });

  const errors = await validate(userObj, {
    validationError: { target: false }
  });

  if (errors.length > 0) {
    const formattedErrors = errors.reduce(
      (acc, { property, constraints }) => {
        acc[property] = Object.values(constraints)[0];
        return acc;
      },
      {} as { [k: string]: string }
    );

    throw new Error(JSON.stringify(formattedErrors));
  }

  try {
    const user = await repo.save(userObj);

    user.passwordHash = "";

    return user;
  } catch (error) {
    throw new Error(normalizeDbError(error.detail));
  }
}
