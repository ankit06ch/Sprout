import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  ArrowRight,
  LineChart,
  Store,
  Factory,
  Package,
  Settings,
  ClipboardList,
  BarChart3,
  Bell,
  Download,
  Upload,
  Wifi,
  ShoppingCart,
  ExternalLink,
  Link,
  Zap,
  CheckCircle,
  AlertTriangle,
  Eye
} from "lucide-react";

// ---------------------------------------------
// Types
// ---------------------------------------------

type View =
  | "globe"
  | "evaluation"
  | "forecasts"
  | "orders"
  | "pastOrders"
  | "demand"
  | "products"
  | "stores"
  | "notices"
  | "settings"
  | "users"
  | "integrations";

interface OrderRow {
  vendor: string;
  productId: string;
  product: string;
  next: string; // ISO date
  onHand: number;
  proj: number;
  rec: number;
  retailer?: {
    name: string;
    website: string;
    apiEndpoint: string;
    price: number;
    availability: boolean;
  };
}


interface ApiConfig {
  posUrl?: string; // POS sales
  weatherUrl?: string; // weather
  trendsUrl?: string; // google trends
  usdaUrl?: string; // product data
  apiKeyPOS?: string;
  apiKeyWeather?: string;
  apiKeyTrends?: string;
  apiKeyUSDA?: string;
}

// ---------------------------------------------
// Sample Data (replace with real API later)
// ---------------------------------------------

const SAMPLE_ORDERS: OrderRow[] = [
  { 
    vendor: "Fresh Fields", 
    productId: "FF-OB-12", 
    product: "Organic Banana", 
    next: "2025-09-23", 
    onHand: 120, 
    proj: 80, 
    rec: 50,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 2.85,
      availability: true
    }
  },
  { 
    vendor: "Fresh Fields", 
    productId: "FF-LI-08", 
    product: "Limes", 
    next: "2025-09-23", 
    onHand: 60, 
    proj: 30, 
    rec: 40,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 1.95,
      availability: true
    }
  },
  { 
    vendor: "Nature's Best", 
    productId: "NB-ST-33", 
    product: "Strawberries", 
    next: "2025-09-23", 
    onHand: 200, 
    proj: 150, 
    rec: 60,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 4.25,
      availability: true
    }
  },
  { 
    vendor: "Nature's Best", 
    productId: "NB-CR-21", 
    product: "Carrot", 
    next: "2025-09-23", 
    onHand: 80, 
    proj: 40, 
    rec: 30,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 1.45,
      availability: false
    }
  },
  // Additional products for comprehensive inventory
  { 
    vendor: "Garden Fresh", 
    productId: "GF-AP-15", 
    product: "Apples Red Delicious", 
    next: "2025-09-24", 
    onHand: 150, 
    proj: 100, 
    rec: 75,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 2.15,
      availability: true
    }
  },
  { 
    vendor: "Dairy Direct", 
    productId: "DD-MK-02", 
    product: "Organic Milk 2%", 
    next: "2025-09-22", 
    onHand: 45, 
    proj: 120, 
    rec: 80,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 3.45,
      availability: true
    }
  },
  { 
    vendor: "Meat Masters", 
    productId: "MM-CH-08", 
    product: "Chicken Breast", 
    next: "2025-09-25", 
    onHand: 85, 
    proj: 60, 
    rec: 40,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 6.85,
      availability: true
    }
  },
  { 
    vendor: "Bakery Fresh", 
    productId: "BF-BR-12", 
    product: "Whole Wheat Bread", 
    next: "2025-09-22", 
    onHand: 25, 
    proj: 50, 
    rec: 30,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 2.95,
      availability: true
    }
  },
  { 
    vendor: "Seafood Co", 
    productId: "SC-SL-05", 
    product: "Salmon Fillet", 
    next: "2025-09-24", 
    onHand: 30, 
    proj: 25, 
    rec: 20,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 12.50,
      availability: true
    }
  },
  { 
    vendor: "Pantry Plus", 
    productId: "PP-TP-20", 
    product: "Toilet Paper 12-pack", 
    next: "2025-09-26", 
    onHand: 8, 
    proj: 45, 
    rec: 50,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 18.95,
      availability: true
    }
  },
  { 
    vendor: "Spice World", 
    productId: "SW-GA-03", 
    product: "Garlic Powder", 
    next: "2025-09-27", 
    onHand: 15, 
    proj: 8, 
    rec: 12,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 4.75,
      availability: true
    }
  },
  { 
    vendor: "Frozen Foods", 
    productId: "FF-PZ-14", 
    product: "Frozen Pizza Margherita", 
    next: "2025-09-25", 
    onHand: 120, 
    proj: 80, 
    rec: 60,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 7.25,
      availability: false
    }
  },
  { 
    vendor: "Organic Valley", 
    productId: "OV-EG-06", 
    product: "Free Range Eggs", 
    next: "2025-09-23", 
    onHand: 90, 
    proj: 70, 
    rec: 45,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 4.85,
      availability: true
    }
  },
  { 
    vendor: "Grain Masters", 
    productId: "GM-RC-09", 
    product: "Basmati Rice", 
    next: "2025-09-28", 
    onHand: 200, 
    proj: 150, 
    rec: 100,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 3.25,
      availability: true
    }
  },
  { 
    vendor: "Beverage Co", 
    productId: "BC-WA-11", 
    product: "Sparkling Water", 
    next: "2025-09-24", 
    onHand: 180, 
    proj: 120, 
    rec: 80,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 1.85,
      availability: true
    }
  },
  { 
    vendor: "Snack Time", 
    productId: "ST-CH-07", 
    product: "Dark Chocolate Bars", 
    next: "2025-09-26", 
    onHand: 65, 
    proj: 40, 
    rec: 35,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 5.95,
      availability: true
    }
  },
  // Additional Produce Items
  { 
    vendor: "Green Valley", 
    productId: "GV-BR-18", 
    product: "Broccoli Crowns", 
    next: "2025-09-24", 
    onHand: 75, 
    proj: 45, 
    rec: 40,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 2.95,
      availability: true
    }
  },
  { 
    vendor: "Farm Fresh", 
    productId: "FF-ON-22", 
    product: "Red Onions", 
    next: "2025-09-25", 
    onHand: 110, 
    proj: 80, 
    rec: 60,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 1.75,
      availability: true
    }
  },
  { 
    vendor: "Organic Harvest", 
    productId: "OH-TM-14", 
    product: "Tomatoes Roma", 
    next: "2025-09-23", 
    onHand: 95, 
    proj: 70, 
    rec: 50,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 3.25,
      availability: true
    }
  },
  { 
    vendor: "Crisp Greens", 
    productId: "CG-LT-09", 
    product: "Iceberg Lettuce", 
    next: "2025-09-22", 
    onHand: 85, 
    proj: 55, 
    rec: 45,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 2.45,
      availability: false
    }
  },
  { 
    vendor: "Citrus Grove", 
    productId: "CG-OR-33", 
    product: "Oranges Navel", 
    next: "2025-09-26", 
    onHand: 140, 
    proj: 100, 
    rec: 75,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 2.85,
      availability: true
    }
  },
  { 
    vendor: "Root Cellar", 
    productId: "RC-PT-27", 
    product: "Russet Potatoes", 
    next: "2025-09-28", 
    onHand: 200, 
    proj: 150, 
    rec: 120,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 1.95,
      availability: true
    }
  },
  { 
    vendor: "Pepper Patch", 
    productId: "PP-BP-41", 
    product: "Bell Peppers Mixed", 
    next: "2025-09-24", 
    onHand: 60, 
    proj: 40, 
    rec: 35,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 4.75,
      availability: true
    }
  },
  { 
    vendor: "Herb Garden", 
    productId: "HG-BL-16", 
    product: "Fresh Basil", 
    next: "2025-09-22", 
    onHand: 25, 
    proj: 15, 
    rec: 20,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 6.95,
      availability: true
    }
  },
  // Additional Dairy Items
  { 
    vendor: "Creamery Co", 
    productId: "CC-YG-29", 
    product: "Greek Yogurt Vanilla", 
    next: "2025-09-23", 
    onHand: 55, 
    proj: 35, 
    rec: 40,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 4.25,
      availability: true
    }
  },
  { 
    vendor: "Cheese Masters", 
    productId: "CM-CH-37", 
    product: "Sharp Cheddar Block", 
    next: "2025-09-25", 
    onHand: 40, 
    proj: 25, 
    rec: 30,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 8.95,
      availability: true
    }
  },
  { 
    vendor: "Butter Works", 
    productId: "BW-BT-44", 
    product: "Unsalted Butter", 
    next: "2025-09-24", 
    onHand: 30, 
    proj: 20, 
    rec: 25,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 5.75,
      availability: true
    }
  },
  { 
    vendor: "Sour Cream Co", 
    productId: "SC-SC-52", 
    product: "Sour Cream 16oz", 
    next: "2025-09-22", 
    onHand: 45, 
    proj: 30, 
    rec: 35,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 3.45,
      availability: false
    }
  },
  // Additional Meat Items
  { 
    vendor: "Beef Brothers", 
    productId: "BB-GB-58", 
    product: "Ground Beef 85/15", 
    next: "2025-09-23", 
    onHand: 70, 
    proj: 50, 
    rec: 45,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 7.95,
      availability: true
    }
  },
  { 
    vendor: "Pork Palace", 
    productId: "PP-BC-63", 
    product: "Bacon Thick Cut", 
    next: "2025-09-25", 
    onHand: 35, 
    proj: 25, 
    rec: 30,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 9.95,
      availability: true
    }
  },
  { 
    vendor: "Turkey Time", 
    productId: "TT-GT-67", 
    product: "Ground Turkey 93/7", 
    next: "2025-09-24", 
    onHand: 50, 
    proj: 35, 
    rec: 40,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 8.25,
      availability: true
    }
  },
  { 
    vendor: "Ham House", 
    productId: "HH-HM-71", 
    product: "Honey Ham Sliced", 
    next: "2025-09-26", 
    onHand: 25, 
    proj: 20, 
    rec: 22,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 11.95,
      availability: true
    }
  },
  // Additional Pantry Items
  { 
    vendor: "Pasta Pro", 
    productId: "PP-SP-75", 
    product: "Spaghetti 1lb", 
    next: "2025-09-27", 
    onHand: 120, 
    proj: 80, 
    rec: 90,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 2.25,
      availability: true
    }
  },
  { 
    vendor: "Sauce Specialists", 
    productId: "SS-MS-79", 
    product: "Marinara Sauce", 
    next: "2025-09-25", 
    onHand: 80, 
    proj: 55, 
    rec: 60,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 3.95,
      availability: true
    }
  },
  { 
    vendor: "Oil Experts", 
    productId: "OE-OO-83", 
    product: "Extra Virgin Olive Oil", 
    next: "2025-09-28", 
    onHand: 40, 
    proj: 25, 
    rec: 30,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 12.95,
      availability: true
    }
  },
  { 
    vendor: "Vinegar Co", 
    productId: "VC-BV-87", 
    product: "Balsamic Vinegar", 
    next: "2025-09-26", 
    onHand: 20, 
    proj: 15, 
    rec: 18,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 8.75,
      availability: false
    }
  },
  { 
    vendor: "Flour Mill", 
    productId: "FM-AF-91", 
    product: "All Purpose Flour", 
    next: "2025-09-29", 
    onHand: 100, 
    proj: 70, 
    rec: 80,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 4.95,
      availability: true
    }
  },
  { 
    vendor: "Sugar Sweet", 
    productId: "SS-WS-95", 
    product: "White Sugar 5lb", 
    next: "2025-09-27", 
    onHand: 75, 
    proj: 50, 
    rec: 55,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 3.75,
      availability: true
    }
  },
  // Additional Frozen Items
  { 
    vendor: "Frozen Fresh", 
    productId: "FF-BG-99", 
    product: "Frozen Broccoli", 
    next: "2025-09-26", 
    onHand: 90, 
    proj: 60, 
    rec: 70,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 4.25,
      availability: true
    }
  },
  { 
    vendor: "Ice Cream Co", 
    productId: "IC-VN-103", 
    product: "Vanilla Ice Cream", 
    next: "2025-09-24", 
    onHand: 60, 
    proj: 40, 
    rec: 45,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 6.95,
      availability: true
    }
  },
  { 
    vendor: "Frozen Meals", 
    productId: "FM-LS-107", 
    product: "Lasagna Frozen", 
    next: "2025-09-25", 
    onHand: 45, 
    proj: 30, 
    rec: 35,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 8.75,
      availability: true
    }
  },
  // Additional Bakery Items
  { 
    vendor: "Bread Basket", 
    productId: "BB-WW-111", 
    product: "White Bread Loaf", 
    next: "2025-09-22", 
    onHand: 35, 
    proj: 25, 
    rec: 30,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 2.45,
      availability: true
    }
  },
  { 
    vendor: "Roll Master", 
    productId: "RM-DR-115", 
    product: "Dinner Rolls 12ct", 
    next: "2025-09-23", 
    onHand: 50, 
    proj: 35, 
    rec: 40,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 3.95,
      availability: true
    }
  },
  { 
    vendor: "Croissant Co", 
    productId: "CC-BC-119", 
    product: "Butter Croissants", 
    next: "2025-09-22", 
    onHand: 30, 
    proj: 20, 
    rec: 25,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 5.25,
      availability: false
    }
  },
  // Additional Beverages
  { 
    vendor: "Juice Bar", 
    productId: "JB-OJ-123", 
    product: "Orange Juice Fresh", 
    next: "2025-09-23", 
    onHand: 65, 
    proj: 45, 
    rec: 50,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 4.95,
      availability: true
    }
  },
  { 
    vendor: "Coffee Corner", 
    productId: "CC-CF-127", 
    product: "Ground Coffee Dark", 
    next: "2025-09-26", 
    onHand: 40, 
    proj: 30, 
    rec: 35,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 7.95,
      availability: true
    }
  },
  { 
    vendor: "Tea Time", 
    productId: "TT-GT-131", 
    product: "Green Tea Bags", 
    next: "2025-09-28", 
    onHand: 55, 
    proj: 35, 
    rec: 40,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 5.25,
      availability: true
    }
  },
  // Additional Snacks
  { 
    vendor: "Chip Central", 
    productId: "CC-PC-135", 
    product: "Potato Chips Original", 
    next: "2025-09-25", 
    onHand: 80, 
    proj: 55, 
    rec: 60,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 3.95,
      availability: true
    }
  },
  { 
    vendor: "Nuts About", 
    productId: "NA-AL-139", 
    product: "Almonds Raw", 
    next: "2025-09-27", 
    onHand: 35, 
    proj: 25, 
    rec: 30,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 9.95,
      availability: true
    }
  },
  { 
    vendor: "Crackers Co", 
    productId: "CC-RC-143", 
    product: "Ritz Crackers", 
    next: "2025-09-24", 
    onHand: 70, 
    proj: 45, 
    rec: 50,
    retailer: {
      name: "US Foods",
      website: "https://www.usfoods.com",
      apiEndpoint: "https://api.usfoods.com/products",
      price: 4.25,
      availability: true
    }
  },
  // Additional Health & Beauty
  { 
    vendor: "Health First", 
    productId: "HF-SH-147", 
    product: "Shampoo 16oz", 
    next: "2025-09-26", 
    onHand: 45, 
    proj: 30, 
    rec: 35,
    retailer: {
      name: "Performance Food Group",
      website: "https://www.pfgc.com",
      apiEndpoint: "https://api.pfgc.com/products",
      price: 6.95,
      availability: true
    }
  },
  { 
    vendor: "Soap Works", 
    productId: "SW-HS-151", 
    product: "Hand Soap Refill", 
    next: "2025-09-25", 
    onHand: 60, 
    proj: 40, 
    rec: 45,
    retailer: {
      name: "Gordon Food Service",
      website: "https://www.gfs.com",
      apiEndpoint: "https://api.gfs.com/products",
      price: 4.75,
      availability: false
    }
  },
  { 
    vendor: "Clean Living", 
    productId: "CL-LD-155", 
    product: "Laundry Detergent", 
    next: "2025-09-28", 
    onHand: 25, 
    proj: 20, 
    rec: 22,
    retailer: {
      name: "Sysco",
      website: "https://www.sysco.com",
      apiEndpoint: "https://api.sysco.com/products",
      price: 12.95,
      availability: true
    }
  }
];


// ---------------------------------------------
// Small UI primitives
// ---------------------------------------------

const Card: React.FC<{ children: React.ReactNode; className?: string }>=({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-2xl ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}> = ({ children, variant = "primary", className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 shadow-lg hover:shadow-xl";
  const styles: Record<string, string> = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600 px-4 py-2",
    outline: "border border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-3 py-2",
    ghost: "text-emerald-700 hover:bg-gray-100 px-3 py-2"
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};





// ---------------------------------------------
// Chart Components
// ---------------------------------------------

const LineChartMini: React.FC<{ data: { x: string; p: number; a: number }[] }>=({ data }) => {
  const width = 360, height = 120; const pl = 28, pr = 8, pt = 8, pb = 18;
  const w = width - pl - pr, h = height - pt - pb;
  const max = Math.max(1, ...data.flatMap(d => [d.p, d.a]));
  const min = 0;
  const xStep = w / Math.max(1, data.length - 1);
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  
  // Create smooth curves using quadratic Bézier curves
  const smoothPath = (key: "p" | "a") => {
    if (data.length < 2) return "";
    let path = `M${pl},${pt + y(data[0][key])}`;
    for (let i = 1; i < data.length; i++) {
      const x1 = pl + (i - 1) * xStep;
      const y1 = pt + y(data[i - 1][key]);
      const x2 = pl + i * xStep;
      const y2 = pt + y(data[i][key]);
      const cp1x = x1 + xStep / 2;
      const cp1y = y1;
      const cp2x = x2 - xStep / 2;
      const cp2y = y2;
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
    return path;
  };
  
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[120px] border border-gray-200 rounded-lg bg-white/50">
        {/* Grid lines */}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={i} x1={pl} x2={width - pr} y1={pt + (i * h) / 3} y2={pt + (i * h) / 3} stroke="#f3f4f6" strokeWidth={1} />
        ))}
        {/* Y-axis labels */}
        {Array.from({ length: 4 }).map((_, i) => (
          <text key={i} x={pl - 5} y={pt + (i * h) / 3 + 4} fontSize="9" fill="#6b7280" textAnchor="end">
            {Math.round(max - (i * max) / 3)}
          </text>
        ))}
        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={pl + i * xStep} y={height - 5} fontSize="9" fill="#6b7280" textAnchor="middle">
            {d.x}
          </text>
        ))}
        {/* Smooth data lines */}
        <path d={smoothPath("p")} stroke="#10b981" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={smoothPath("a")} stroke="#f59e0b" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data point circles with subtle shadows */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={pl + i * xStep} cy={pt + y(d.p)} r={4} fill="#10b981" stroke="white" strokeWidth={1} />
            <circle cx={pl + i * xStep} cy={pt + y(d.a)} r={4} fill="#f59e0b" stroke="white" strokeWidth={1} />
          </g>
        ))}
      </svg>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-emerald-500 rounded"></div>
          <span className="text-gray-600">Predicted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-amber-500 rounded"></div>
          <span className="text-gray-600">Actual</span>
        </div>
      </div>
    </div>
  );
};

const BarChartMini: React.FC<{ data: { k: string; v: number }[] }>=({ data }) => {
  const max = Math.max(1, ...data.map(d => d.v));
  return (
    <div className="grid grid-cols-5 gap-3 h-32">
      {data.map((d) => (
        <div key={d.k} className="flex flex-col items-center justify-end h-full">
          <div className="h-20 w-8 bg-gray-100 rounded-md relative overflow-hidden shadow-inner flex-shrink-0">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-b-md transition-all duration-300" 
              style={{ height: `${(d.v / max) * 100}%` }} 
            />
          </div>
          <div className="mt-2 text-[9px] text-gray-600 text-center leading-tight">{d.k}</div>
          <div className="text-[8px] text-gray-500 font-medium">{d.v}%</div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------
// API helpers
// ---------------------------------------------

async function maybeFetch(url?: string, headers?: Record<string,string>) {
  if (!url) return null;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("API fetch failed:", e);
    return null; // stay resilient
  }
}

function useExternalData(cfg: ApiConfig) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ pos?: any; weather?: any; trends?: any; usda?: any }>({});
  const load = async () => {
    setLoading(true);
    const [pos, weather, trends, usda] = await Promise.all([
      maybeFetch(cfg.posUrl, cfg.apiKeyPOS ? { Authorization: `Bearer ${cfg.apiKeyPOS}` } : undefined),
      maybeFetch(cfg.weatherUrl, cfg.apiKeyWeather ? { Authorization: `Bearer ${cfg.apiKeyWeather}` } : undefined),
      maybeFetch(cfg.trendsUrl, cfg.apiKeyTrends ? { Authorization: `Bearer ${cfg.apiKeyTrends}` } : undefined),
      maybeFetch(cfg.usdaUrl, cfg.apiKeyUSDA ? { Authorization: `Bearer ${cfg.apiKeyUSDA}` } : undefined)
    ]);
    setData({ pos, weather, trends, usda });
    setLoading(false);
  };
  return { loading, data, load };
}

// ---------------------------------------------
// Left Navigation (expandable)
// ---------------------------------------------

const Section: React.FC<{ title: string; children: React.ReactNode }>=({ title, children })=>{
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
        <span>{title}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${open?"rotate-90":"rotate-0"}`} />
      </button>
      <div className={`${open?"block":"hidden"}`}>{children}</div>
    </div>
  );
};

const NavMenu: React.FC<{ current: View; setView: (v: View) => void }> = ({ current, setView }) => (
  <div className="space-y-4">
    <Section title="Analytics">
      <ul className="space-y-1 text-sm">
        <li><button onClick={()=>setView("evaluation")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="evaluation"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><BarChart3 className="inline w-4 h-4 mr-1"/> Evaluation</button></li>
        <li><button onClick={()=>setView("forecasts")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="forecasts"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><LineChart className="inline w-4 h-4 mr-1"/> Forecasts</button></li>
      </ul>
    </Section>
    <Section title="Orders">
      <ul className="space-y-1 text-sm">
        <li><button onClick={()=>setView("orders")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="orders"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><ClipboardList className="inline w-4 h-4 mr-1"/> DC Buyer Ordering</button></li>
        <li><button onClick={()=>setView("pastOrders")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="pastOrders"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}>Past Orders</button></li>
      </ul>
    </Section>
    <Section title="Management">
      <ul className="space-y-1 text-sm">
        <li><button onClick={()=>setView("demand")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="demand"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><Factory className="inline w-4 h-4 mr-1"/> Demand Drivers</button></li>
        <li><button onClick={()=>setView("products")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="products"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><Package className="inline w-4 h-4 mr-1"/> Products</button></li>
        <li><button onClick={()=>setView("stores")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="stores"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><Store className="inline w-4 h-4 mr-1"/> Stores</button></li>
        <li><button onClick={()=>setView("notices")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="notices"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><Bell className="inline w-4 h-4 mr-1"/> Notices</button></li>
      </ul>
    </Section>
    <Section title="Admin">
      <ul className="space-y-1 text-sm">
        <li><button onClick={()=>setView("users")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="users"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}>User Management</button></li>
        <li><button onClick={()=>setView("integrations")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="integrations"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}>Integrations</button></li>
        <li><button onClick={()=>setView("settings")} className={`w-full text-left px-3 py-2 rounded-lg ${current==="settings"?"bg-emerald-100 text-emerald-700":"hover:bg-gray-100"}`}><Settings className="inline w-4 h-4 mr-1"/> Settings</button></li>
      </ul>
    </Section>
  </div>
);

// ---------------------------------------------
// Evaluation Screen with Interactive Store Layout
// ---------------------------------------------

const EvaluationScreen: React.FC = () => {
  const [store, setStore] = useState("All Stores");
  const [category, setCategory] = useState("All");
  const [range, setRange] = useState("Last 30 days");
  const [cfg] = useState<ApiConfig>({});
  const { loading, data, load } = useExternalData(cfg);
  
  // Interactive variables state
  const [activeVariables, setActiveVariables] = useState<Set<string>>(new Set());
  
  const toggleVariable = (variable: string) => {
    const newActive = new Set(activeVariables);
    if (newActive.has(variable)) {
      newActive.delete(variable);
    } else {
      newActive.add(variable);
    }
    setActiveVariables(newActive);
  };

  // Base sales data
  const baseSalesSeries = [
    { x: "Mon", p: 120, a: 110 },
    { x: "Tue", p: 140, a: 135 },
    { x: "Wed", p: 130, a: 138 },
    { x: "Thu", p: 160, a: 150 },
    { x: "Fri", p: 190, a: 200 },
    { x: "Sat", p: 220, a: 210 },
    { x: "Sun", p: 150, a: 158 }
  ];

  // Calculate dynamic sales data based on active variables
  const salesSeries = useMemo(() => {
    return baseSalesSeries.map(day => {
      let predictedMultiplier = 1;
      let actualMultiplier = 1;

      // Weather effects (affects both predicted and actual)
      if (activeVariables.has('weather')) {
        const weatherBoost = 1.15; // 15% increase
        predictedMultiplier *= weatherBoost;
        actualMultiplier *= weatherBoost;
      }

      // Promotions effects (stronger on actual sales)
      if (activeVariables.has('promotions')) {
        const promoBoost = 1.25; // 25% increase
        predictedMultiplier *= 1.1; // 10% increase for predictions
        actualMultiplier *= promoBoost;
      }

      // Events effects (affects both)
      if (activeVariables.has('events')) {
        const eventBoost = 1.2; // 20% increase
        predictedMultiplier *= eventBoost;
        actualMultiplier *= eventBoost;
      }

      return {
        x: day.x,
        p: Math.round(day.p * predictedMultiplier),
        a: Math.round(day.a * actualMultiplier)
      };
    });
  }, [activeVariables]);

  // Calculate dynamic KPI values based on active variables
  const kpiValues = useMemo(() => {
    let mae = 12.3;
    let rmse = 20.5;
    let wmape = 8.4;
    let bias = -1.2;
    let coverage = 93;

    // Weather improves accuracy
    if (activeVariables.has('weather')) {
      mae *= 0.9;
      rmse *= 0.9;
      wmape *= 0.9;
    }

    // Promotions can increase bias (over-prediction)
    if (activeVariables.has('promotions')) {
      bias += 2.5;
      mae *= 1.1;
    }

    // Events improve coverage
    if (activeVariables.has('events')) {
      coverage += 3;
      wmape *= 0.95;
    }

    return {
      mae: Math.round(mae * 10) / 10,
      rmse: Math.round(rmse * 10) / 10,
      wmape: Math.round(wmape * 10) / 10,
      bias: Math.round(bias * 10) / 10,
      coverage: Math.round(coverage)
    };
  }, [activeVariables]);

  const accuracyByDept = [
    { k: "Produce", v: 94 },
    { k: "Meat", v: 91 },
    { k: "Deli", v: 88 },
    { k: "Bakery", v: 90 },
    { k: "Center", v: 86 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Modern Header with Controls */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time forecasting performance and demand insights</p>
          </div>
          
          {/* Compact Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-lg">
              <Store className="w-4 h-4 text-gray-500" />
              <select value={store} onChange={(e)=>setStore(e.target.value)} className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none">
                {['All Stores','Encino','NYC','Dallas','Miami'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-lg">
              <Package className="w-4 h-4 text-gray-500" />
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none">
                {['All','Produce','Meat','Bakery','Center Store'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-lg">
              <Settings className="w-4 h-4 text-gray-500" />
              <select value={range} onChange={(e)=>setRange(e.target.value)} className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none">
                {['Last 7 days','Last 30 days','Quarter to date','Year to date'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-blue-200/30 shadow-lg">
              <Wifi className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">External APIs</span>
              <Button 
                variant="outline" 
                onClick={load} 
                className="bg-blue-500/10 border-blue-300 text-blue-700 hover:bg-blue-500/20 h-7 px-3 text-xs"
              >
                <Download className="w-3 h-3 mr-1"/> Pull
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MAE</div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <span className="text-red-600 text-lg">📊</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{kpiValues.mae}</div>
          <div className="text-xs text-gray-500">Mean Absolute Error</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">RMSE</div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <span className="text-orange-600 text-lg">📈</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{kpiValues.rmse}</div>
          <div className="text-xs text-gray-500">Root Mean Square Error</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">WMAPE</div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <span className="text-blue-600 text-lg">🎯</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{kpiValues.wmape}%</div>
          <div className="text-xs text-gray-500">Weighted MAPE</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bias</div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <span className="text-purple-600 text-lg">⚖️</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{kpiValues.bias}%</div>
          <div className="text-xs text-gray-500">Forecast Bias</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Coverage</div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <span className="text-green-600 text-lg">✅</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{kpiValues.coverage}%</div>
          <div className="text-xs text-gray-500">Prediction Coverage</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Forecast Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Forecast vs. Actual Sales</h3>
              <p className="text-sm text-gray-600">Weekly performance comparison</p>
            </div>
            {activeVariables.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700">Live Impact Active</span>
              </div>
            )}
          </div>
          <div className="h-64">
            <LineChartMini data={salesSeries} />
          </div>
        </div>

        {/* Department Accuracy Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Department Accuracy</h3>
            <p className="text-sm text-gray-600">Forecast precision by category</p>
          </div>
          <div className="h-64">
            <BarChartMini data={accuracyByDept.map(d=>({k:d.k, v:d.v}))} />
          </div>
        </div>
      </div>

      {/* Demand Drivers Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-lg mb-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Demand Drivers & External Factors</h3>
          <p className="text-gray-600">Toggle variables to see their impact on forecasting accuracy</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Weather */}
          <div 
            onClick={() => toggleVariable('weather')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
              activeVariables.has('weather') 
                ? 'border-blue-500 bg-blue-50/80 shadow-lg scale-105' 
                : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌤️</div>
              <div className="font-semibold text-gray-800 mb-1">Weather</div>
              <div className="text-sm text-gray-600">Temperature, rain, storms</div>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                {activeVariables.has('weather') ? '✓ Active' : 'Click to activate'}
              </div>
            </div>
          </div>

          {/* Promotions */}
          <div 
            onClick={() => toggleVariable('promotions')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
              activeVariables.has('promotions') 
                ? 'border-green-500 bg-green-50/80 shadow-lg scale-105' 
                : 'border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-50/30 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
              <div className="font-semibold text-gray-800 mb-1">Promotions</div>
              <div className="text-sm text-gray-600">Sales, discounts, BOGO</div>
              <div className="mt-2 text-xs text-green-600 font-medium">
                {activeVariables.has('promotions') ? '✓ Active' : 'Click to activate'}
              </div>
            </div>
          </div>

          {/* Events */}
          <div 
            onClick={() => toggleVariable('events')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
              activeVariables.has('events') 
                ? 'border-purple-500 bg-purple-50/80 shadow-lg scale-105' 
                : 'border-gray-200 bg-white/50 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎉</div>
              <div className="font-semibold text-gray-800 mb-1">Events</div>
              <div className="text-sm text-gray-600">Holidays, festivals, sports</div>
              <div className="mt-2 text-xs text-purple-600 font-medium">
                {activeVariables.has('events') ? '✓ Active' : 'Click to activate'}
              </div>
            </div>
          </div>
        </div>

        {/* Active Variables Summary */}
        {activeVariables.size > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800 mb-1">
                  Active Variables ({activeVariables.size})
                </div>
                <div className="text-sm text-gray-600">These factors are currently influencing your forecasts</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(activeVariables).map(variable => (
                  <span 
                    key={variable}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium shadow-sm"
                  >
                    {variable.charAt(0).toUpperCase() + variable.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* External Data Section */}
      {loading && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Fetching external data...</span>
          </div>
        </div>
      )}
      
      {(data.pos || data.weather || data.trends) && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">External Data Sources</h3>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Connected</span>
          </div>
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
            <pre className="text-sm max-h-48 overflow-auto text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------
// Orders Screen with Interactive Table
// ---------------------------------------------

const OrdersScreen: React.FC = () => {
  const [orders] = useState<OrderRow[]>(SAMPLE_ORDERS);
  const [selectedRetailers, setSelectedRetailers] = useState<Set<string>>(new Set());
  const [orderStatus, setOrderStatus] = useState<{[key: string]: 'pending' | 'processing' | 'completed' | 'failed'}>({});
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'exported'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [productDetails, setProductDetails] = useState<{[key: string]: boolean}>({});
  
  // Show limited products initially (first 4), all products when showAllProducts is true
  const displayedOrders = showAllProducts ? orders : orders.slice(0, 4);
  
  const handleRetailerOrder = async (productId: string, retailer: OrderRow['retailer']) => {
    if (!retailer) return;
    
    setOrderStatus(prev => ({ ...prev, [productId]: 'processing' }));
    
    try {
      // Simulate API call to retailer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate order placement
      console.log(`Ordering ${productId} from ${retailer.name}`);
      setOrderStatus(prev => ({ ...prev, [productId]: 'completed' }));
      
      // Add to selected retailers
      setSelectedRetailers(prev => new Set([...prev, retailer.name]));
      
    } catch (error) {
      setOrderStatus(prev => ({ ...prev, [productId]: 'failed' }));
      console.error('Order failed:', error);
    }
  };
  
  const handleBulkOrder = async () => {
    const availableOrders = orders.filter(order => order.retailer?.availability);
    
    for (const order of availableOrders) {
      await handleRetailerOrder(order.productId, order.retailer);
    }
  };

  const handleExport = async () => {
    setExportStatus('exporting');
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create export data
      const exportData = {
        timestamp: new Date().toISOString(),
        totalItems: orders.length,
        totalRecommended: orders.reduce((sum, o) => sum + o.rec, 0),
        avgProjection: Math.round(orders.reduce((sum, o) => sum + o.proj, 0) / orders.length),
        orders: orders.map(order => ({
          ...order,
          status: orderStatus[order.productId] || 'pending'
        })),
        selectedRetailers: Array.from(selectedRetailers)
      };
      
      // Download as JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dc-buyer-orders-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setExportStatus('exported');
      setTimeout(() => setExportStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('idle');
    }
  };

  const handleSubmitOrders = async () => {
    setSubmitStatus('submitting');
    
    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const completedOrders = orders.filter(order => orderStatus[order.productId] === 'completed');
      console.log(`Submitted ${completedOrders.length} orders to DC`);
      
      setSubmitStatus('submitted');
      setTimeout(() => setSubmitStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Order submission failed:', error);
      setSubmitStatus('idle');
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === displayedOrders.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(displayedOrders.map(order => order.productId)));
    }
  };

  const handleViewDetails = (productId: string) => {
    setProductDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">DC Buyer Ordering</h1>
          <p className="text-sm text-gray-600">Smart recommendations for next week's orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleExport}
            disabled={exportStatus === 'exporting'}
          >
            {exportStatus === 'exporting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Exporting...
              </>
            ) : exportStatus === 'exported' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600"/>
                Exported!
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2"/>
                Export
              </>
            )}
          </Button>
          <Button 
            onClick={handleBulkOrder}
            disabled={!orders.some(o => o.retailer?.availability)}
          >
            <ShoppingCart className="h-4 w-4 mr-2"/> Bulk Order from Retailers
          </Button>
          <Button 
            onClick={handleSubmitOrders}
            disabled={submitStatus === 'submitting' || !orders.some(o => orderStatus[o.productId] === 'completed')}
          >
            {submitStatus === 'submitting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : submitStatus === 'submitted' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2"/>
                Submitted!
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2"/>
                Submit Orders
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Show All Products Button */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div>
          <h3 className="font-semibold text-blue-800">
            {showAllProducts ? `Showing all ${orders.length} products` : `Showing ${displayedOrders.length} of ${orders.length} products`}
          </h3>
          <p className="text-sm text-blue-600">
            {showAllProducts ? 'Click to show only priority items' : 'Click to view complete inventory'}
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowAllProducts(!showAllProducts)}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          {showAllProducts ? 'Show Priority Items' : 'Show All Products'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Total Items</div>
          <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Total Recommended</div>
          <div className="text-2xl font-bold text-gray-800">{orders.reduce((sum, o) => sum + o.rec, 0)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Avg Projection</div>
          <div className="text-2xl font-bold text-gray-800">{Math.round(orders.reduce((sum, o) => sum + o.proj, 0) / orders.length)}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Product Orders</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedProducts.size === displayedOrders.length && displayedOrders.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {selectedProducts.size > 0 ? `${selectedProducts.size} selected` : 'Select all'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Vendor</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Product</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Next Delivery</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">On Hand</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Projected</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Recommended</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Retailer</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((order, idx) => {
                const status = orderStatus[order.productId] || 'pending';
                const isSelected = selectedProducts.has(order.productId);
                const showDetails = productDetails[order.productId];
                return (
                  <React.Fragment key={idx}>
                    <tr className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductSelect(order.productId)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="font-medium text-gray-800">{order.vendor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-800">{order.product}</div>
                          <div className="text-xs text-gray-500">{order.productId}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-600">{order.next}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-gray-800">{order.onHand}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-blue-600">{order.proj}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-mono text-emerald-600 font-bold">{order.rec}</span>
                      </td>
                      <td className="py-3 px-2">
                        {order.retailer ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${order.retailer.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="font-medium text-gray-800">{order.retailer.name}</span>
                            </div>
                            <div className="text-xs text-gray-600">${order.retailer.price.toFixed(2)}/unit</div>
                            <a 
                              href={order.retailer.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3"/>
                              Visit Site
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">No retailer</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {order.retailer && order.retailer.availability ? (
                            <Button 
                              variant="ghost" 
                              className="p-2 h-8 flex items-center gap-1 text-xs"
                              onClick={() => handleRetailerOrder(order.productId, order.retailer)}
                              disabled={status === 'processing'}
                              title={status === 'processing' ? 'Processing order...' : 
                                     status === 'completed' ? 'Order completed successfully' :
                                     status === 'failed' ? 'Order failed - click to retry' :
                                     'Order from retailer'}
                            >
                              {status === 'processing' ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  <span className="text-blue-600">Processing</span>
                                </>
                              ) : status === 'completed' ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-600"/>
                                  <span className="text-green-600">Ordered</span>
                                </>
                              ) : status === 'failed' ? (
                                <>
                                  <AlertTriangle className="h-3 w-3 text-red-600"/>
                                  <span className="text-red-600">Failed</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-3 w-3 text-blue-600"/>
                                  <span className="text-blue-600">Order</span>
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button variant="ghost" className="p-2 h-8 flex items-center gap-1 text-xs" disabled title="Not available from retailer">
                              <AlertTriangle className="h-3 w-3 text-gray-400"/>
                              <span className="text-gray-400">Unavailable</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            className="p-2 h-8 flex items-center gap-1 text-xs"
                            onClick={() => handleViewDetails(order.productId)}
                            title={showDetails ? "Hide product details" : "View product details"}
                          >
                            <Eye className="h-3 w-3 text-gray-600"/>
                            <span className="text-gray-600">{showDetails ? 'Hide' : 'Details'}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {showDetails && (
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={8} className="py-4 px-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800 mb-3">Product Details: {order.product}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-sm font-medium text-gray-600">Vendor Info</div>
                                <div className="text-sm text-gray-800">{order.vendor}</div>
                                <div className="text-xs text-gray-500">{order.productId}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-600">Inventory Status</div>
                                <div className="text-sm text-gray-800">On Hand: {order.onHand}</div>
                                <div className="text-sm text-blue-600">Projected: {order.proj}</div>
                                <div className="text-sm text-emerald-600">Recommended: {order.rec}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-600">Next Delivery</div>
                                <div className="text-sm text-gray-800">{new Date(order.next).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-600">Retailer Info</div>
                                {order.retailer ? (
                                  <>
                                    <div className="text-sm text-gray-800">{order.retailer.name}</div>
                                    <div className="text-sm text-green-600">${order.retailer.price.toFixed(2)}/unit</div>
                                    <div className={`text-xs ${order.retailer.availability ? 'text-green-600' : 'text-red-600'}`}>
                                      {order.retailer.availability ? 'Available' : 'Unavailable'}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-500">No retailer available</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Retailer Integration Status */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-600"/>
          Retailer Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Sysco', 'US Foods', 'Performance Food Group', 'Gordon Food Service'].map((retailer) => (
            <div key={retailer} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                selectedRetailers.has(retailer) ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">{retailer}</span>
              {selectedRetailers.has(retailer) && (
                <Zap className="h-4 w-4 text-green-600"/>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <strong>Integration Features:</strong> Real-time inventory, automated ordering, price comparison, delivery tracking
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------
// Main Enhanced UI Component
// ---------------------------------------------

const GroceryForecastingApp: React.FC = () => {
  const [view, setView] = useState<View>("globe");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 text-gray-800 relative overflow-hidden">
      {/* Curved Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-emerald-200/25 to-cyan-200/25 rounded-full blur-3xl"></div>
      </div>
      
      {/* Left Nav - Floating */}
      <aside className="fixed left-4 top-4 w-64 h-[calc(100vh-2rem)] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-4 overflow-y-auto z-50">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 grid place-items-center text-white font-bold">G</div>
          <span className="font-semibold tracking-wide text-gray-700">Guac Platform</span>
        </div>
        <NavMenu current={view} setView={setView} />
      </aside>

      {/* Center Workspace */}
      <main className="ml-72 pt-4 px-4 pb-4 overflow-y-auto relative z-10">
        {view === "globe" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Global Forecasting Dashboard</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline"><Upload className="h-4 w-4"/> Upload Data</Button>
                <Button><ArrowRight className="h-4 w-4"/> Request Demo</Button>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Enhanced Forecasting Platform</h2>
              <p className="text-gray-600 mb-6">This is the enhanced UI with interactive store layout and comprehensive forecasting features.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Interactive Store Layout</div>
                  <div className="text-xs text-gray-500">Hover over aisles to explore product performance</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Demand Drivers</div>
                  <div className="text-xs text-gray-500">External factors affecting sales predictions</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Real-time Analytics</div>
                  <div className="text-xs text-gray-500">Live impact visualization on forecasts</div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === "evaluation" && <EvaluationScreen />}
        
        {view === "forecasts" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Forecasts Screen</h2>
            <p className="text-gray-600">Future demand projections and seasonal trend analysis.</p>
          </div>
        )}
        
        {view === "orders" && <OrdersScreen />}
        
        {view === "pastOrders" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Orders</h2>
            <p className="text-gray-600">Historical order analysis and performance tracking.</p>
          </div>
        )}
        
        {view === "demand" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Demand Drivers</h2>
            <p className="text-gray-600">External factors and market conditions affecting demand.</p>
          </div>
        )}
        
        {view === "products" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Products</h2>
            <p className="text-gray-600">Product management and performance analytics.</p>
          </div>
        )}
        
        {view === "stores" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Stores</h2>
            <p className="text-gray-600">Store performance and location-based insights.</p>
          </div>
        )}
        
        {view === "notices" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notices</h2>
            <p className="text-gray-600">System alerts and important notifications.</p>
          </div>
        )}
        
        {view === "users" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">User Management</h2>
            <p className="text-gray-600">User roles and access management.</p>
          </div>
        )}
        
        {view === "integrations" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Integrations</h2>
            <p className="text-gray-600">Connect POS, ERP, and supplier feeds.</p>
          </div>
        )}
        
        {view === "settings" && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">System configuration and preferences.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Export the main component and individual screens
export { GroceryForecastingApp, EvaluationScreen, OrdersScreen };