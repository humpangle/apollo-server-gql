import { createConnection, Connection, getConnectionOptions } from "typeorm";
import Graceful from "node-graceful";

import { constructServer } from "./apollo-setup";
import { Server } from "http";
import { TypeORMLogger, logger } from "./winston-logger";

(async function startApplication() {
  try {
    const dbConnectionOptions = await getConnectionOptions();

    const connection = await createConnection(
      Object.assign(dbConnectionOptions, { logger: new TypeORMLogger() })
    );

    const PORT = process.env.PORT || "";

    const { webServer, GRAPHQL_PATH } = constructServer(
      connection,
      process.env.SECRET || "",
      logger
    );

    webServer.listen(PORT, () => {
      console.log(
        `Apollo Server is now running on http://127.0.0.1:${PORT}${GRAPHQL_PATH}`
      );
    });

    const shutdownListener = onShutdownListener(webServer, connection, PORT);

    // Graceful.on("exit", shutdownListener, true); // broken. use SIG* instead
    Graceful.on("SIGTERM", shutdownListener, true);
    Graceful.on("SIGINT", shutdownListener, true);
    Graceful.on("SIGBREAK", shutdownListener, true);
    Graceful.on("SIGHUP", shutdownListener, true);
    Graceful.on("SIGUSR2", shutdownListener, true); // nodemon
    Graceful.on("shutdown", shutdownListener, false); // tests
  } catch (error) {
    console.error(error);
  }
})();

function onShutdownListener(
  server: Server,
  dbConnection: Connection,
  port: string
) {
  return function(done: () => void, event: any, signal: any) {
    console.warn(`!)\tGraceful ${signal} signal received.`);

    return new Promise(resolve => {
      console.warn(`3)\tHTTP & WebSocket servers on port ${port} closing.`);
      return server.close(resolve);
    })

      .then(() => {
        console.warn(`2)\tDatabase connections closing.`);
        return dbConnection.close();
      })
      .then(() => {
        console.warn(`1)\tShutting down. Goodbye!\n`);
        return done();
      })
      .catch(err => {
        console.error("!)\tGraceful termination error\n", err);
        process.exit(1);
      });
  };
}
