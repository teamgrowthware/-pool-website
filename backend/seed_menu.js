require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Menu Seeding'))
  .catch(err => console.error(err));

const seedMenu = async () => {
  const items = [
    {
      name: "Midnight Espresso",
      price: 6.50,
      category: "Drinks",
      description: "Dark roast blend with a hint of dark chocolate and velvet foam.",
      image: "https://loremflickr.com/400/300/coffee,espresso"
    },
    {
      name: "Blue Lagoon Mocktail",
      price: 8.00,
      category: "Drinks",
      description: "Refreshing citrus blend with blue curaçao syrup and mint.",
      image: "https://loremflickr.com/400/300/cocktail,blue"
    },
    {
      name: "Truffle Fries",
      price: 12.00,
      category: "Snacks",
      description: "Crispy fries tossed in truffle oil, parmesan, and herbs.",
      image: "https://loremflickr.com/400/300/fries"
    },
    {
      name: "Classic Club Sandwich",
      price: 14.50,
      category: "Mains",
      description: "Triple-decker toasted sandwich with chicken, bacon, lettuce, tomato.",
      image: "https://loremflickr.com/400/300/sandwich"
    },
    {
      name: "Lava Cake",
      price: 9.00,
      category: "Dessert",
      description: "Warm chocolate cake with a molten center, served with vanilla ice cream.",
      image: "https://loremflickr.com/400/300/cake,chocolate"
    }
  ];

  try {
    await MenuItem.deleteMany({}); // Clear existing
    await MenuItem.insertMany(items);
    console.log('Menu Items Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedMenu();
