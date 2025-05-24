import express from "express";
import { Clothing, Store } from "./interface";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    // Fetch kledingdata
    const clothingRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/clothing.json"
    );
    const clothing: Clothing[] = await clothingRes.json();

    // Fetch winkels data
    const storesRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json"
    );
    const stores: Store[] = await storesRes.json();

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
    const clothingRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/clothing.json"
    );
    const clothing = await clothingRes.json();

    // Fetch winkels data
    const storesRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json"
    );
    const stores = await storesRes.json();

    // Zoek het kledingstuk met dit id
    const item = clothing.find((c: any) => c.id === id);
    if (!item) {
      res.status(404).send("Kledingstuk niet gevonden");
    }

    // Vind winkelnaam
    const store = stores.find((s: any) => s.id === item.storeId);
    item.storeName = store ? store.name : "Onbekend";

    // Render detail.ejs met item
    res.render("detail", { item });
  } catch (error) {
    console.error("Fout bij ophalen detail:", error);
    res
      .status(500)
      .send("Er is iets misgegaan bij het laden van de detailpagina.");
  }
});

app.listen(3000, () => {
  console.log(`The application is listening on http://localhost:3000`);
});

app.get("/stores/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Fetch winkels data
    const storesRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json"
    );
    const stores = await storesRes.json();

    // Zoek de winkel met dit id
    const store = stores.find((s: any) => s.id === id);
    if (!store) {
      res.status(404).send("Winkel niet gevonden");
    }

    // Optioneel: fetch alle kledingstukken van deze winkel
    const clothingRes = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/clothing.json"
    );
    const clothing = await clothingRes.json();

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
  const storesRes = await fetch(
    "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json"
  );
  const stores: Clothing[] = await storesRes.json();

  res.render("stores", { stores });
});
