import { Connection, EntitySchema, ObjectType } from "typeorm";
import bcrypt from "bcrypt-nodejs";

import { User, UserConstructorArgs } from "./user";
import {
  Message,
  MESSAGE_RAW_PRIMARY_COLUMNS,
  MessageConstructorArgs
} from "./message";

export function getOneUser(connection: Connection, ...queryArgs: any) {
  const [queryString, args] = queryArgs;

  return connection
    .getRepository(User)
    .createQueryBuilder("user")
    .where(queryString, args)
    .getOne();
}

export function verifyHashSync(token: string, tokenHash: string) {
  return bcrypt.compareSync(token, tokenHash);
}

export function saveUser(connection: Connection, userObj: User) {
  return connection.getRepository(User).save(userObj);
}

export function hashSync(token: string) {
  return bcrypt.hashSync(token, bcrypt.genSaltSync(8));
}

export function saveMessage(connection: Connection, messageObject: Message) {
  return connection.getRepository(Message).save(messageObject);
}

interface ValidateAssociateArg<TEntity = {}> {
  type: ObjectType<TEntity> | EntitySchema<TEntity>;

  data: TEntity & { id?: string | number };

  field: string;
}

export async function validateAssociates<TEntity>(
  connection: Connection,
  ...params: ValidateAssociateArg<TEntity>[]
) {
  let hasError = false;
  const errors = <{ [k: string]: string }>{};
  const associates = <{ [k: string]: TEntity }>{};

  for (let i = 0; i < params.length; i++) {
    const {
      type,
      data: { id },
      field
    } = params[i];

    if (id === undefined || id === null) {
      hasError = true;

      errors[field] = "not found.";
    } else {
      const associate = await connection.getRepository(type).findOne();

      if (!associate) {
        hasError = true;

        errors[field] = "not found.";
      } else {
        associates[field] = associate;
      }
    }
  }

  return [hasError, errors, associates];
}

export function getMessages(
  connection: Connection,
  userId?: string | number | null
) {
  return function(offset?: number, limit?: number): Promise<Message[]> {
    const query = connection
      .getRepository(Message)
      .createQueryBuilder("message")
      .select(MESSAGE_RAW_PRIMARY_COLUMNS);

    if (userId) {
      query.where("message.user_id = :userId", { userId: userId });
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    if (limit !== undefined) {
      query.limit(limit);
    }

    return query.getRawMany();
  };
}

export async function insertManyUsers(
  connection: Connection,
  ...args: Array<UserConstructorArgs>
) {
  const result = await connection
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(args)
    .execute();

  return result.generatedMaps;
}

export async function insertManyMessages(
  connection: Connection,
  ...args: Array<MessageConstructorArgs>
) {
  const result = await connection
    .createQueryBuilder()
    .insert()
    .into(Message)
    .values(args)
    .execute();

  return result.generatedMaps;
}
