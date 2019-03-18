import { Connection } from "typeorm";

import { loginUser, INVALID_LOGIN_INPUT_ERROR } from "./login-user";
import { LoginInput } from "../../apollo.generated";

jest.mock("../../entity/database");

import { getOneUser, verifyHashSync } from "../../entity/database";

let connection = ({} as unknown) as Connection;
const mockGetOneUser = getOneUser as jest.Mock;
const mockVerifyHashSync = verifyHashSync as jest.Mock;

it("throws error if username and email not given", () => {
  expect.assertions(1);

  loginUser({} as LoginInput, connection).catch(error => {
    expect(error.message).toMatch(INVALID_LOGIN_INPUT_ERROR);
  });
});

it("throws error if user not found", () => {
  mockGetOneUser.mockResolvedValue(null);

  expect.assertions(1);

  loginUser({} as LoginInput, connection).catch(error => {
    expect(error.message).toMatch(INVALID_LOGIN_INPUT_ERROR);
  });
});

it("throws error if password incorrect", () => {
  mockVerifyHashSync.mockReturnValue(false);

  mockGetOneUser.mockResolvedValue({
    passwordHash: "12345"
  });

  expect.assertions(1);

  loginUser(
    { password: "123456", email: "a@b.com" } as LoginInput,
    connection
  ).catch(error => {
    expect(error.message).toMatch(INVALID_LOGIN_INPUT_ERROR);
  });
});
