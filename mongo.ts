import { MongoClient, Db } from "mongodb";
import bcrypt from "bcrypt";
import { User } from "./types";

import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(MONGODB_URI);

let db: Db;
const saltRounds = 10;

export async function connectionMongoDB() {
  await client.connect();
  db = client.db("kledingwinkel");
  console.log("verbonden met de database");
  return db;
}
export async function closeConnection() {
  await client.close();
  console.log("verbinding MongoDB gesloten.");
}

export async function createInitialUser() {
  const userCollection = db.collection<User>("users");

  if ((await userCollection.countDocuments()) > 0) {
    return;
  }

  let adminUsername = process.env.ADMIN_USERNAME;
  let adminPassword = process.env.ADMIN_PASSWORD;
  let userUsername = process.env.USER_USERNAME;
  let userPassword = process.env.USER_PASSWORD;

  if (!adminUsername || !adminPassword || !userUsername || !userPassword) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_PASSWORD, USER_USERNAME and USER_PASSWORD must be set in environment"
    );
  }

  await userCollection.insertMany([
    {
      username: adminUsername,
      password: await bcrypt.hash(adminPassword, saltRounds),
      role: "ADMIN",
    },
    {
      username: userUsername,
      password: await bcrypt.hash(userPassword, saltRounds),
      role: "USER",
    },
  ]);

  console.log("Default admin and user created");
}

export async function login(username: string, password: string) {
  const userCollection = db.collection<User>("users"); // collectie wordt opgehaald

  let user: User | null = await userCollection.findOne<User>({
    username: username,
  });

  if (user) {
    if (await bcrypt.compare(password, user.password!)) {
      return user;
    } else {
      throw new Error("Password incorrect");
    }
  } else {
    throw new Error("User not found");
  }
}
