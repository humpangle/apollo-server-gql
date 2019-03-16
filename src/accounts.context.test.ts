import { createConnection, Connection } from "typeorm";

import { dbConnectionOptions } from "./typeorm.config";
import { createUser } from "./accounts.context";
import { EMAIL_INVALID_FORMAT_ERROR } from "./context.utils";

describe("user context", () => {
  let connection: Connection;

  beforeEach(async () => {
    connection = await createConnection(dbConnectionOptions);
  });

  afterEach(() => {
    connection.close();
  });

  it("creates user successfully", async () => {
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
    await createUser(
      {
        username: "123456",
        password: "123456",
        email: "a@b.com"
      },
      connection
    );

    expect.assertions(1);

    return createUser(
      {
        username: "123456",
        password: "123456",
        email: "b@b.com"
      },
      connection
    ).catch(e => {
      expect(e.message).toMatch("already exists");
    });
  });

  it("throws error if email not unique", async () => {
    await createUser(
      {
        username: "123456",
        password: "123456",
        email: "a@b.com"
      },
      connection
    );

    expect.assertions(1);

    return createUser(
      {
        username: "234567",
        password: "234567",
        email: "a@b.com"
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
        username: "123456",
        password: "123456",
        email: "a@bb."
      },
      connection
    ).catch(e => {
      expect(e.message).toMatch(expectedError);
    });
  });
});
