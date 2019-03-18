import { Express as AppExpress } from "express";

import {
  getUserFromRequest,
  INVALID_SESSION_MESSAGE,
  AUTHORIZATION_HEADER_PREFIX
} from "./apollo-setup";
import { User, UserObject } from "./entity/user";
import { createToken } from "./context.utils";
import { USER_CREATION_DATA } from "./contexts/accounts/accounts-test-utils";

it("returns user if authorization in request headers", async () => {
  const user = new User(USER_CREATION_DATA);

  const secret = "secret";

  const token = await createToken(user, secret);

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX} ${token}`
    }
  } as AppExpress["request"];

  return getUserFromRequest(req, secret).then(result => {
    const userFromToken = result as (UserObject & { exp: number; iat: number });

    const data = { ...USER_CREATION_DATA };
    delete data.password;
    delete userFromToken.exp;
    delete userFromToken.iat;

    expect(result).toEqual(data);
  });
});

it("returns null if authorization not in request headers", () => {
  const secret = "secret";

  const req = {
    headers: {}
  } as AppExpress["request"];

  return getUserFromRequest(req, secret).then(result => {
    expect(result).toBeNull();
  });
});

it("throws expired session error if request.headers.authorization not in correct format", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: "wrong token"
    }
  } as AppExpress["request"];

  return getUserFromRequest(req, secret).catch(error => {
    expect(error.message).toMatch(INVALID_SESSION_MESSAGE);
  });
});

it("throws expired session error if token is invalid", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX} token`
    }
  } as AppExpress["request"];

  return getUserFromRequest(req, secret).catch(error => {
    expect(error.message).toMatch(INVALID_SESSION_MESSAGE);
  });
});

it("throws expired session error if no token preset in headers", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX}      `
    }
  } as AppExpress["request"];

  return getUserFromRequest(req, secret).catch(error => {
    expect(error.message).toMatch(INVALID_SESSION_MESSAGE);
  });
});
