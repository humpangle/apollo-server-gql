import { validate } from "class-validator";
import { Connection } from "typeorm";

import { User } from "../../entity/user";
import { CreateUserInput } from "../../apollo.generated";
import { normalizeDbError } from "../../context.utils";
import { saveUser, hashSync } from "../../entity/database";

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
    const user = await saveUser(connection, userObj);
    user.passwordHash = "";
    return user;
  } catch (error) {
    throw new Error(normalizeDbError(error.detail));
  }
}
