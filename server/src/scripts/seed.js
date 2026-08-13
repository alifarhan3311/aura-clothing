/**
 * Full Database Seed Script
 * ─────────────────────────
 * Seeds: Brands → Categories (6 total, 2 per section) → Products (3 per category = 18 total)
 *
 * Run: node src/scripts/seed.js
 *   or: npm run seed  (add "seed": "node src/scripts/seed.js" to package.json scripts)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mh-clothing";

// ─────────────────────────────────────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────────────────────────────────────
const BRANDS_DATA = [
  {
    name: "Aura Luxury",
    description: "High-end couture and luxury ethnic wear",
    logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    name: "Urban Silk",
    description: "Contemporary silk and modern minimal apparel",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    name: "Velvet & Co.",
    description: "Handcrafted velvet formals and festive collection",
    logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&auto=format&fit=crop&q=80",
    isActive: true,
  },
  {
    name: "Loom & Thread",
    description: "Organic cotton everyday wear and sustainable basics",
    logo: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80",
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  (2 per section = 6 total)
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES_DATA = [
  // ── WOMEN ─────────────────────────────────────────────────────────────────
  {
    name: "Women Western",
    section: "women",
    description: "Trendy western outfits for modern women — dresses, tops, blazers & more",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Dresses", "Tops", "Blazers", "Trousers", "Outerwear"],
    isActive: true,
  },
  {
    name: "Women Pakistani",
    section: "women",
    description: "Elegant Pakistani suits, shalwar kameez, and festive formals for women",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Shalwar Kameez", "Lawn Suits", "Formal Wear", "Bridal", "Party Wear"],
    isActive: true,
  },

  // ── MEN ───────────────────────────────────────────────────────────────────
  {
    name: "Men Western",
    section: "men",
    description: "Classic and contemporary western wear for men — shirts, trousers, blazers",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Shirts", "T-Shirts", "Trousers", "Blazers", "Outerwear"],
    isActive: true,
  },
  {
    name: "Men Shalwar Kameez",
    section: "men",
    description: "Traditional and designer shalwar kameez, kurtas and ethnic wear for men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Kurta", "Shalwar Kameez", "Waistcoat Set", "Casual Kurta", "Sherwani"],
    isActive: true,
  },

  // ── KIDS ──────────────────────────────────────────────────────────────────
  {
    name: "Kids Western",
    section: "kids",
    description: "Fun and comfortable western wear for boys and girls",
    image: "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Boys Western", "Girls Western", "T-Shirts", "Bottoms", "Outerwear"],
    isActive: true,
  },
  {
    name: "Kids Pakistani",
    section: "kids",
    description: "Adorable festive and casual Pakistani outfits for kids",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Boys Kurta Set", "Girls Shalwar Kameez", "Festive Wear", "Party Wear"],
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  (3 per category = 18 total)
// Each has: mainImage + images[] (multiple) + variants (color + size)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns 18 product definitions.
 * brandMap: { "Aura Luxury": ObjectId, ... }
 * catMap:   { "Women Western": ObjectId, ... }
 */
function buildProducts(brandMap, catMap) {
  return [
    // ══ WOMEN WESTERN (3 products) ═══════════════════════════════════════════
    {
      name: "Silk Drape Midi Dress",
      description:
        "An effortlessly elegant midi dress crafted from lightweight silk-blend fabric. Features a fluid drape silhouette with a subtle waist tie for a flattering fit.",
      brand: brandMap["Urban Silk"],
      category: catMap["Women Western"],
      mainImage:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Ivory", "Dusty Rose", "Sage Green"],
      variants: [
        { color: "Ivory",      size: "XS", price: 8500, discount: 0,  stock: 12 },
        { color: "Ivory",      size: "S",  price: 8500, discount: 0,  stock: 18 },
        { color: "Ivory",      size: "M",  price: 8500, discount: 0,  stock: 15 },
        { color: "Dusty Rose", size: "S",  price: 8500, discount: 10, stock: 8  },
        { color: "Dusty Rose", size: "M",  price: 8500, discount: 10, stock: 10 },
        { color: "Sage Green", size: "M",  price: 8500, discount: 0,  stock: 6  },
        { color: "Sage Green", size: "L",  price: 8500, discount: 0,  stock: 4  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["trending", "featured"],
    },
    {
      name: "Linen Relaxed Blazer",
      description:
        "Structured yet relaxed linen blazer, perfect for layering. Unlined for breathability with subtle shoulder padding and a single-button closure.",
      brand: brandMap["Loom & Thread"],
      category: catMap["Women Western"],
      mainImage:
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Beige", "White", "Black"],
      variants: [
        { color: "Beige", size: "S",  price: 12000, discount: 0,  stock: 10 },
        { color: "Beige", size: "M",  price: 12000, discount: 0,  stock: 14 },
        { color: "White", size: "S",  price: 12000, discount: 15, stock: 7  },
        { color: "White", size: "M",  price: 12000, discount: 15, stock: 9  },
        { color: "Black", size: "M",  price: 12000, discount: 0,  stock: 11 },
        { color: "Black", size: "L",  price: 12000, discount: 0,  stock: 5  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Tailored Trench Coat",
      description:
        "A timeless tailored trench coat with classic storm flap, belted waist, and epaulettes. An investment piece that never goes out of style.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Women Western"],
      mainImage:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Camel", "Black"],
      variants: [
        { color: "Camel", size: "XS", price: 22000, discount: 30, stock: 5 },
        { color: "Camel", size: "S",  price: 22000, discount: 30, stock: 8 },
        { color: "Camel", size: "M",  price: 22000, discount: 30, stock: 6 },
        { color: "Black", size: "S",  price: 22000, discount: 0,  stock: 9 },
        { color: "Black", size: "M",  price: 22000, discount: 0,  stock: 7 },
        { color: "Black", size: "L",  price: 22000, discount: 0,  stock: 3 },
      ],
      isActive: true,
      isFeatured: true,
      type: ["trending", "featured"],
    },

    // ══ WOMEN PAKISTANI (3 products) ═════════════════════════════════════════
    {
      name: "Royal Emerald Velvet Suit",
      description:
        "Intricately embroidered velvet shirt paired with organza dupatta and raw silk trousers. A showstopper for festive occasions.",
      brand: brandMap["Velvet & Co."],
      category: catMap["Women Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Emerald Green", "Royal Blue", "Maroon"],
      variants: [
        { color: "Emerald Green", size: "S",  price: 24500, discount: 10, stock: 8  },
        { color: "Emerald Green", size: "M",  price: 24500, discount: 10, stock: 12 },
        { color: "Emerald Green", size: "L",  price: 24500, discount: 10, stock: 6  },
        { color: "Royal Blue",    size: "S",  price: 24500, discount: 0,  stock: 5  },
        { color: "Royal Blue",    size: "M",  price: 24500, discount: 0,  stock: 7  },
        { color: "Maroon",        size: "M",  price: 24500, discount: 15, stock: 4  },
        { color: "Maroon",        size: "L",  price: 24500, discount: 15, stock: 3  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["featured", "trending"],
    },
    {
      name: "Ivory Embroidered Lawn Suit",
      description:
        "Premium 3-piece lawn suit with intricate embroidery on the shirt, printed dupatta and stitched trousers. Perfect for summer festive.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Women Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Ivory White", "Blush Pink", "Sky Blue"],
      variants: [
        { color: "Ivory White", size: "S",  price: 6800, discount: 0,  stock: 20 },
        { color: "Ivory White", size: "M",  price: 6800, discount: 0,  stock: 18 },
        { color: "Ivory White", size: "L",  price: 6800, discount: 0,  stock: 10 },
        { color: "Blush Pink",  size: "S",  price: 6800, discount: 5,  stock: 15 },
        { color: "Blush Pink",  size: "M",  price: 6800, discount: 5,  stock: 12 },
        { color: "Sky Blue",    size: "M",  price: 6800, discount: 0,  stock: 14 },
        { color: "Sky Blue",    size: "L",  price: 6800, discount: 0,  stock: 8  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Handwoven Kashmiri Shawl",
      description:
        "100% pure cashmere wool shawl with authentic hand needlework motifs. Lightweight yet incredibly warm — a timeless heirloom piece.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Women Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Maroon Gold", "Black Silver", "Teal Green"],
      variants: [
        { color: "Maroon Gold",  size: "Free Size", price: 35000, discount: 15, stock: 5  },
        { color: "Black Silver", size: "Free Size", price: 35000, discount: 0,  stock: 4  },
        { color: "Teal Green",   size: "Free Size", price: 35000, discount: 10, stock: 3  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["featured"],
    },

    // ══ MEN WESTERN (3 products) ══════════════════════════════════════════════
    {
      name: "Premium Wool Blazer",
      description:
        "A refined single-breasted wool blazer with notch lapels. Fully lined with interior pockets and horn-effect buttons — boardroom to evening.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Men Western"],
      mainImage:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Charcoal", "Navy", "Camel"],
      variants: [
        { color: "Charcoal", size: "S",  price: 24000, discount: 0,  stock: 8  },
        { color: "Charcoal", size: "M",  price: 24000, discount: 0,  stock: 12 },
        { color: "Charcoal", size: "L",  price: 24000, discount: 0,  stock: 7  },
        { color: "Navy",     size: "M",  price: 24000, discount: 10, stock: 9  },
        { color: "Navy",     size: "L",  price: 24000, discount: 10, stock: 5  },
        { color: "Camel",    size: "M",  price: 24000, discount: 0,  stock: 4  },
        { color: "Camel",    size: "XL", price: 24000, discount: 0,  stock: 3  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["trending", "featured"],
    },
    {
      name: "Slim-Fit Oxford Shirt",
      description:
        "A classic slim-fit Oxford shirt crafted from premium 100% cotton. Features a button-down collar, single chest pocket, and a clean tailored finish.",
      brand: brandMap["Loom & Thread"],
      category: catMap["Men Western"],
      mainImage:
        "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["White", "Light Blue", "Pink"],
      variants: [
        { color: "White",      size: "S",   price: 5500, discount: 0,  stock: 25 },
        { color: "White",      size: "M",   price: 5500, discount: 0,  stock: 30 },
        { color: "White",      size: "L",   price: 5500, discount: 0,  stock: 20 },
        { color: "White",      size: "XL",  price: 5500, discount: 0,  stock: 15 },
        { color: "Light Blue", size: "S",   price: 5500, discount: 0,  stock: 18 },
        { color: "Light Blue", size: "M",   price: 5500, discount: 0,  stock: 22 },
        { color: "Pink",       size: "M",   price: 5500, discount: 5,  stock: 10 },
        { color: "Pink",       size: "L",   price: 5500, discount: 5,  stock: 8  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Tapered Chino Pants",
      description:
        "Modern tapered chinos crafted from stretch-cotton blend for all-day comfort. Features a mid-rise waist with a clean, versatile silhouette.",
      brand: brandMap["Urban Silk"],
      category: catMap["Men Western"],
      mainImage:
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Khaki", "Navy", "Olive", "Stone"],
      variants: [
        { color: "Khaki", size: "30", price: 7000, discount: 30, stock: 15 },
        { color: "Khaki", size: "32", price: 7000, discount: 30, stock: 18 },
        { color: "Khaki", size: "34", price: 7000, discount: 30, stock: 10 },
        { color: "Navy",  size: "30", price: 7000, discount: 0,  stock: 12 },
        { color: "Navy",  size: "32", price: 7000, discount: 0,  stock: 14 },
        { color: "Olive", size: "32", price: 7000, discount: 0,  stock: 9  },
        { color: "Stone", size: "34", price: 7000, discount: 0,  stock: 7  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["trending"],
    },

    // ══ MEN SHALWAR KAMEEZ (3 products) ══════════════════════════════════════
    {
      name: "Minimalist Sand Silk Kurta",
      description:
        "Premium pure raw silk men's kurta with subtle thread detailing on collar and cuffs. Effortlessly elegant for formal and semi-formal occasions.",
      brand: brandMap["Urban Silk"],
      category: catMap["Men Shalwar Kameez"],
      mainImage:
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Beige Sand", "Ivory White", "Slate Grey"],
      variants: [
        { color: "Beige Sand",   size: "S",   price: 12800, discount: 0,  stock: 15 },
        { color: "Beige Sand",   size: "M",   price: 12800, discount: 0,  stock: 22 },
        { color: "Beige Sand",   size: "L",   price: 12800, discount: 0,  stock: 18 },
        { color: "Ivory White",  size: "M",   price: 12800, discount: 5,  stock: 10 },
        { color: "Ivory White",  size: "L",   price: 12800, discount: 5,  stock: 8  },
        { color: "Slate Grey",   size: "M",   price: 12800, discount: 0,  stock: 7  },
        { color: "Slate Grey",   size: "XL",  price: 12800, discount: 0,  stock: 5  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["featured", "trending"],
    },
    {
      name: "Embroidered Lawn Kameez Set",
      description:
        "Intricate machine embroidery on fine lawn fabric. Comes as a complete 2-piece set with matching shalwar. Ideal for Eid and festive gatherings.",
      brand: brandMap["Velvet & Co."],
      category: catMap["Men Shalwar Kameez"],
      mainImage:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["White Gold", "Navy Silver", "Green Silver"],
      variants: [
        { color: "White Gold",    size: "S",  price: 9500, discount: 10, stock: 12 },
        { color: "White Gold",    size: "M",  price: 9500, discount: 10, stock: 16 },
        { color: "White Gold",    size: "L",  price: 9500, discount: 10, stock: 8  },
        { color: "Navy Silver",   size: "M",  price: 9500, discount: 0,  stock: 10 },
        { color: "Navy Silver",   size: "L",  price: 9500, discount: 0,  stock: 6  },
        { color: "Green Silver",  size: "M",  price: 9500, discount: 0,  stock: 7  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Classic Waistcoat Sherwani Set",
      description:
        "Regal sherwani with intricate zardozi embroidery paired with a contrasting waistcoat. The complete groom or event-wear package.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Men Shalwar Kameez"],
      mainImage:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Ivory Champagne", "Black Gold", "Royal Blue"],
      variants: [
        { color: "Ivory Champagne", size: "S",  price: 45000, discount: 0,  stock: 4 },
        { color: "Ivory Champagne", size: "M",  price: 45000, discount: 0,  stock: 6 },
        { color: "Ivory Champagne", size: "L",  price: 45000, discount: 0,  stock: 3 },
        { color: "Black Gold",      size: "M",  price: 45000, discount: 5,  stock: 5 },
        { color: "Royal Blue",      size: "M",  price: 45000, discount: 0,  stock: 4 },
        { color: "Royal Blue",      size: "L",  price: 45000, discount: 0,  stock: 2 },
      ],
      isActive: true,
      isFeatured: true,
      type: ["featured"],
    },

    // ══ KIDS WESTERN (3 products) ═════════════════════════════════════════════
    {
      name: "Rainbow Stripe Cotton Tee",
      description:
        "A cheerful rainbow-striped tee crafted from 100% organic cotton. Soft, durable, and designed to handle the most adventurous days.",
      brand: brandMap["Loom & Thread"],
      category: catMap["Kids Western"],
      mainImage:
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Multi Rainbow", "Blue Stripes", "Pink Stripes"],
      variants: [
        { color: "Multi Rainbow", size: "2-3Y",   price: 1800, discount: 0,  stock: 30 },
        { color: "Multi Rainbow", size: "4-5Y",   price: 1800, discount: 0,  stock: 28 },
        { color: "Multi Rainbow", size: "6-7Y",   price: 1800, discount: 0,  stock: 22 },
        { color: "Multi Rainbow", size: "8-9Y",   price: 1800, discount: 0,  stock: 18 },
        { color: "Blue Stripes",  size: "4-5Y",   price: 1800, discount: 5,  stock: 15 },
        { color: "Pink Stripes",  size: "4-5Y",   price: 1800, discount: 5,  stock: 14 },
        { color: "Pink Stripes",  size: "6-7Y",   price: 1800, discount: 5,  stock: 10 },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Kids Denim Dungarees",
      description:
        "Classic denim dungarees with adjustable shoulder straps and multiple pockets. Reinforced knees for extra durability during outdoor play.",
      brand: brandMap["Urban Silk"],
      category: catMap["Kids Western"],
      mainImage:
        "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1445633883498-7f9922d9af9a?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Light Wash", "Dark Wash", "Medium Wash"],
      variants: [
        { color: "Light Wash",  size: "2-3Y", price: 4200, discount: 30, stock: 20 },
        { color: "Light Wash",  size: "4-5Y", price: 4200, discount: 30, stock: 18 },
        { color: "Dark Wash",   size: "4-5Y", price: 4200, discount: 0,  stock: 15 },
        { color: "Dark Wash",   size: "6-7Y", price: 4200, discount: 0,  stock: 12 },
        { color: "Medium Wash", size: "6-7Y", price: 4200, discount: 0,  stock: 10 },
        { color: "Medium Wash", size: "8-9Y", price: 4200, discount: 0,  stock: 8  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["trending"],
    },
    {
      name: "Kids Winter Puffer Jacket",
      description:
        "A warm and water-resistant puffer jacket with a detachable hood. Filled with synthetic insulation — machine washable and super cozy.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Kids Western"],
      mainImage:
        "https://images.unsplash.com/photo-1445633883498-7f9922d9af9a?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Red", "Navy", "Pink", "Black"],
      variants: [
        { color: "Red",   size: "2-3Y",   price: 7500, discount: 30, stock: 10 },
        { color: "Red",   size: "4-5Y",   price: 7500, discount: 30, stock: 12 },
        { color: "Navy",  size: "4-5Y",   price: 7500, discount: 0,  stock: 8  },
        { color: "Navy",  size: "6-7Y",   price: 7500, discount: 0,  stock: 7  },
        { color: "Pink",  size: "4-5Y",   price: 7500, discount: 0,  stock: 9  },
        { color: "Black", size: "8-9Y",   price: 7500, discount: 0,  stock: 5  },
        { color: "Black", size: "10-11Y", price: 7500, discount: 0,  stock: 4  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["trending"],
    },

    // ══ KIDS PAKISTANI (3 products) ═══════════════════════════════════════════
    {
      name: "Golden Ivory Embroidered Kurta Set",
      description:
        "Soft cotton silk waistcoat and waist-tied kurta set designed for comfort during festive events. Comes with matching churidar for a complete look.",
      brand: brandMap["Aura Luxury"],
      category: catMap["Kids Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1445633883498-7f9922d9af9a?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Ivory Gold", "Bottle Green", "Navy Blue"],
      variants: [
        { color: "Ivory Gold",    size: "2-3Y",  price: 7900, discount: 5,  stock: 20 },
        { color: "Ivory Gold",    size: "4-5Y",  price: 7900, discount: 5,  stock: 25 },
        { color: "Ivory Gold",    size: "6-7Y",  price: 7900, discount: 5,  stock: 18 },
        { color: "Bottle Green",  size: "4-5Y",  price: 7900, discount: 0,  stock: 12 },
        { color: "Bottle Green",  size: "6-7Y",  price: 7900, discount: 0,  stock: 10 },
        { color: "Navy Blue",     size: "6-7Y",  price: 7900, discount: 0,  stock: 8  },
        { color: "Navy Blue",     size: "8-9Y",  price: 7900, discount: 0,  stock: 6  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["featured", "trending"],
    },
    {
      name: "Girls Festive Shalwar Kameez",
      description:
        "Beautifully embellished shalwar kameez for girls in vibrant festive colors. Crafted from premium karandi fabric with lace detailing on the hem.",
      brand: brandMap["Velvet & Co."],
      category: catMap["Kids Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Hot Pink", "Turquoise", "Coral Orange"],
      variants: [
        { color: "Hot Pink",     size: "4-5Y",   price: 5500, discount: 0,  stock: 18 },
        { color: "Hot Pink",     size: "6-7Y",   price: 5500, discount: 0,  stock: 15 },
        { color: "Hot Pink",     size: "8-9Y",   price: 5500, discount: 0,  stock: 10 },
        { color: "Turquoise",    size: "4-5Y",   price: 5500, discount: 10, stock: 12 },
        { color: "Turquoise",    size: "6-7Y",   price: 5500, discount: 10, stock: 8  },
        { color: "Coral Orange", size: "6-7Y",   price: 5500, discount: 0,  stock: 7  },
        { color: "Coral Orange", size: "8-9Y",   price: 5500, discount: 0,  stock: 5  },
      ],
      isActive: true,
      isFeatured: false,
      type: ["new-arrival"],
    },
    {
      name: "Boys Eid Waistcoat Kurta Set",
      description:
        "Stylish 3-piece Eid set including kurta, waistcoat, and matching shalwar. Made from fine cotton blend with subtle embroidery on the collar.",
      brand: brandMap["Urban Silk"],
      category: catMap["Kids Pakistani"],
      mainImage:
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80",
      images: [
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&auto=format&fit=crop&q=80",
      ],
      colors: ["Black Gold", "Maroon", "Teal Silver"],
      variants: [
        { color: "Black Gold",  size: "4-5Y",  price: 6200, discount: 0,  stock: 15 },
        { color: "Black Gold",  size: "6-7Y",  price: 6200, discount: 0,  stock: 18 },
        { color: "Black Gold",  size: "8-9Y",  price: 6200, discount: 0,  stock: 12 },
        { color: "Maroon",      size: "6-7Y",  price: 6200, discount: 5,  stock: 10 },
        { color: "Maroon",      size: "8-9Y",  price: 6200, discount: 5,  stock: 8  },
        { color: "Teal Silver", size: "6-7Y",  price: 6200, discount: 0,  stock: 7  },
        { color: "Teal Silver", size: "10-11Y",price: 6200, discount: 0,  stock: 5  },
      ],
      isActive: true,
      isFeatured: true,
      type: ["trending", "featured"],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("\n✅  Connected to MongoDB:", MONGO_URI);

    // ── 1. Clear existing data ──────────────────────────────────────────────
    console.log("\n🗑️   Clearing existing brands, categories, and products...");
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    console.log("   Done clearing.");

    // ── 2. Seed brands ──────────────────────────────────────────────────────
    console.log("\n🏷️   Seeding brands...");
    const createdBrands = await Brand.insertMany(BRANDS_DATA);
    const brandMap = {};
    createdBrands.forEach((b) => { brandMap[b.name] = b._id; });
    console.log(`   Created ${createdBrands.length} brands:`);
    createdBrands.forEach((b) => console.log(`   • ${b.name}`));

    // ── 3. Seed categories ──────────────────────────────────────────────────
    console.log("\n📂   Seeding categories...");
    const createdCategories = await Category.insertMany(CATEGORIES_DATA);
    const catMap = {};
    createdCategories.forEach((c) => { catMap[c.name] = c._id; });
    console.log(`   Created ${createdCategories.length} categories:`);
    createdCategories.forEach((c) =>
      console.log(`   • [${c.section.toUpperCase()}] ${c.name} (${c.subcategories.length} subcategories)`)
    );

    // ── 4. Seed products ────────────────────────────────────────────────────
    console.log("\n📦   Seeding products...");
    const productsData = buildProducts(brandMap, catMap);
    const createdProducts = await Product.insertMany(productsData);
    console.log(`   Created ${createdProducts.length} products:`);

    // Group by category for readability
    const byCat = {};
    createdProducts.forEach((p) => {
      const catEntry = createdCategories.find(
        (c) => c._id.toString() === p.category.toString()
      );
      const catName = catEntry?.name || "Unknown";
      if (!byCat[catName]) byCat[catName] = [];
      byCat[catName].push(p.name);
    });
    Object.entries(byCat).forEach(([cat, names]) => {
      console.log(`\n   📁 ${cat}:`);
      names.forEach((n) => console.log(`      • ${n}`));
    });

    // ── 5. Summary ──────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉  Seeding Complete!");
    console.log(`   Brands    : ${createdBrands.length}`);
    console.log(`   Categories: ${createdCategories.length}  (2 per section × 3 sections)`);
    console.log(`   Products  : ${createdProducts.length}  (3 per category × 6 categories)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌  Seeding failed:", error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
