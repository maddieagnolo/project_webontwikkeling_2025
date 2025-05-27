import { Store, Clothing } from "./types";
import { Db } from "mongodb";

export async function loadData(db: Db) {
  // er word gecheckt of de collection leeg is
  const clothingCount = await db.collection("clothes").countDocuments();
  const storeCount = await db.collection("stores").countDocuments();
  if (clothingCount === 0 && storeCount === 0) {
    const clothingResponse = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/clothing.json"
    );
    const storesResponse = await fetch(
      "https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json"
    );
    const clothes: Clothing[] = await clothingResponse.json();
    const stores: Store[] = await storesResponse.json();
    await db.collection<Store>("stores").insertMany(stores);
    await db.collection<Clothing>("clothes").insertMany(clothes);
    console.log("data succesvol toegevoegd!");
  } else {
    console.log("Data is al aanwezig");
  }
}
