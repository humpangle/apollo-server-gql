import { Connection } from "typeorm";

import { CreateMessageInput, ConnectionInput } from "../../apollo.generated";
import { User } from "../../entity/user";
import {
  Message,
  MESSAGE_RAW_PRIMARY_COLUMNS,
  MESSAGE_ENTITY_PRIMARY_COLUMNS
} from "../../entity/message";
import {
  saveMessage,
  validateAssociates,
  getMessages
} from "../../entity/database";
import { validate } from "class-validator";
import { formatValidationErrors } from "../../entity/validators";
import { paginate } from "../../entity";

export async function createMessage(
  params: CreateMessageInput,
  connection: Connection,
  user: User
) {
  const message = new Message({
    ...params,
    user
  });

  const validationErrors = await validate(message, {
    validationError: { target: false }
  });

  if (validationErrors.length) {
    throw new Error(JSON.stringify(formatValidationErrors(validationErrors)));
  }

  const associationErrors = await validateAssociates(connection, {
    type: User,
    data: <User>user,
    field: "user"
  });

  if (associationErrors[0]) {
    throw new Error(JSON.stringify(associationErrors[1]));
  }

  return saveMessage(connection, message);
}

export async function listMessages(
  connection: Connection,
  userId?: string | number | null,
  args?: ConnectionInput | null
) {
  return paginate<Message>(
    getMessages(connection, userId),

    function transformDataFn(rawDbColumnValues) {
      const messageConstructorAttributes = {} as Message;

      for (let j = 0; j < MESSAGE_RAW_PRIMARY_COLUMNS.length; j++) {
        const rawColumnName = MESSAGE_RAW_PRIMARY_COLUMNS[j] as keyof Message;

        const entityColumnName = MESSAGE_ENTITY_PRIMARY_COLUMNS[
          j
        ] as keyof Message;

        const columnValue = rawDbColumnValues[rawColumnName];

        messageConstructorAttributes[entityColumnName] = columnValue;
      }

      return new Message(messageConstructorAttributes);
    },

    args
  );
}
