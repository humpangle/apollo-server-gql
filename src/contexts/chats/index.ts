import { Connection } from "typeorm";

import { CreateMessageInput } from "../../apollo.generated";
import { User, UserObject } from "../../entity/user";
import { Message } from "../../entity/message";
import { saveMessage, validateAssociates } from "../../entity/database";
import { validate } from "class-validator";
import { formatValidationErrors } from "../../entity/validators";

export async function createMessage(
  params: CreateMessageInput,
  connection: Connection,
  sender: User | UserObject
) {
  const message = new Message({
    ...params,
    sender
  });

  const validationErrors = await validate(message, {
    validationError: { target: false }
  });

  if (validationErrors.length) {
    throw new Error(JSON.stringify(formatValidationErrors(validationErrors)));
  }

  const associationErrors = await validateAssociates(connection, {
    type: User,
    data: <User>sender,
    field: "sender"
  });

  if (associationErrors[0]) {
    throw new Error(JSON.stringify(associationErrors[1]));
  }

  return saveMessage(connection, message);
}
