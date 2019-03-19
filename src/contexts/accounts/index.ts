import { validate } from "class-validator";
import { Connection } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { User } from "../../entity/user";
import { CreateUserInput, LoginInput } from "../../apollo.generated";
import { normalizeDbError } from "..";
import {
  saveUser,
  hashSync,
  getOneUser,
  verifyHashSync
} from "../../entity/database";
import { formatValidationErrors } from "../../entity/validators";

export async function createUser(
  params: CreateUserInput,
  connection: Connection
) {
  const { password } = params;

  const userObj = new User({
    ...params,
    passwordHash: hashSync(password)
  });

  const errors = await validate(userObj, {
    validationError: { target: false }
  });

  if (errors.length > 0) {
    const formattedErrors = formatValidationErrors(errors);

    throw new Error(JSON.stringify(formattedErrors));
  }

  try {
    const user = await saveUser(connection, userObj);
    user.passwordHash = "";
    return user;
  } catch (error) {
    throw new Error(normalizeDbError(error.detail));
  }
}

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
