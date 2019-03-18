import { Connection } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { LoginInput } from "../../apollo.generated";
import { getOneUser, verifyHashSync } from "../../entity/database";

export const INVALID_LOGIN_INPUT_ERROR = "invalid username email or password";

export async function loginUser(params: LoginInput, connection: Connection) {
  const { password, username, email } = params;

  let where = "";
  let queryArgs = {} as { [k in keyof LoginInput]: string };

  if (username) {
    where = "user.username = :username";
    queryArgs.username = username;
  } else if (email) {
    where = "user.email = :email";
    queryArgs.email = email;
  } else {
    throw new UserInputError(INVALID_LOGIN_INPUT_ERROR);
  }

  const user = await getOneUser(connection, where, queryArgs);

  if (!user) {
    throw new UserInputError(INVALID_LOGIN_INPUT_ERROR);
  }

  if (!verifyHashSync(password, user.passwordHash)) {
    throw new UserInputError(INVALID_LOGIN_INPUT_ERROR);
  }

  return user;
}
