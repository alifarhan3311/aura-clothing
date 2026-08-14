import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

import Department from "../models/Department.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Slide from "../models/Slide.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mh-clothing";

// ── 1. DEPARTMENTS ───────────────────────────────────────────────────────────
const DEPARTMENTS_DATA = [
  {
    name: "Women",
    slug: "women",
    subtitle: "Inspired by Hania Aamir, Dur-e-Fishan & Mahira Khan",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=85",
    order: 1,
    isActive: true,
  },
  {
    name: "Men",
    slug: "men",
    subtitle: "Inspired by Fawad Khan & Bilal Abbas",
    icon: "👔",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&auto=format&fit=crop&q=85",
    order: 2,
    isActive: true,
  },
  {
    name: "Kids",
    slug: "kids",
    subtitle: "Playful & Royal Ethnic Collection",
    icon: "👦",
    image: "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=1000&auto=format&fit=crop&q=85",
    order: 3,
    isActive: true,
  },
  {
    name: "Babies",
    slug: "babies",
    subtitle: "Soft Organic Cotton & Cute Rompers",
    icon: "👶",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1000&auto=format&fit=crop&q=85",
    order: 4,
    isActive: true,
  },
];

// ── 2. BRANDS ────────────────────────────────────────────────────────────────
const BRANDS_DATA = [
  {
    name: "Maria B.",
    description: "Pakistan's leading luxury designer lawn, formals & bridal couture",
    logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
    isActive: true,
  },
  {
    name: "Khaadi",
    description: "Hand-crafted handloom, pret wear and vibrant festive lawns",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
    isActive: true,
  },
  {
    name: "Sapphire",
    description: "Contemporary silk, lawn, unstitched and modern western pret",
    logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    isActive: true,
  },
  {
    name: "J. (Junaid Jamshed)",
    description: "Classic ethnic kurtas, sherwanis, waistcoats & traditional apparel",
    logo: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80",
    isActive: true,
  },
  {
    name: "Asim Jofa",
    description: "Royal embroidered velvet, organza chiffons & festive formals",
    logo: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80",
    isActive: true,
  },
  {
    name: "Gul Ahmed",
    description: "Premium cotton lawns, luxury unstitched fabrics & men's ethnic",
    logo: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
    isActive: true,
  },
];

// ── 3. CATEGORIES DATA ───────────────────────────────────────────────────────
const CATEGORIES_SPEC = [
  // Women
  { name: "Luxury Pret & Formals", deptSlug: "women", section: "women", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80" },
  { name: "Festive Lawn 3-Piece", deptSlug: "women", section: "women", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" },
  { name: "Bridal & Velvet Couture", deptSlug: "women", section: "women", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80" },
  { name: "Chic Western Blazers & Tops", deptSlug: "women", section: "women", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80" },

  // Men
  { name: "Designer Kurta & Shalwar Kameez", deptSlug: "men", section: "men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80" },
  { name: "Waistcoat & Sherwani Sets", deptSlug: "men", section: "men", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" },
  { name: "Casual Shirts & Polos", deptSlug: "men", section: "men", image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80" },
  { name: "Executive Suits & Blazers", deptSlug: "men", section: "men", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80" },

  // Kids
  { name: "Boys Festive Kurta Suits", deptSlug: "kids", section: "kids", image: "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=800&q=80" },
  { name: "Girls Eastern Frocks & Lehengas", deptSlug: "kids", section: "kids", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80" },

  // Babies
  { name: "Baby Rompers & Cotton Sets", deptSlug: "babies", section: "babies", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80" },
  { name: "Soft Infant Festive Wear", deptSlug: "babies", section: "babies", image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80" },
];

// ── 4. PRODUCTS DATA (14 Women, 12 Men, 6 Kids/Babies) ────────────────────────
const PRODUCTS_DATA = [
  // ── WOMEN PRODUCTS (Inspired by Pakistani Actresses) ────────────────────────
  {
    name: "Hania Aamir Signature Emerald Lawn Set",
    description: "Stunning 3-piece emerald green lawn ensemble worn by Hania Aamir, featuring fine organza embroidery, digital printed chiffon dupatta and dyed cotton pants.",
    brandName: "Maria B.",
    categoryName: "Festive Lawn 3-Piece",
    mainImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Emerald Green", "Gold", "Ivory"],
    type: ["featured", "trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Emerald Green", price: 14500, discount: 15, stock: 12 },
      { size: "M", color: "Emerald Green", price: 14500, discount: 15, stock: 20 },
      { size: "L", color: "Emerald Green", price: 14500, discount: 15, stock: 8 },
    ],
  },
  {
    name: "Dur-e-Fishan Royal Maroon Velvet Anarkali",
    description: "Deep maroon velvet long Peshwas worn by Dur-e-Fishan Saleemi, handcrafted with heavy tilla embroidery, zari work and zari net dupatta.",
    brandName: "Asim Jofa",
    categoryName: "Bridal & Velvet Couture",
    mainImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Maroon", "Gold", "Ruby Red"],
    type: ["featured", "trending"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Maroon", price: 28900, discount: 20, stock: 6 },
      { size: "M", color: "Maroon", price: 28900, discount: 20, stock: 10 },
      { size: "L", color: "Maroon", price: 28900, discount: 20, stock: 4 },
    ],
  },
  {
    name: "Mahira Khan Ivory Organza Dupatta Suit",
    description: "Classic ivory raw silk kurta kameez paired with hand-painted tissue organza dupatta inspired by Mahira Khan's iconic minimalist elegance.",
    brandName: "Sana Safinaz",
    categoryName: "Luxury Pret & Formals",
    mainImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Ivory", "Pearl White", "Champagne Gold"],
    type: ["trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Ivory", price: 18900, discount: 10, stock: 15 },
      { size: "M", color: "Ivory", price: 18900, discount: 10, stock: 18 },
      { size: "L", color: "Ivory", price: 18900, discount: 10, stock: 9 },
    ],
  },
  {
    name: "Ayeza Khan Rose Pink Chiffon Formal",
    description: "Rose pink embroidered chiffon shirt with intricate mirror work, cutwork sleeve borders and crushed silk sharara.",
    brandName: "Bareeze",
    categoryName: "Luxury Pret & Formals",
    mainImage: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Rose Pink", "Blush", "Silver"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Rose Pink", price: 21500, discount: 12, stock: 8 },
      { size: "M", color: "Rose Pink", price: 21500, discount: 12, stock: 14 },
    ],
  },
  {
    name: "Yumna Zaidi Lavender Silk Pret Ensemble",
    description: "Pure viscose silk tunic in subtle lavender with pearl embellishments and straight fit trousers as worn by Yumna Zaidi.",
    brandName: "Khaadi",
    categoryName: "Luxury Pret & Formals",
    mainImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Lavender", "Lilac"],
    type: ["new-arrival"],
    isFeatured: false,
    variants: [
      { size: "S", color: "Lavender", price: 12900, discount: 0, stock: 22 },
      { size: "M", color: "Lavender", price: 12900, discount: 0, stock: 25 },
      { size: "L", color: "Lavender", price: 12900, discount: 0, stock: 11 },
    ],
  },
  {
    name: "Sajal Aly Midnight Blue Embroidered Kurta Set",
    description: "Midnight navy blue lawn kurta with delicate white thread embroidery, paired with cotton culottes and scalloped lace dupatta.",
    brandName: "Sapphire",
    categoryName: "Festive Lawn 3-Piece",
    mainImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Navy Blue", "White"],
    type: ["trending"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Navy Blue", price: 9800, discount: 10, stock: 19 },
      { size: "M", color: "Navy Blue", price: 9800, discount: 10, stock: 30 },
      { size: "L", color: "Navy Blue", price: 9800, discount: 10, stock: 14 },
    ],
  },
  {
    name: "Iqra Aziz Crimson Red Festive 3-Piece",
    description: "Vibrant crimson red digital printed jacquard shirt with gold gota lace details, silk dupatta and fitted churidar.",
    brandName: "Gul Ahmed",
    categoryName: "Festive Lawn 3-Piece",
    mainImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Crimson Red", "Gold"],
    type: ["featured", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Crimson Red", price: 11500, discount: 15, stock: 10 },
      { size: "M", color: "Crimson Red", price: 11500, discount: 15, stock: 18 },
    ],
  },
  {
    name: "Mawra Hocane Peach Georgette Maxi Dress",
    description: "Flowy pastel peach georgette maxi dress featuring hand-embroidered bodice and silver sequins trim.",
    brandName: "Maria B.",
    categoryName: "Luxury Pret & Formals",
    mainImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Peach", "Silver"],
    type: ["trending"],
    isFeatured: false,
    variants: [
      { size: "S", color: "Peach", price: 16800, discount: 5, stock: 9 },
      { size: "M", color: "Peach", price: 16800, discount: 5, stock: 12 },
    ],
  },
  {
    name: "Saba Qamar Gold Embroidered Velvet Peshwas",
    description: "Majestic antique gold velvet floor-length Peshwas with dabka work, resham border and tissue dupatta.",
    brandName: "Asim Jofa",
    categoryName: "Bridal & Velvet Couture",
    mainImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Gold", "Bronze"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Gold", price: 34500, discount: 25, stock: 4 },
      { size: "M", color: "Gold", price: 34500, discount: 25, stock: 7 },
    ],
  },
  {
    name: "Maya Ali Pastel Mint Green Angrakha",
    description: "Classic mint green chikankari angrakha style kameez with gota detailing and embroidered organza dupatta.",
    brandName: "Bareeze",
    categoryName: "Festive Lawn 3-Piece",
    mainImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Mint Green", "Pastel Green"],
    type: ["new-arrival"],
    isFeatured: false,
    variants: [
      { size: "S", color: "Mint Green", price: 13900, discount: 0, stock: 15 },
      { size: "M", color: "Mint Green", price: 13900, discount: 0, stock: 20 },
    ],
  },
  {
    name: "Hiba Bukhari Ruby Red Bridal Lehenga",
    description: "Opulent ruby red bridal lehenga choli with zardozi, kora & sequins work, inspired by Hiba Bukhari's bridal shoot.",
    brandName: "Maria B.",
    categoryName: "Bridal & Velvet Couture",
    mainImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Ruby Red", "Gold"],
    type: ["featured", "trending"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Ruby Red", price: 48900, discount: 10, stock: 3 },
      { size: "M", color: "Ruby Red", price: 48900, discount: 10, stock: 5 },
    ],
  },
  {
    name: "Kinza Hashmi Charcoal Silk Trousers & Kurti",
    description: "Modern raw silk charcoal gray kurti with sleek neckline cutouts and straight cigarette pants.",
    brandName: "Sapphire",
    categoryName: "Chic Western Blazers & Tops",
    mainImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Charcoal", "Black"],
    type: ["trending"],
    isFeatured: false,
    variants: [
      { size: "S", color: "Charcoal", price: 9500, discount: 0, stock: 20 },
      { size: "M", color: "Charcoal", price: 9500, discount: 0, stock: 24 },
    ],
  },
  {
    name: "Dur-e-Fishan Sunset Amber Jacquard Suit",
    description: "Warm sunset amber woven jacquard shirt with copper metallic threads and silk embroidered shawl.",
    brandName: "Gul Ahmed",
    categoryName: "Festive Lawn 3-Piece",
    mainImage: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Amber", "Rust", "Gold"],
    type: ["new-arrival"],
    isFeatured: false,
    variants: [
      { size: "S", color: "Amber", price: 11900, discount: 10, stock: 12 },
      { size: "M", color: "Amber", price: 11900, discount: 10, stock: 16 },
    ],
  },
  {
    name: "Hania Aamir Casual Chic Oversized Blazer",
    description: "Tailored beige wool-blend oversized blazer paired with high-waist trousers as seen on Hania Aamir.",
    brandName: "Sapphire",
    categoryName: "Chic Western Blazers & Tops",
    mainImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1548142813-c348350df52b?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Beige", "Camel"],
    type: ["trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "S", color: "Beige", price: 14900, discount: 15, stock: 11 },
      { size: "M", color: "Beige", price: 14900, discount: 15, stock: 17 },
    ],
  },

  // ── MEN PRODUCTS (Inspired by Fawad Khan, Bilal Abbas, Hamza Ali Abbasi) ─────
  {
    name: "Fawad Khan Royal Black Kurta Shalwar Set",
    description: "Signature raw silk black kurta shalwar set worn by Fawad Khan, featuring subtle band collar embroidery and horn buttons.",
    brandName: "J. (Junaid Jamshed)",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Jet Black", "Charcoal"],
    type: ["featured", "trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Jet Black", price: 9900, discount: 10, stock: 25 },
      { size: "L", color: "Jet Black", price: 9900, discount: 10, stock: 30 },
      { size: "XL", color: "Jet Black", price: 9900, discount: 10, stock: 15 },
    ],
  },
  {
    name: "Hamza Ali Abbasi Navy Blue Waistcoat Set",
    description: "Midnight navy blue tropical wool waistcoat paired with off-white cotton kurta kameez as styled for Hamza Ali Abbasi.",
    brandName: "J. (Junaid Jamshed)",
    categoryName: "Waistcoat & Sherwani Sets",
    mainImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Navy Blue", "Off-White"],
    type: ["featured", "trending"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Navy Blue", price: 14500, discount: 12, stock: 14 },
      { size: "L", color: "Navy Blue", price: 14500, discount: 12, stock: 20 },
      { size: "XL", color: "Navy Blue", price: 14500, discount: 12, stock: 8 },
    ],
  },
  {
    name: "Bilal Abbas Cream Silk Kurta with Metal Buttons",
    description: "Ivory cream spun silk kurta with antique brass buttons and cuff detailing inspired by Bilal Abbas Khan.",
    brandName: "Gul Ahmed",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Cream", "Ivory"],
    type: ["trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Cream", price: 8500, discount: 0, stock: 22 },
      { size: "L", color: "Cream", price: 8500, discount: 0, stock: 18 },
    ],
  },
  {
    name: "Wahaj Ali Charcoal Embroidered Kurta Kameez",
    description: "Charcoal gray Egyptian cotton kameez with self-colored neck tilla embroidery worn by Wahaj Ali.",
    brandName: "Khaadi",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Charcoal Gray", "Black"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Charcoal Gray", price: 9200, discount: 10, stock: 16 },
      { size: "L", color: "Charcoal Gray", price: 9200, discount: 10, stock: 21 },
    ],
  },
  {
    name: "Sheheryar Munawar Regal Velvet Sherwani",
    description: "Hand-crafted deep black velvet Sherwani with gold zardozi collar & regal brass motif buttons.",
    brandName: "Asim Jofa",
    categoryName: "Waistcoat & Sherwani Sets",
    mainImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Black", "Gold"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Black", price: 38900, discount: 15, stock: 5 },
      { size: "L", color: "Black", price: 38900, discount: 15, stock: 8 },
    ],
  },
  {
    name: "Feroze Khan Executive Navy Wool Suit",
    description: "Double-breasted Italian wool navy blue suit jacket with tapered formal trousers styled after Feroze Khan.",
    brandName: "Sapphire",
    categoryName: "Executive Suits & Blazers",
    mainImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Navy Blue", "Dark Navy"],
    type: ["trending"],
    isFeatured: false,
    variants: [
      { size: "M", color: "Navy Blue", price: 24900, discount: 10, stock: 11 },
      { size: "L", color: "Navy Blue", price: 24900, discount: 10, stock: 15 },
    ],
  },
  {
    name: "Farhan Saeed Pure White Summer Linen Kurta",
    description: "Breathable crisp white Irish linen kurta with lightweight feel for summer, as seen on Farhan Saeed.",
    brandName: "Gul Ahmed",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Pure White"],
    type: ["new-arrival"],
    isFeatured: false,
    variants: [
      { size: "M", color: "Pure White", price: 7900, discount: 0, stock: 35 },
      { size: "L", color: "Pure White", price: 7900, discount: 0, stock: 40 },
    ],
  },
  {
    name: "Ahad Raza Mir Olive Jacquard Waistcoat",
    description: "Olive green micro-textured jacquard waistcoat with silver insignia pin.",
    brandName: "J. (Junaid Jamshed)",
    categoryName: "Waistcoat & Sherwani Sets",
    mainImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Olive Green", "Khaki"],
    type: ["trending"],
    isFeatured: false,
    variants: [
      { size: "M", color: "Olive Green", price: 8900, discount: 5, stock: 18 },
      { size: "L", color: "Olive Green", price: 8900, discount: 5, stock: 22 },
    ],
  },
  {
    name: "Danish Taimoor Classic Maroon Kurta Kameez",
    description: "Rich maroon cotton satin kurta kameez set with concealed placket and embroidery accents.",
    brandName: "Khaadi",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Maroon", "Burgundy"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Maroon", price: 8800, discount: 10, stock: 14 },
      { size: "L", color: "Maroon", price: 8800, discount: 10, stock: 19 },
    ],
  },
  {
    name: "Usama Khan Casual Slim Fit Linen Shirt",
    description: "Casual ocean blue washed linen button-down shirt paired with beige chinos.",
    brandName: "Sapphire",
    categoryName: "Casual Shirts & Polos",
    mainImage: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Ocean Blue", "Sky Blue"],
    type: ["new-arrival"],
    isFeatured: false,
    variants: [
      { size: "M", color: "Ocean Blue", price: 5400, discount: 0, stock: 28 },
      { size: "L", color: "Ocean Blue", price: 5400, discount: 0, stock: 32 },
    ],
  },
  {
    name: "Imran Abbas Royal Blue Velvet Kurta Kameez",
    description: "Deep royal blue plush velvet embroidered kurta kameez set for winter weddings.",
    brandName: "Asim Jofa",
    categoryName: "Designer Kurta & Shalwar Kameez",
    mainImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Royal Blue", "Silver"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "M", color: "Royal Blue", price: 16900, discount: 15, stock: 9 },
      { size: "L", color: "Royal Blue", price: 16900, discount: 15, stock: 12 },
    ],
  },
  {
    name: "Azaan Sami Khan Tuxedo Formal Suit",
    description: "Classic black tuxedo blazer with satin lapels and formal trousers for galas & events.",
    brandName: "Sapphire",
    categoryName: "Executive Suits & Blazers",
    mainImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Black", "Satin Black"],
    type: ["trending"],
    isFeatured: false,
    variants: [
      { size: "M", color: "Black", price: 29500, discount: 10, stock: 7 },
      { size: "L", color: "Black", price: 29500, discount: 10, stock: 10 },
    ],
  },

  // ── KIDS & BABIES PRODUCTS ──────────────────────────────────────────────────
  {
    name: "Junior Prince White Kurta & Gold Waistcoat Set",
    description: "Royal white cotton kurta set for young boys with golden jacquard waistcoat.",
    brandName: "J. (Junaid Jamshed)",
    categoryName: "Boys Festive Kurta Suits",
    mainImage: "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1503944168849-8bf86875bbd8?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["White", "Gold"],
    type: ["featured", "trending"],
    isFeatured: true,
    variants: [
      { size: "4Y-5Y", color: "White", price: 4900, discount: 10, stock: 15 },
      { size: "6Y-7Y", color: "White", price: 4900, discount: 10, stock: 20 },
    ],
  },
  {
    name: "Little Princess Pink Floral Frock",
    description: "Charming pink chikankari frock for young girls with delicate floral embroidery.",
    brandName: "Khaadi",
    categoryName: "Girls Eastern Dresses",
    mainImage: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Pink", "Blush"],
    type: ["trending", "new-arrival"],
    isFeatured: true,
    variants: [
      { size: "4Y-5Y", color: "Pink", price: 4200, discount: 0, stock: 18 },
      { size: "6Y-7Y", color: "Pink", price: 4200, discount: 0, stock: 22 },
    ],
  },
  {
    name: "Soft Organic Cotton Baby Boy Kurta Onesie",
    description: "Ultra-soft 100% organic cotton baby boy kurta style romper with snap buttons.",
    brandName: "Sapphire",
    categoryName: "Baby Rompers & Cotton Sets",
    mainImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Sky Blue", "White"],
    type: ["new-arrival"],
    isFeatured: true,
    variants: [
      { size: "0-6M", color: "Sky Blue", price: 2900, discount: 0, stock: 30 },
      { size: "6-12M", color: "Sky Blue", price: 2900, discount: 0, stock: 35 },
    ],
  },
  {
    name: "Baby Girl Pastel Peach Embroidered Frock",
    description: "Cute pastel peach infant frock with soft inner lining and gentle lace trimmings.",
    brandName: "Maria B.",
    categoryName: "Soft Infant Festive Wear",
    mainImage: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&auto=format&fit=crop&q=85",
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=900&auto=format&fit=crop&q=85",
    ],
    colors: ["Pastel Peach", "Cream"],
    type: ["featured"],
    isFeatured: true,
    variants: [
      { size: "0-6M", color: "Pastel Peach", price: 3400, discount: 10, stock: 25 },
      { size: "6-12M", color: "Pastel Peach", price: 3400, discount: 10, stock: 28 },
    ],
  },
];

// ── 5. HERO SLIDES DATA ───────────────────────────────────────────────────────
const SLIDES_DATA = [
  {
    title: "Hania Aamir Festive Lawn Collection 2025",
    subtitle: "Discover effortless elegance in pure organza and digital printed chiffons crafted for your special moments.",
    eyebrow: "Exclusive Drop — Summer '25",
    badgeText: "30% OFF",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=85",
    buttonText: "Shop Women's Lawn",
    linkPath: "/shop?section=women",
    secondaryButtonText: "Explore Collection",
    secondaryLinkPath: "/about",
    order: 1,
    isActive: true,
    showStats: false,
  },
  {
    title: "Dur-e-Fishan Royal Velvet & Formals",
    subtitle: "Heavy hand-embroidered tilla peshwas and velvet lehengas styled for wedding grandeur.",
    eyebrow: "Haute Couture",
    badgeText: "Limited Edition",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=85",
    buttonText: "Shop Velvet Formals",
    linkPath: "/shop?section=women",
    secondaryButtonText: "View Formals",
    secondaryLinkPath: "/shop",
    order: 2,
    isActive: true,
    showStats: false,
  },
  {
    title: "Fawad Khan Regal Kurta & Sherwani Collection",
    subtitle: "Refined raw silk black kurtas and royal waistcoats for modern Pakistani gentlemen.",
    eyebrow: "Men's Luxury Ethnic",
    badgeText: "Trending Now",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1600&auto=format&fit=crop&q=85",
    buttonText: "Shop Men's Ethnic",
    linkPath: "/shop?section=men",
    secondaryButtonText: "About Us",
    secondaryLinkPath: "/about",
    order: 3,
    isActive: true,
    showStats: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
async function seedFullCatalog() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    // Clear old data
    console.log("Clearing old collections...");
    await Promise.all([
      Department.deleteMany({}),
      Brand.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Slide.deleteMany({}),
    ]);
    console.log("Old data cleared.");

    // 1. Seed Departments
    console.log("Seeding Departments...");
    const depts = await Department.insertMany(DEPARTMENTS_DATA);
    const deptMap = new Map();
    depts.forEach((d) => deptMap.set(d.slug, d));
    console.log(`Seeded ${depts.length} Departments.`);

    // 2. Seed Brands
    console.log("Seeding Brands...");
    const brands = await Brand.insertMany(BRANDS_DATA);
    const brandMap = new Map();
    brands.forEach((b) => brandMap.set(b.name, b));
    console.log(`Seeded ${brands.length} Brands.`);

    // 3. Seed Categories
    console.log("Seeding Categories...");
    const catDocs = CATEGORIES_SPEC.map((spec) => {
      const parentDept = deptMap.get(spec.deptSlug);
      return {
        name: spec.name,
        section: spec.section,
        department: parentDept ? parentDept._id : null,
        description: `Premium ${spec.name} collection`,
        image: spec.image,
        isActive: true,
      };
    });
    const categories = await Category.insertMany(catDocs);
    const categoryMap = new Map();
    categories.forEach((c) => categoryMap.set(c.name, c));
    console.log(`Seeded ${categories.length} Categories.`);

    // 4. Seed Products
    console.log("Seeding Products...");
    const productDocs = PRODUCTS_DATA.map((p) => {
      const brand = brandMap.get(p.brandName);
      const category = categoryMap.get(p.categoryName);
      return {
        name: p.name,
        description: p.description,
        brand: brand ? brand._id : brands[0]._id,
        category: category ? category._id : null,
        mainImage: p.mainImage,
        images: p.images || [p.mainImage],
        colors: p.colors || [],
        type: p.type || ["featured"],
        isFeatured: p.isFeatured ?? true,
        isActive: true,
        variants: p.variants || [],
      };
    });
    const products = await Product.insertMany(productDocs);
    console.log(`Seeded ${products.length} Products across Women, Men, Kids & Babies.`);

    // 5. Seed Hero Slides
    console.log("Seeding Hero Slides...");
    const slides = await Slide.insertMany(SLIDES_DATA);
    console.log(`Seeded ${slides.length} Hero Slides.`);

    console.log("────────────────────────────────────────────────────────────");
    console.log("✨ FULL DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨");
    console.log(`- ${depts.length} Departments (Women, Men, Kids, Babies)`);
    console.log(`- ${brands.length} Top Pakistani Brands (Maria B, Khaadi, Sapphire, J., Asim Jofa, Gul Ahmed)`);
    console.log(`- ${categories.length} Categories`);
    console.log(`- ${products.length} Products inspired by Hania Aamir, Dur-e-Fishan, Fawad Khan & others`);
    console.log(`- ${slides.length} Dynamic Hero Banner Slides`);
    console.log("────────────────────────────────────────────────────────────");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seedFullCatalog();
