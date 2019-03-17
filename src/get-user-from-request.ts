import { Express as AppExpress } from "express";
import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-core";

export const INVALID_SESSION_MESSAGE =
  "Your session has expired. Please sign in again.";

export const AUTHORIZATION_HEADER_PREFIX = "Bearer";

export async function getUserFromRequest(
  req: AppExpress["request"],
  secret: string
) {
  const {
    headers: { authorization }
  } = req;

  if (!authorization) {
    return null;
  }

  const [prefix, token] = authorization.split(" ");

  if (prefix !== AUTHORIZATION_HEADER_PREFIX) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }

  try {
    return await jwt.verify(token || "", secret);
  } catch (error) {
    throw new AuthenticationError(INVALID_SESSION_MESSAGE);
  }
}
