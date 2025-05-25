import { MongoClient, Db } from "mongodb";

const uri =
  "mongodb+srv://maddieagnolo:YMv52e5m19YwjtXU@cluster0.mqqam5q.mongodb.net/";
const client = new MongoClient(uri);

let db: Db;

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
