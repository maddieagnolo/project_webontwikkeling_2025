"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGODB_URI = void 0;
exports.connectionMongoDB = connectionMongoDB;
exports.closeConnection = closeConnection;
exports.createInitialUser = createInitialUser;
exports.login = login;
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.MONGODB_URI = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "mongodb://localhost:27017";
const client = new mongodb_1.MongoClient(exports.MONGODB_URI);
let db;
const saltRounds = 10;
async function connectionMongoDB() {
    await client.connect();
    db = client.db("kledingwinkel");
    console.log("verbonden met de database");
    return db;
}
async function closeConnection() {
    await client.close();
    console.log("verbinding MongoDB gesloten.");
}
async function createInitialUser() {
    const userCollection = db.collection("users");
    if ((await userCollection.countDocuments()) > 0) {
        return;
    }
    let adminUsername = process.env.ADMIN_USERNAME;
    let adminPassword = process.env.ADMIN_PASSWORD;
    let userUsername = process.env.USER_USERNAME;
    let userPassword = process.env.USER_PASSWORD;
    if (!adminUsername || !adminPassword || !userUsername || !userPassword) {
        throw new Error("ADMIN_USERNAME, ADMIN_PASSWORD, USER_USERNAME and USER_PASSWORD must be set in environment");
    }
    await userCollection.insertMany([
        {
            username: adminUsername,
            password: await bcrypt_1.default.hash(adminPassword, saltRounds),
            role: "ADMIN",
        },
        {
            username: userUsername,
            password: await bcrypt_1.default.hash(userPassword, saltRounds),
            role: "USER",
        },
    ]);
    console.log("Default admin and user created");
}
async function login(username, password) {
    const userCollection = db.collection("users"); // collectie wordt opgehaald
    let user = await userCollection.findOne({
        username: username,
    });
    if (user) {
        if (await bcrypt_1.default.compare(password, user.password)) {
            return user;
        }
        else {
            throw new Error("Password incorrect");
        }
    }
    else {
        throw new Error("User not found");
    }
}
