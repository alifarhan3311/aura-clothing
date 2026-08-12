import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import Category from "../models/Category.js";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mh-clothing";

const DEFAULT_CATEGORIES = [
  { name: "Women", section: "women", description: "Women's fashion collection" },
  { name: "Men", section: "men", description: "Men's fashion collection" },
  { name: "Kids", section: "kids", description: "Kids' fashion collection" },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await Category.findOne({ name: new RegExp(`^${cat.name}$`, "i") });
      if (existing) {
        console.log(`Category "${cat.name}" already exists (${existing.section})`);
        continue;
      }
      await Category.create(cat);
      console.log(`Created category: ${cat.name} (${cat.section})`);
    }

    console.log("\nSeeding complete!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedCategories();
