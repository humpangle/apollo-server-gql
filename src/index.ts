import cors from "cors";
import express from "express";
import logger from "morgan";
import { ApolloServer, PubSub } from "apollo-server-express";
import { createServer } from "http";
import { createConnection } from "typeorm";

import { dbConnectionOptions } from "./typeorm.config";
import { Context, typeDefsAndResolvers } from "./apollo.utils";

createConnection(dbConnectionOptions)
  .then(async connection => {
    const PORT = process.env.PORT;

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(logger("dev"));

    const apollo = new ApolloServer({
      ...typeDefsAndResolvers,

      introspection: process.env.NODE_ENV === "development",

      playground: process.env.NODE_ENV === "development",

      context: async () => {
        const context: Context = {
          connection,
          secret: process.env.SECRET || "x",
          pubSub: new PubSub()
        };

        return context;
      }
    });

    apollo.applyMiddleware({
      app,
      path: "/graphql"
    });

    // Wrap the Express server
    const ws = createServer(app);

    apollo.installSubscriptionHandlers(ws);

    ws.listen(PORT, () => {
      console.log(`Apollo Server is now running on http://localhost:${PORT}`);
    });
  })
  .catch(error => console.log(error));
