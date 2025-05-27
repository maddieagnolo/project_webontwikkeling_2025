"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongo_1 = require("./mongo");
const data_1 = require("./data");
const bcrypt_1 = __importDefault(require("bcrypt"));
const session_1 = __importDefault(require("./session"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const saltRounds = 10;
const app = (0, express_1.default)();
app.use(session_1.default);
app.set("view engine", "ejs");
app.use(express_1.default.static("public"));
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
let db;
// Middleware voor authenticatie
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}
function redirectIfAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
}
// Middleware om ingelogde gebruiker beschikbaar te maken in views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});
async function Start() {
    try {
        db = await (0, mongo_1.connectionMongoDB)();
        await (0, data_1.loadData)(db);
        await (0, mongo_1.createInitialUser)();
        app.listen(3000, () => {
            console.log(`Server draait op http://localhost:3000`);
        });
        process.on("SIGINT", async () => {
            console.log("server afsluiten!");
            await (0, mongo_1.closeConnection)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Fout bij starten:", error);
    }
}
Start();
// Routes met requireLogin middleware
app.get("/", requireLogin, async (req, res) => {
    try {
        let clothing = await db
            .collection("clothes")
            .find({})
            .toArray();
        let stores = await db
            .collection("stores")
            .find({})
            .toArray();
        res.render("index", { clothing, stores });
    }
    catch (error) {
        console.error("Fout bij ophalen van data:", error);
        res.status(500).send("Er is iets misgegaan met het laden van de data.");
    }
});
app.get("/clothing/:id", requireLogin, async (req, res) => {
    var _a;
    try {
        const id = Number(req.params.id);
        let clothing = await db
            .collection("clothes")
            .find({})
            .toArray();
        let stores = await db
            .collection("stores")
            .find({})
            .toArray();
        const item = clothing.find((c) => c.id === id);
        if (!item) {
            res.status(404).send("Kledingstuk niet gevonden");
            return;
        }
        const store = stores.find((s) => s.id === item.store.id);
        item.store.name = store ? store.name : "Onbekend";
        const role = ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.role) || null;
        res.render("detail", { item, role });
    }
    catch (error) {
        console.error("Fout bij ophalen detail:", error);
        res
            .status(500)
            .send("Er is iets misgegaan bij het laden van de detailpagina.");
    }
});
app.get("/stores/:id", requireLogin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        let stores = await db
            .collection("stores")
            .find({})
            .toArray();
        const store = stores.find((s) => s.id === id);
        if (!store) {
            res.status(404).send("Winkel niet gevonden");
            return;
        }
        let clothing = await db
            .collection("clothes")
            .find({})
            .toArray();
        const storeClothing = clothing.filter((c) => c.store.id === id);
        res.render("storeDetail", { store, storeClothing });
    }
    catch (error) {
        console.error("Fout bij ophalen winkel detail:", error);
        res
            .status(500)
            .send("Er is iets misgegaan bij het laden van de winkel detailpagina.");
    }
});
app.get("/stores", requireLogin, async (req, res) => {
    let stores = await db.collection("stores").find({}).toArray();
    res.render("stores", { stores });
});
app.get("/clothing/:id/edit", requireLogin, async (req, res) => {
    const id = Number(req.params.id);
    const clothing = await db.collection("clothes").findOne({ id });
    const stores = await db.collection("stores").find({}).toArray();
    if (!clothing) {
        res.status(404).send("Kledingstuk niet gevonden");
        return;
    }
    res.render("clothing-edit", { item: clothing, stores });
});
app.post("/clothing/:id/edit", requireLogin, async (req, res) => {
    const id = Number(req.params.id);
    const { name, price, isAvailable, storeId } = req.body;
    const store = await db
        .collection("stores")
        .findOne({ id: Number(storeId) });
    if (!store) {
        res.status(400).send("Winkel niet gevonden");
        return;
    }
    await db.collection("clothes").updateOne({ id }, {
        $set: {
            name,
            price: Number(price),
            isAvailable: isAvailable === "true" || isAvailable === true,
            store,
        },
    });
    res.redirect(`/clothing/${id}`);
});
// Routes zonder login vereist
app.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});
app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        let user = await (0, mongo_1.login)(username, password);
        delete user.password;
        req.session.user = user;
        res.redirect("/");
    }
    catch (e) {
        res.redirect("/login");
    }
});
app.get("/register", redirectIfAuthenticated, (req, res) => {
    res.render("register");
});
app.post("/register", async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res
            .status(400)
            .render("register", { error: "Wachtwoorden komen niet overeen." });
    }
    try {
        const userCollection = db.collection("users");
        const existingUser = await userCollection.findOne({ username: username });
        if (existingUser) {
            return res
                .status(400)
                .render("register", { error: "Gebruikersnaam bestaat al." });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        await userCollection.insertOne({
            username,
            password: hashedPassword,
            role: "USER",
        });
        res.redirect("/login");
    }
    catch (error) {
        console.error("Fout bij registreren:", error);
        res.status(500).render("register", {
            error: "Er is een fout opgetreden. Probeer het later opnieuw.",
        });
    }
});
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
