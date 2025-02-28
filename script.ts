import kledingstukken from "./kledingstukken.json";
import * as readline from "readline-sync";

const products = kledingstukken;

const menuItems = [
  "Toon alle kledingstukken",
  "Filter op beschikbaarheid",
  "Zoek kledingstuk op ID",
  "Zoek kledingstuk op naam",
  "Exit",
];

let answer;
do {
  answer = readline.keyInSelect(menuItems, "Maak een keuze:");
  console.log(`Je hebt gekozen voor: ${menuItems[answer]}`);

  switch (answer) {
    case 0:
      showAllProducts();
      break;
    case 1:
      filterAvailableProducts();
      break;
    case 2:
      searchProductById();
      break;
    case 3:
      searchProductByName();
      break;
    default:
      console.log("Programma afgesloten.");
      break;
  }
} while (answer !== -1);

function showAllProducts() {
  console.clear();
  console.log("Alle kledingstukken:");
  products.forEach((product) => {
    console.log(
      `${product.id}. ${product.name} - €${product.price} (${product.store})`
    );
  });
  console.log("-".repeat(25));
}

function filterAvailableProducts() {
  console.clear();
  console.log("Beschikbare kledingstukken:");
  products
    .filter((product) => product.isAvailable)
    .forEach((product) => {
      console.log(
        `${product.id}. ${product.name} - €${product.price} (${product.store})`
      );
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
    console.log(`Winkel: ${product.store}`);
    console.log(`Beschikbaar: ${product.isAvailable ? "Ja" : "Nee"}`);
  } else {
    console.log("Geen product gevonden met dit ID.");
  }
  console.log("-".repeat(25));
}

function searchProductByName() {
  console.clear();
  const name = readline
    .question("Geef een naam of deel van een naam in: ")
    .toLowerCase();
  const results = products.filter((p) => p.name.toLowerCase().includes(name));

  if (results.length > 0) {
    console.log("\nGevonden producten:");
    results.forEach((product) => {
      console.log(
        `${product.id}. ${product.name} - €${product.price} (${product.store})`
      );
    });
  } else {
    console.log("Geen producten gevonden met deze naam.");
  }
  console.log("-".repeat(25));
}
