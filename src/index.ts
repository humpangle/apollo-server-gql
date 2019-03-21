import { createConnection } from "typeorm";

import { dbConnectionOptions } from "./typeorm.config";
import { constructServer } from "./apollo-setup";

createConnection(dbConnectionOptions)
  .then(async connection => {
    const PORT = process.env.PORT;

    const { webServer } = constructServer(connection, process.env.SECRET || "");

    webServer.listen(PORT, () => {
      console.log(`Apollo Server is now running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch(error => console.log(error));
