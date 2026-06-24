const mongoose = require("mongoose");

// 1. Paste your Product Schema definition here so the script can communicate with MongoDB
// (Update the fields below if your schema layout has different keys)
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, default: "active" },
  stock: { type: Number, default: 10 },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// 2. Mock Data Configuration Pools
const categories = ["Fashion", "Electronics", "Furniture", "Appliances", "Accessories"];
const brands = ["Logitech", "Nike", "Sony", "Dell", "IKEA", "Apple", "Samsung", "Adidas"];
const productTypes = {
  Fashion: ["T-Shirt", "Hoodie", "Jeans", "Jacket", "Sneakers", "Running Shoes"],
  Electronics: ["Wireless Mouse", "Mechanical Keyboard", "Monitor", "Headphones", "Smartwatch"],
  Furniture: ["Wooden Dining Table", "Ergonomic Office Chair", "Fabric Sofa", "Bookshelf", "Bed Frame"],
  Appliances: ["Coffee Maker", "Air Purifier", "Microwave Oven", "Blender", "Toaster"],
  Accessories: ["Leather Wallet", "Backpack", "Sunglasses", "Stainless Steel Water Bottle"]
};

const imagePool = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // Watch
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", // Headphones
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // Red shoe
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f", // Sunglasses
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf", // Monitor
];

// Helper to generate URL safe slugs
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// 3. Core Generation Seeder Function
async function seedDatabase() {
  // Replace this string with your local or Atlas MongoDB URI connection details string
  const MONGO_URI = "mongodb://localhost:27017/admin-panel"; 

  try {
    console.log("🛰️ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database connected successfully.");

    // Optional: Clean out previous data to avoid code crashes from old duplicate keys
    // await Product.deleteMany({}); 
    // console.log("🗑️ Cleared out old product entries.");

    const totalProductsToCreate = 450; 
    const bulkProductsArray = [];

    console.log(`📦 Generating ${totalProductsToCreate} realistic mock data models...`);

    for (let i = 1; i <= totalProductsToCreate; i++) {
      // Pick a random category and build item name string combinations
      const category = categories[Math.floor(Math.random() * categories.length)];
      const types = productTypes[category];
      const type = types[Math.floor(Math.random() * types.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      const title = `${brand} ${type} - Model v${i}`;
      const slug = `${slugify(brand)}-${slugify(type)}-${i}`; // Ensures exact uniqueness
      
      const price = Math.floor(Math.random() * 480) + 20; // Price between $20 and $500
      const hasDiscount = Math.random() > 0.6;
      const compareAtPrice = hasDiscount ? Math.floor(price * 1.3) : 0;
      
      const stock = Math.floor(Math.random() * 95) + 5; // Stock count between 5 and 100
      const randomImg = imagePool[Math.floor(Math.random() * imagePool.length)];

      bulkProductsArray.push({
        title,
        slug,
        description: `This premium ${brand} ${type} offers high quality design, reliable endurance, and standard functionality. Perfect choice for everyday usage within our expanding ${category} collection layout.`,
        price,
        compareAtPrice,
        category,
        images: [randomImg],
        status: "active",
        stock
      });
    }

    // Insert everything efficiently via a single MongoDB bulk write
    console.log("📥 Writing bulk payload data to database collection...");
    await Product.insertMany(bulkProductsArray);
    
    console.log(`🎉 Success! Successfully inserted ${totalProductsToCreate} dummy testing records.`);
  } catch (error) {
    console.error("❌ Seeding operation terminated with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seedDatabase();