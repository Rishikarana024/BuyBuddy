const mongoose = require("mongoose");
require("dotenv").config();
const { Product } = require("./model/Product"); // adjust if path is different
const products = require("./sampleProducts");

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await Product.deleteMany({}); // ✅ Clears old products
    await Product.insertMany(products);
    console.log("✅ 30 products inserted!");
    process.exit();
  } catch (error) {
    console.error("Error inserting products:", error);
    process.exit(1);
  }
}

main();

