import clothing from "./clothing.json";
import * as readline from "readline-sync";
import {Clothing} from  "./interface"


const products:Clothing[] = clothing;

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

//case0
function showAllProducts() {
  console.clear();
  console.log("Alle clothing:");
  products.forEach((product) => {
    console.log(
      `${product.id}. ${product.name} - €${product.price} (${product.store.name})`
    );
  });
  console.log("-".repeat(25));
}

//case 2
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
  } else {
    console.log("Geen product gevonden met dit ID.");
  }
  console.log("-".repeat(25));
}
