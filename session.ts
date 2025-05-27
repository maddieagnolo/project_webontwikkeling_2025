import { MONGODB_URI } from "./mongo";
import session, { MemoryStore } from "express-session";
import { User } from "./types";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  databaseName: "login-express",
});

declare module "express-session" {
  export interface SessionData {
    user?: User;
  }
}

export default session({
  secret: process.env.SESSION_SECRET ?? "geheime-sessie-sleutelt",
  store: mongoStore,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
});
