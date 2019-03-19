import { createConnection, Connection } from "typeorm";
import { dbConnectionOptions } from "../../typeorm.config";
import { createMessage } from ".";
import { CreateMessageInput } from "../../apollo.generated";
import { User } from "../../entity/user";
import { createUser } from "../accounts";
import { USER_CREATION_DATA } from "../accounts/accounts-test-utils";

let connection: Connection;

beforeEach(async () => {
  connection = await createConnection(dbConnectionOptions);
});

afterEach(() => {
  connection.close();
});

it("returns error if associated sender has no id", async () => {
  const MESSAGE_CREATION_DATA: CreateMessageInput = {
    content: "yes sir"
  };

  try {
    await createMessage(MESSAGE_CREATION_DATA, connection, {} as User);
  } catch (error) {
    expect(error.message).toMatch(
      JSON.stringify({
        sender: "not found."
      })
    );
  }
});

it("returns error if associated sender not found", async () => {
  const MESSAGE_CREATION_DATA: CreateMessageInput = {
    content: "yes sir"
  };

  try {
    await createMessage(MESSAGE_CREATION_DATA, connection, { id: 0 } as User);
  } catch (error) {
    expect(error.message).toMatch(
      JSON.stringify({
        sender: "not found."
      })
    );
  }
});

it("returns error if content too short", async () => {
  const MESSAGE_CREATION_DATA: CreateMessageInput = {
    content: ""
  };

  const user = await createUser(USER_CREATION_DATA, connection);

  try {
    await createMessage(MESSAGE_CREATION_DATA, connection, user);
  } catch (error) {
    expect(error.message).toMatch(
      JSON.stringify({
        content: "is required."
      })
    );
  }
});

it("creates message successfully", async () => {
  const MESSAGE_CREATION_DATA: CreateMessageInput = {
    content: "some nice message"
  };

  const user = await createUser(USER_CREATION_DATA, connection);

  const message = await createMessage(MESSAGE_CREATION_DATA, connection, user);

  expect(typeof message.id).toBe("number");
  expect(message.sender.id).toBe(user.id);
});
