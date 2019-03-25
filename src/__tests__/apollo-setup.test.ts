import { Express as AppExpress } from "express";
import { Connection } from "typeorm";

import { createToken } from "../contexts";

jest.mock("../contexts/accounts");

import {
  getUserFromRequest,
  INVALID_SESSION_MESSAGE,
  AUTHORIZATION_HEADER_PREFIX
} from "../apollo-setup";
import { getUserById } from "../contexts/accounts";

const mockGetUserById = getUserById as jest.Mock;
let connection: Connection;

it("returns user if authorization in request headers", async () => {
  const user = { id: 55 };

  mockGetUserById.mockResolvedValue(user);

  const secret = "secret";

  const token = await createToken(user.id, secret);

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX} ${token}`
    }
  } as AppExpress["request"];

  expect.assertions(1);

  return getUserFromRequest(connection, req, secret).then(result => {
    expect(result).toEqual(user);
  });
});

it("returns null if authorization not in request headers", () => {
  const secret = "secret";

  const req = {
    headers: {}
  } as AppExpress["request"];

  expect.assertions(1);

  return getUserFromRequest(connection, req, secret).then(result => {
    expect(result).toBeNull();
  });
});

it("returns null if request.headers.authorization not in correct format", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: "wrong token"
    }
  } as AppExpress["request"];

  expect.assertions(1);

  return getUserFromRequest(connection, req, secret).then(result => {
    expect(result).toBeNull();
  });
});

it("throws expired session error if token is invalid", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX} token`
    }
  } as AppExpress["request"];

  expect.assertions(1);

  return getUserFromRequest(connection, req, secret).catch(error => {
    expect(error.message).toMatch(INVALID_SESSION_MESSAGE);
  });
});

it("returns null if no token present in authorization.headers", () => {
  const secret = "secret";

  const req = {
    headers: {
      authorization: `${AUTHORIZATION_HEADER_PREFIX}      `
    }
  } as AppExpress["request"];

  expect.assertions(1);

  return getUserFromRequest(connection, req, secret).then(result => {
    expect(result).toBeNull();
  });
});
