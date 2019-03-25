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

it("returns user if token is valid", async () => {
  const user = { id: 55 };

  mockGetUserById.mockResolvedValue(user);

  const secret = "secret";

  const token = await createToken(user.id, secret);

  expect.assertions(1);

  return getUserFromRequest(
    connection,
    secret,
    `${AUTHORIZATION_HEADER_PREFIX} ${token}`
  ).then(result => {
    expect(result).toEqual(user);
  });
});

it("returns null if token is undefined", () => {
  const secret = "secret";

  expect.assertions(1);

  return getUserFromRequest(connection, secret, undefined).then(result => {
    expect(result).toBeNull();
  });
});

it("returns null if token not in correct format", () => {
  const secret = "secret";

  expect.assertions(1);

  return getUserFromRequest(connection, secret, "wrong token").then(result => {
    expect(result).toBeNull();
  });
});

it("throws expired session error if token is invalid", () => {
  const secret = "secret";

  expect.assertions(1);

  return getUserFromRequest(
    connection,
    secret,
    `${AUTHORIZATION_HEADER_PREFIX} token`
  ).catch(error => {
    expect(error.message).toMatch(INVALID_SESSION_MESSAGE);
  });
});

it("returns null if no token present in authorization.headers", () => {
  const secret = "secret";

  expect.assertions(1);

  return getUserFromRequest(
    connection,
    secret,
    `${AUTHORIZATION_HEADER_PREFIX}      `
  ).then(result => {
    expect(result).toBeNull();
  });
});
