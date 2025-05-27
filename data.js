"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = loadData;
async function loadData(db) {
    // er word gecheckt of de collection leeg is
    const clothingCount = await db.collection("clothes").countDocuments();
    const storeCount = await db.collection("stores").countDocuments();
    if (clothingCount === 0 && storeCount === 0) {
        const clothingResponse = await fetch("https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/clothing.json");
        const storesResponse = await fetch("https://raw.githubusercontent.com/maddieagnolo/project_webontwikkeling_2025/refs/heads/main/stores.json");
        const clothes = await clothingResponse.json();
        const stores = await storesResponse.json();
        await db.collection("stores").insertMany(stores);
        await db.collection("clothes").insertMany(clothes);
        console.log("data succesvol toegevoegd!");
    }
    else {
        console.log("Data is al aanwezig");
    }
}
