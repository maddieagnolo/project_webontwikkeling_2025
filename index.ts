import express from "express";
import { Clothing, Store } from "./interface";
import { Db } from "mongodb";
import { connectionMongoDB, closeConnection } from "./mongo";
import { loadData } from "./data";
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

let db: Db;

async function Start() {
  try {
    db = await connectionMongoDB();
    await loadData(db);

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

app.get("/", async (req, res) => {
  try {
    // Fetch kledingdata
    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();

    // Fetch winkels data
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();

    // Render je index.ejs en geef data door
    res.render("index", { clothing, stores });
  } catch (error) {
    console.error("Fout bij ophalen van data:", error);
    res.status(500).send("Er is iets misgegaan met het laden van de data.");
  }
});

app.get("/clothing/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Fetch kledingdata
    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();

    // Fetch winkels data
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();

    // Zoek het kledingstuk met dit id
    const item = clothing.find((c: any) => c.id === id);
    if (!item) {
      res.status(404).send("Kledingstuk niet gevonden");
      return;
    }

    // Vind winkelnaam
    const store = stores.find((s: any) => s.id === item.store.id);
    item.store.name = store ? store.name : "Onbekend";

    // Render detail.ejs met item
    res.render("detail", { item });
  } catch (error) {
    console.error("Fout bij ophalen detail:", error);
    res
      .status(500)
      .send("Er is iets misgegaan bij het laden van de detailpagina.");
  }
});

app.get("/stores/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Fetch winkels data
    let stores: Store[] = await db
      .collection<Store>("stores")
      .find({})
      .toArray();

    // Zoek de winkel met dit id
    const store = stores.find((s: any) => s.id === id);
    if (!store) {
      res.status(404).send("Winkel niet gevonden");
    }

    // Optioneel: fetch alle kledingstukken van deze winkel
    let clothing: Clothing[] = await db
      .collection<Clothing>("clothes")
      .find({})
      .toArray();

    // Filter kledingstukken die bij deze winkel horen
    const storeClothing = clothing.filter((c: any) => c.store.id === id);

    // Render de storeDetail.ejs en geef winkel en kledingstukken door
    res.render("storeDetail", { store, storeClothing });
  } catch (error) {
    console.error("Fout bij ophalen winkel detail:", error);
    res
      .status(500)
      .send("Er is iets misgegaan bij het laden van de winkel detailpagina.");
  }
});

app.get("/stores", async (req, res) => {
  let stores: Store[] = await db.collection<Store>("stores").find({}).toArray();

  res.render("stores", { stores });
});
