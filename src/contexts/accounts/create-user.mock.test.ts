import { Connection } from "typeorm";

import { createUser } from "./create-user";
import { EMAIL_INVALID_FORMAT_ERROR } from "../../context.utils";
import { User } from "../../entity/user";

const mockSave = jest.fn();

const connection = ({
  getRepository: () => ({
    save: mockSave
  })
} as unknown) as Connection;

it("creates user successfully", async () => {
  mockSave.mockReturnValue(
    Promise.resolve(
      new User({
        email: "a@b.com",
        username: "123456"
      })
    )
  );

  const user = await createUser(
    {
      username: "123456",
      password: "123456",
      email: "a@b.com"
    },
    connection
  );

  expect(user.passwordHash).toBe("");
});

it("throws error if username not unique", async () => {
  const error = new Error("") as any;
  error.detail = "Key (username)=(123456) already exists.";

  mockSave.mockRejectedValue(error);

  expect.assertions(1);

  return createUser(
    {
      username: "123456",
      password: "123456",
      email: "b@b.com"
    },
    connection
  ).catch(e => {
    expect(e.message).toMatch(JSON.stringify({ username: "already exists." }));
  });
});

it("throws error if email not unique", async () => {
  const error = new Error("") as any;
  error.detail = "Key (email)=(a@b.com) already exists.";

  mockSave.mockRejectedValue(error);

  expect.assertions(1);

  return createUser(
    {
      username: "234567",
      password: "234567",
      email: "a@b.com"
    },
    connection
  ).catch(e => {
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
      username: "123456",
      password: "123456",
      email: "a@bb."
    },
    connection
  ).catch(e => {
    expect(e.message).toMatch(expectedError);
  });
});
