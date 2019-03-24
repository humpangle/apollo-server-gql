import { User, toUserObjectLiteral } from "../entity/user";
import jwt from "jsonwebtoken";

/**
 * 'Key (field_name)=(value) error explanation.'
 */
const DB_ERROR_PATTERN = /^.+?\((.+?)\)=\(.+?\)\s*(.+)$/;

export const EMAIL_INVALID_FORMAT_ERROR = "has invalid format";

/**
 * The errorString returned from typeorm is of the form
 * 'Key (field_name)=(value) error explanation.'
 * (see regex pattern above).
 * We transform it into JSON string from object:
 *  {field_name: 'error explanation'}
 */
export function normalizeDbError(errorString: string) {
  const exec = DB_ERROR_PATTERN.exec(errorString);

  if (exec) {
    const [, fieldName, errorExplanation] = exec;
    return JSON.stringify({ [fieldName]: errorExplanation });
  }

  /* istanbul ignore next: in case we change to another database or orm */
  return "";
}

export async function createToken(
  user: User,
  secret: string,
  expiresIn: string = "30min"
) {
  return await jwt.sign(toUserObjectLiteral(user), secret, { expiresIn });
}
