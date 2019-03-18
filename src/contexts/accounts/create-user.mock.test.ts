import { Connection } from "typeorm";

import { createUser } from "./create-user";
import { EMAIL_INVALID_FORMAT_ERROR } from "../../context.utils";
import { User } from "../../entity/user";
import { USER_CREATION_DATA } from "./accounts-test-utils";

jest.mock("../../entity/database");

import { saveUser } from "../../entity/database";

const mockSave = saveUser as jest.Mock;

const connection = ({} as unknown) as Connection;

it("creates user successfully", async () => {
  mockSave.mockReturnValue(Promise.resolve(new User(USER_CREATION_DATA)));

  const user = await createUser(USER_CREATION_DATA, connection);

  expect(user.passwordHash).toBe("");
});

it("throws error if username not unique", async () => {
  const error = new Error("") as any;
  error.detail = "Key (username)=(123456) already exists.";

  mockSave.mockRejectedValue(error);

  expect.assertions(1);

  return createUser(USER_CREATION_DATA, connection).catch(e => {
    expect(e.message).toMatch(JSON.stringify({ username: "already exists." }));
  });
});

it("throws error if email not unique", async () => {
  const error = new Error("") as any;
  error.detail = "Key (email)=(a@b.com) already exists.";

  mockSave.mockRejectedValue(error);

  expect.assertions(1);

  return createUser(USER_CREATION_DATA, connection).catch(e => {
    expect(e.message).toMatch(JSON.stringify({ email: "already exists." }));
  });
});

it("throws error if email not properly formatted", async () => {
  const expectedError = JSON.stringify({
    email: EMAIL_INVALID_FORMAT_ERROR
  });

  expect.assertions(1);

  return createUser(
    {
      ...USER_CREATION_DATA,
      email: "a@bb."
    },
    connection
  ).catch(e => {
    expect(e.message).toMatch(expectedError);
  });
});
