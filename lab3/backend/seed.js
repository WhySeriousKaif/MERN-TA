// =========================================================
// Product Seed Script (Lab 03)
// =========================================================
// Populates MongoDB with realistic sample catalog items across:
// - Electronics
// - Fashion
// - Books
// - Home
//
// Run using: npm run seed  OR  node seed.js
// =========================================================

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const sampleProducts = [
  // Electronics
  {
    name: "Mechanical Gaming Keyboard",
    description:
      "Full-sized mechanical keyboard with tactile blue switches, per-key RGB backlighting, and detachable magnetic wrist rest.",
    price: 3499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    stock: 15,
  },
  {
    name: "Noise Cancelling Wireless Headphones",
    description:
      "Over-ear bluetooth headphones featuring active hybrid noise cancellation, 40-hour battery life, and ultra-plush memory foam earcups.",
    price: 6999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 22,
  },
  {
    name: "Ergonomic Optical Wireless Mouse",
    description:
      "Precision 4000 DPI wireless mouse designed to reduce wrist strain with silent click buttons and rechargeable USB-C battery.",
    price: 1499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    stock: 30,
  },
  {
    name: "Smart Fitness Watch Ultra",
    description:
      "Crisp AMOLED display with continuous heart rate, SpO2 monitoring, multi-sport tracking, and 7-day battery endurance.",
    price: 4299,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    stock: 8,
  },

  // Fashion
  {
    name: "Classic Denim Jacket",
    description:
      "Timeless medium-wash cotton denim jacket with reinforced button closures and double chest flap pockets.",
    price: 2499,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    stock: 18,
  },
  {
    name: "Breathable Running Sneakers",
    description:
      "Lightweight athletic shoes with shock-absorbing foam midsoles and high-grip rubber outsoles for peak endurance.",
    price: 3299,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    stock: 12,
  },
  {
    name: "Minimalist Polarized Sunglasses",
    description:
      "Sleek matte black sunglasses with UV400 polarized lenses for glare-free visual clarity and scratch resistance.",
    price: 1199,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    stock: 25,
  },

  // Books
  {
    name: "Designing Data-Intensive Applications",
    description:
      "The definitive guide to the architecture, scalability, reliability, and maintainability of modern data systems by Martin Kleppmann.",
    price: 1899,
    category: "Books",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    stock: 14,
  },
  {
    name: "Atomic Habits by James Clear",
    description:
      "A proven, practical framework for breaking bad behaviors and building positive daily micro-habits that deliver massive results.",
    price: 599,
    category: "Books",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    stock: 40,
  },
  {
    name: "Clean Code: A Handbook of Agile Craftsmanship",
    description:
      "Robert C. Martin's landmark software engineering guide on writing readable, reusable, and testable code.",
    price: 1499,
    category: "Books",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    stock: 19,
  },

  // Home
  {
    name: "Aroma Ultrasonic Ceramic Diffuser",
    description:
      "Whisper-quiet essential oil diffuser with ambient warm-light glow, automated shutoff, and handcrafted matte ceramic finish.",
    price: 2199,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    stock: 16,
  },
  {
    name: "Stainless Steel Gooseneck Pour-Over Kettle",
    description:
      "Precision flow spout with integrated analog thermometer, ergonomic wood-finish handle, and rapid-heating base.",
    price: 2799,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    stock: 10,
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
    console.log("Connecting to MongoDB for seeding at:", mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Clearing existing products...");
    await Product.deleteMany({});

    console.log(`Inserting ${sampleProducts.length} sample products...`);
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`Successfully seeded ${inserted.length} products!`);
    inserted.forEach((p) => {
      console.log(`- [${p.category}] ${p.name} (₹${p.price}) -> Stock: ${p.stock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
