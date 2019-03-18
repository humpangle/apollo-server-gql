import { Connection } from "typeorm";
import bcrypt from "bcrypt-nodejs";

import { User } from "./user";

export function getOneUser(
  connection: Connection,
  ...queryArgs: any
): Promise<User | undefined> {
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
