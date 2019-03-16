const DB_ERROR_PATTERN = /^.+?\((.+?)\)=\(.+?\)\s*(.+)$/;

export const EMAIL_INVALID_FORMAT_ERROR = "has invalid format";

export function normalizeDbError(errorString: string) {
  const exec = DB_ERROR_PATTERN.exec(errorString);

  if (exec) {
    const [, field, error] = exec;
    return JSON.stringify({ [field]: error });
  }

  return "";
}
