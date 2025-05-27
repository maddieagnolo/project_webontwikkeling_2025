import express from "express";
import { Clothing, Store, User } from "./types";
import { Db } from "mongodb";
import {
  connectionMongoDB,
  closeConnection,
  createInitialUser,
  login,
} from "./mongo";
import { loadData } from "./data";
import bcrypt from "bcrypt";
import session from "./session";
import dotenv from "dotenv";
dotenv.config();

const saltRounds = 10;
const app = express();

app.use(session);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

let db: Db;

// Middleware voor authenticatie
function requireLogin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function redirectIfAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
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
    db = await connectionMongoDB();
    await loadData(db);
    await createInitialUser();
    app.listen(3000, () => {
      console.log(`Server draait op http://localhost:3000`);
    });

    process.on("SIGINT", async () => {
      console.log("server afsluiten!");
      await closeConnection();
      process.exit(0);
    });
  } catch (error) {
    console.error("Fout bij starten:", error);
  }
}
Start();

// Routes met requireLogin middleware

app.get("/", requireLogin, async (req, res) => {
  try {
    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();
    res.render("index", { clothing, stores });
  } catch (error) {
    console.error("Fout bij ophalen van data:", error);
    res.status(500).send("Er is iets misgegaan met het laden van de data.");
  }
});
app.get("/clothing/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();

    const item = clothing.find((c: any) => c.id === id);
    if (!item) {
      res.status(404).send("Kledingstuk niet gevonden");
      return;
    }

    const store = stores.find((s: any) => s.id === item.store.id);
    item.store.name = store ? store.name : "Onbekend";

    const role = req.session.user?.role || null;

    res.render("detail", { item, role });
  } catch (error) {
    console.error("Fout bij ophalen detail:", error);
    res
      .status(500)
      .send("Er is iets misgegaan bij het laden van de detailpagina.");
  }
});
app.get("/stores/:id", requireLogin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();

    const store = stores.find((s: any) => s.id === id);
    if (!store) {
      res.status(404).send("Winkel niet gevonden");
      return;
    }

    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();
    const storeClothing = clothing.filter((c: any) => c.store.id === id);

    res.render("storeDetail", { store, storeClothing });
  } catch (error) {
    console.error("Fout bij ophalen winkel detail:", error);
    res
      .status(500)
      .send("Er is iets misgegaan bij het laden van de winkel detailpagina.");
  }
});

app.get("/stores", requireLogin, async (req, res) => {
  let stores: Store[] = await db.collection<Store>("stores").find({}).toArray();
  res.render("stores", { stores });
});

app.get("/clothing/:id/edit", requireLogin, async (req, res) => {
  const id = Number(req.params.id);
  const clothing = await db.collection<Clothing>("clothes").findOne({ id });
  const stores = await db.collection<Store>("stores").find({}).toArray();

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
    .collection<Store>("stores")
    .findOne({ id: Number(storeId) });
  if (!store) {
    res.status(400).send("Winkel niet gevonden");
    return;
  }

  await db.collection<Clothing>("clothes").updateOne(
    { id },
    {
      $set: {
        name,
        price: Number(price),
        isAvailable: isAvailable === "true" || isAvailable === true,
        store,
      },
    }
  );

  res.redirect(`/clothing/${id}`);
});

// Routes zonder login vereist
app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username: string = req.body.username;
  const password: string = req.body.password;
  try {
    let user: User = await login(username, password);
    delete user.password;
    req.session.user = user;
    res.redirect("/");
  } catch (e: any) {
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
    const userCollection = db.collection<User>("users");
    const existingUser = await userCollection.findOne({ username: username });
    if (existingUser) {
      return res
        .status(400)
        .render("register", { error: "Gebruikersnaam bestaat al." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({
      username,
      password: hashedPassword,
      role: "USER",
    });

    res.redirect("/login");
  } catch (error) {
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
