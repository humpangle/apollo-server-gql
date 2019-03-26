import { Connection } from "typeorm";

import {
  createUser,
  loginUser,
  INVALID_LOGIN_INPUT_ERROR
} from "../contexts/accounts";
import { EMAIL_INVALID_FORMAT_ERROR } from "../contexts";
import { User } from "../entity/user";
import { USER_CREATION_DATA } from "./utils";
import { LoginInput } from "../apollo.generated";

jest.mock("../entity/database");

import { saveUser, getOneUser, verifyHashSync } from "../entity/database";

const mockSave = saveUser as jest.Mock;
const mockGetOneUser = getOneUser as jest.Mock;
const mockVerifyHashSync = verifyHashSync as jest.Mock;
const connection = ({} as unknown) as Connection;

describe("createUser", () => {
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
      expect(e.message).toMatch(
        JSON.stringify({ username: "already exists." })
      );
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
});

describe("loginUser", () => {
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
});
