import { createConnection, Connection } from "typeorm";

import { createUser } from "../contexts/accounts";
import { EMAIL_INVALID_FORMAT_ERROR } from "../contexts";
import { USER_CREATION_DATA } from "./utils";

describe("user context", () => {
  let connection: Connection;

  beforeEach(async () => {
    connection = await createConnection();
  });

  afterEach(() => {
    connection.close();
  });

  it("creates user successfully", async () => {
    const user = await createUser(USER_CREATION_DATA, connection);

    expect(user.passwordHash).toBe("");
  });

  it("throws error if username not unique", async () => {
    await createUser(USER_CREATION_DATA, connection);

    expect.assertions(1);

    return createUser(
      {
        ...USER_CREATION_DATA,
        email: "b@b.com"
      },
      connection
    ).catch(e => {
      expect(e.message).toMatch("already exists");
    });
  });

  it("throws error if email not unique", async () => {
    await createUser(USER_CREATION_DATA, connection);

    expect.assertions(1);

    return createUser(
      {
        ...USER_CREATION_DATA,
        username: "234567"
      },
      connection
    ).catch(e => {
      expect(e.message).toMatch("already exists");
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
