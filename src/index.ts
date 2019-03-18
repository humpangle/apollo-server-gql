import { createConnection } from "typeorm";

import { dbConnectionOptions } from "./typeorm.config";
import { constructServer } from "./apollo.utils";

createConnection(dbConnectionOptions)
  .then(async connection => {
    const PORT = process.env.PORT;

    const { webServer } = constructServer(connection, process.env.SECRET || "");

    webServer.listen(PORT, () => {
      console.log(`Apollo Server is now running on http://localhost:${PORT}`);
    });
  })
  .catch(error => console.log(error));
