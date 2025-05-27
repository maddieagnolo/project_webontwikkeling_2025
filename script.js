"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clothing_json_1 = __importDefault(require("./clothing.json"));
const readline = __importStar(require("readline-sync"));
const products = clothing_json_1.default;
const menuItems = [
    "Toon alle kledingstukken",
    "Zoek kledingstuk op ID",
    "Exit",
];
let answer;
let continueProgram = true;
do {
    answer = readline.keyInSelect(menuItems, "Maak een keuze", { cancel: false });
    console.log(`Je hebt gekozen voor: ${menuItems[answer]}`);
    switch (answer) {
        case 0:
            showAllProducts();
            break;
        case 1:
            searchProductById();
            break;
        case 2:
            console.log("Programma afgesloten.");
            continueProgram = false;
            break;
    }
} while (answer !== -1 && continueProgram);
function showAllProducts() {
    console.clear();
    console.log("Alle clothing:");
    products.forEach((product) => {
        console.log(`${product.id}. ${product.name} - €${product.price} (${product.store.name})`);
    });
    console.log("-".repeat(25));
}
function searchProductById() {
    console.clear();
    const id = readline.questionInt("Geef een ID in: ");
    const product = products.find((p) => p.id === id);
    if (product) {
        console.log(`\nGevonden: ${product.name}`);
        console.log(`Beschrijving: ${product.description}`);
        console.log(`Prijs: €${product.price}`);
        console.log(`Categorie: ${product.category}`);
        console.log(`Winkel: ${product.store.name}`);
        console.log(`Beschikbaar: ${product.isAvailable ? "Ja" : "Nee"}`);
    }
    else {
        console.log("Geen product gevonden met dit ID.");
    }
    console.log("-".repeat(25));
}
