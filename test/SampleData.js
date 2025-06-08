const coffeeDataTree = new DataTree();

// Create items (menu)
const icedAmericano = coffeeDataTree.createItem("Iced Americano", 4500);
const hotAmericano = coffeeDataTree.createItem("Hot Americano", 4000);
const cafeLatte = coffeeDataTree.createItem("Cafe Latte", 5000);
const caramelMacchiato = coffeeDataTree.createItem("Caramel Macchiato", 5500);

// Create materials
const espressoShot = coffeeDataTree.createMaterial("Espresso Shot", 1, 700);
const ice = coffeeDataTree.createMaterial("Ice", 100, 50);
const milk = coffeeDataTree.createMaterial("Milk", 200, 400);
const caramelSyrup = coffeeDataTree.createMaterial("Caramel Syrup", 30, 300);
const water = coffeeDataTree.createMaterial("Water", 200, 0);

// Iced Americano = Espresso Shot + Ice + Water
coffeeDataTree.insertChild(icedAmericano.id, espressoShot.id, 1);
coffeeDataTree.insertChild(icedAmericano.id, ice.id, 100);
coffeeDataTree.insertChild(icedAmericano.id, water.id, 200);

// Hot Americano = Espresso Shot + Water
coffeeDataTree.insertChild(hotAmericano.id, espressoShot.id, 1);
coffeeDataTree.insertChild(hotAmericano.id, water.id, 200);

// Cafe Latte = Espresso Shot + Milk
coffeeDataTree.insertChild(cafeLatte.id, espressoShot.id, 1);
coffeeDataTree.insertChild(cafeLatte.id, milk.id, 200);

// Caramel Macchiato = Espresso Shot + Milk + Caramel Syrup
coffeeDataTree.insertChild(caramelMacchiato.id, espressoShot.id, 1);
coffeeDataTree.insertChild(caramelMacchiato.id, milk.id, 200);
coffeeDataTree.insertChild(caramelMacchiato.id, caramelSyrup.id, 30);

const saveUrl = new UrlDataManager();
saveUrl.saveToUrl(coffeeDataTree.toObject())