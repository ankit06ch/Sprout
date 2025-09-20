"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ArrowRight,
  LogIn,
  LineChart,
  Leaf,
  Store,
  Building2,
  Factory,
  Users,
  Fish,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  Play,
  Plus,
  Power,
  AlertTriangle,
  Loader2,
  Search,
  Gauge,
  Bug,
  Settings,
  ClipboardList,
  BarChart3,
  Bell,
  Download,
  Upload,
  Globe2,
  Filter,
  Wifi,
  KeyRound
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
}

interface PastOrderRow extends OrderRow {
  status: "Completed" | "Pending" | "Adjusted";
  kpiAccuracy: number; // %
  kpiWastePrevented: number; // %
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
  { vendor: "Fresh Fields", productId: "FF-OB-12", product: "Organic Banana", next: "2025-09-23", onHand: 120, proj: 80, rec: 50 },
  { vendor: "Fresh Fields", productId: "FF-LI-08", product: "Limes", next: "2025-09-23", onHand: 60, proj: 30, rec: 40 },
  { vendor: "Nature's Best", productId: "NB-ST-33", product: "Strawberries", next: "2025-09-23", onHand: 200, proj: 150, rec: 60 },
  { vendor: "Nature's Best", productId: "NB-CR-21", product: "Carrot", next: "2025-09-23", onHand: 80, proj: 40, rec: 30 }
];

const SAMPLE_PAST_ORDERS: PastOrderRow[] = [
  { vendor: "Fresh Fields", productId: "FF-AV-09", product: "Avocado", next: "2025-09-10", onHand: 30, proj: 10, rec: 25, status: "Completed", kpiAccuracy: 92, kpiWastePrevented: 34 },
  { vendor: "Nature's Best", productId: "NB-MG-15", product: "Mango", next: "2025-09-11", onHand: 50, proj: 25, rec: 20, status: "Adjusted", kpiAccuracy: 88, kpiWastePrevented: 18 },
  { vendor: "Fresh Fields", productId: "FF-AS-18", product: "Asparagus", next: "2025-09-12", onHand: 70, proj: 60, rec: 10, status: "Pending", kpiAccuracy: 0, kpiWastePrevented: 0 }
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

const StatusPill: React.FC<{ label: string; color?: "green" | "orange" | "yellow" | "gray" }>=({ label, color = "green" }) => {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200"
  };
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[10px] tracking-widest uppercase ${map[color]}`}>{label}</span>
  );
};

// ---------------------------------------------
// SVG Mini Charts (no external deps)
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
  const gridCols = data.length <= 5 ? `grid-cols-${data.length}` : 'grid-cols-6';
  return (
    <div className={`grid ${gridCols} gap-3 h-32`}>
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

const StackedBarMini: React.FC<{ data: { k: string; g: number; y: number; r: number }[] }>=({ data }) => {
  const max = Math.max(1, ...data.map(d => d.g + d.y + d.r));
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const total = d.g + d.y + d.r;
        const gWidth = (d.g / max) * 100;
        const yWidth = (d.y / max) * 100;
        const rWidth = (d.r / max) * 100;
        
        return (
        <div key={d.k} className="text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-28 text-gray-500">{d.k}</div>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-500" 
                  style={{ width: `${gWidth}%` }} 
                />
                <div 
                  className="absolute top-0 h-full bg-yellow-400" 
                  style={{ left: `${gWidth}%`, width: `${yWidth}%` }} 
                />
                <div 
                  className="absolute top-0 h-full bg-orange-500" 
                  style={{ left: `${gWidth + yWidth}%`, width: `${rWidth}%` }} 
                />
            </div>
              <div className="w-12 text-right text-gray-500">{total}%</div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

const HistogramMini: React.FC<{ data: number[] }>=({ data }) => {
  const max = Math.max(1, ...data);
  const bars = data.length;
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((v, i) => (
        <div key={i} className="w-2 bg-gray-200 rounded" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
};

const RadialProgress: React.FC<{ value: number }>=({ value }) => {
  const size = 120; const r = (size - 12) / 2; const c = 2 * Math.PI * r; const pct = Math.max(0, Math.min(100, value));
  return (
    <svg width={size} height={size} className="text-gray-300">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={10} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#10b981" strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray={`${(pct / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-gray-700 font-semibold">{Math.round(pct)}%</text>
    </svg>
  );
};

// ---------------------------------------------
// API helpers (safe mocks + real toggles)
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
// Screens
// ---------------------------------------------

// 1) Globe Screen (simplified without 3D globe)
const GlobeScreen: React.FC = () => {
  const [filter, setFilter] = useState<string>("All");
  const [running] = useState<boolean>(true);
  const [progress] = useState<number>(92);

  const stores = [
    { name: "NYC - Flagship", dept: "Produce", health: "green", lat: 40.7128, lng: -74.006 },
    { name: "Miami - Store", dept: "Bakery", health: "yellow", lat: 25.7617, lng: -80.1918 },
    { name: "Dallas - Store", dept: "Meat", health: "orange", lat: 32.7767, lng: -96.797 },
    { name: "Encino - Store", dept: "Produce", health: "green", lat: 34.1597, lng: -118.5012 },
    { name: "London - DC", dept: "All", health: "green", lat: 51.5074, lng: -0.1278 }
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs tracking-widest text-gray-500">FORECAST STATUS</div>
          <StatusPill label={running?"ACTIVE":"HEALTHY"} color={running?"yellow":"green"} />
        </div>
        <div className="flex items-center gap-4">
          <RadialProgress value={running?progress:100} />
          <div className="text-sm text-gray-600">
              <div className="font-semibold">{running?progress:100}% Complete</div>
              <div className="text-xs text-gray-500">Last updated 2m ago</div>
          </div>
        </div>
      </Card>
        
      <Card className="p-4">
          <div className="text-xs tracking-widest text-gray-500 mb-2">ACCURACY METRICS</div>
        <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">94.2%</div>
              <div className="text-xs text-gray-500">Overall</div>
          </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">2.1%</div>
              <div className="text-xs text-gray-500">MAE</div>
          </div>
        </div>
      </Card>
        
      <Card className="p-4">
        <div className="text-xs tracking-widest text-gray-500 mb-2">AGENT ACTIVITY</div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-emerald-600"/> High engagement
        </div>
          <div className="mt-2 text-xs text-gray-500">Processing 1,247 data points</div>
      </Card>
      </div>

      {/* Globe Visualization */}
      <Card className="h-[60vh] relative overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur px-3 py-1.5 border border-gray-200 shadow-sm">
        <Globe2 className="w-4 h-4 text-emerald-600"/>
        <span className="text-xs text-gray-700">Live grocery activity</span>
        <div className="flex items-center gap-1 text-xs">
          <Filter className="w-4 h-4 text-gray-400"/>
            <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 shadow-lg">
            {['All','Produce','Meat','Bakery','Deli','Center'].map(x=> <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>
      
      <div className="absolute inset-0 p-8 pt-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {stores.map((store, i) => (
            <Card key={i} className="p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{store.name}</h3>
                <StatusPill 
                  label={store.health} 
                  color={store.health === "green" ? "green" : store.health === "yellow" ? "yellow" : "orange"} 
                />
              </div>
              <div className="text-sm text-gray-600 mb-2">Department: {store.dept}</div>
              <div className="text-xs text-gray-500">📍 {store.lat.toFixed(2)}, {store.lng.toFixed(2)}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live data</span>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
            <Globe2 className="w-4 h-4"/>
            <span className="text-sm">3D Globe visualization will be available in the next update</span>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
};

// 2) Evaluation Screen (expanded)
const EvaluationScreen: React.FC = () => {
  const [store, setStore] = useState("All Stores");
  const [category, setCategory] = useState("All");
  const [range, setRange] = useState("Last 30 days");
  const [cfg, setCfg] = useState<ApiConfig>({});
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

      // Seasonality effects (affects both)
      if (activeVariables.has('seasonality')) {
        const seasonalBoost = 1.1; // 10% increase
        predictedMultiplier *= seasonalBoost;
        actualMultiplier *= seasonalBoost;
      }


      // Economic effects (affects both)
      if (activeVariables.has('economic')) {
        const economicBoost = 1.05; // 5% increase
        predictedMultiplier *= economicBoost;
        actualMultiplier *= economicBoost;
      }

      // Advanced ML variables (250+ factors) - significant impact
      if (activeVariables.has('advanced')) {
        const advancedBoost = 1.35; // 35% increase for comprehensive ML model
        predictedMultiplier *= advancedBoost;
        actualMultiplier *= advancedBoost;
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

    // Seasonality improves overall accuracy
    if (activeVariables.has('seasonality')) {
      mae *= 0.95;
      rmse *= 0.95;
      wmape *= 0.95;
    }


    // Economic factors affect bias
    if (activeVariables.has('economic')) {
      bias += 1.0;
      coverage += 1;
    }

    // Advanced ML variables significantly improve accuracy
    if (activeVariables.has('advanced')) {
      mae *= 0.7; // 30% improvement in accuracy
      rmse *= 0.7;
      wmape *= 0.7;
      coverage += 5; // Better coverage with comprehensive model
      bias *= 0.8; // More balanced predictions
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

  const skuErrorHist = [4,9,16,23,31,22,14,7,3,1];

  // Store layout data for interactive tooltips
  const aisleData = {
    produce: {
      title: "Aisle 1 - Produce",
      accuracy: "94%",
      keyItems: ["Organic Bananas", "Fresh Spinach", "Avocados", "Tomatoes"],
      salesVsForecast: "+12% vs forecast",
      stockStatus: "Optimal",
      alerts: [],
      externalDrivers: ["Weather boost: +15%", "Seasonal demand: +8%"]
    },
    meat: {
      title: "Aisle 2 - Meat & Seafood", 
      accuracy: "91%",
      keyItems: ["Fresh Salmon", "Ground Beef", "Chicken Breast", "Shrimp"],
      salesVsForecast: "-5% vs forecast",
      stockStatus: "Overstock Alert",
      alerts: ["Ground Beef: 25% overstock"],
      externalDrivers: ["Price increase: -8%", "Health trends: +12%"]
    },
    dairy: {
      title: "Aisle 3 - Dairy",
      accuracy: "88%", 
      keyItems: ["Whole Milk", "Greek Yogurt", "Cheddar Cheese", "Butter"],
      salesVsForecast: "+3% vs forecast",
      stockStatus: "Good",
      alerts: [],
      externalDrivers: ["Promotion: +18%", "Supply chain: -5%"]
    },
    bakery: {
      title: "Aisle 4 - Bakery",
      accuracy: "92%",
      keyItems: ["Artisan Bread", "Croissants", "Muffins", "Bagels"],
      salesVsForecast: "+8% vs forecast", 
      stockStatus: "Good",
      alerts: [],
      externalDrivers: ["Freshness focus: +15%", "Breakfast trend: +10%"]
    },
    pantry: {
      title: "Aisle 5 - Pantry",
      accuracy: "89%",
      keyItems: ["Pasta", "Rice", "Canned Goods", "Cereal"],
      salesVsForecast: "+2% vs forecast",
      stockStatus: "Good", 
      alerts: [],
      externalDrivers: ["Stockpiling: +6%", "Price sensitivity: -3%"]
    },
    frozen: {
      title: "Aisle 6 - Frozen",
      accuracy: "86%",
      keyItems: ["Frozen Pizza", "Ice Cream", "Frozen Vegetables", "Frozen Meals"],
      salesVsForecast: "-12% vs forecast",
      stockStatus: "Understock Alert",
      alerts: ["Ice Cream: 30% understock"],
      externalDrivers: ["Temperature spike: -20%", "Convenience: +8%"]
    },
    beverages: {
      title: "Aisle 7 - Beverages", 
      accuracy: "93%",
      keyItems: ["Sparkling Water", "Energy Drinks", "Juice", "Coffee"],
      salesVsForecast: "+15% vs forecast",
      stockStatus: "Excellent",
      alerts: [],
      externalDrivers: ["Summer demand: +25%", "Health trend: +12%"]
    },
    health: {
      title: "Aisle 8 - Health & Beauty",
      accuracy: "87%",
      keyItems: ["Vitamins", "Shampoo", "Toothpaste", "Skincare"],
      salesVsForecast: "+4% vs forecast",
      stockStatus: "Good",
      alerts: [],
      externalDrivers: ["Wellness trend: +18%", "Seasonal: +6%"]
    },
    deli: {
      title: "Aisle 9 - Deli",
      accuracy: "88%",
      keyItems: ["Deli Meats", "Cheese", "Prepared Foods", "Sandwiches"],
      salesVsForecast: "+6% vs forecast",
      stockStatus: "Good",
      alerts: [],
      externalDrivers: ["Lunch demand: +12%", "Quality focus: +8%"]
    }
  };

  // Add hover functionality
  React.useEffect(() => {
    const tooltip = document.getElementById('aisle-tooltip');
    const aisleGroups = document.querySelectorAll('.aisle-group');
    
    const showTooltip = (e: MouseEvent, aisle: string) => {
      if (!tooltip) return;
      
      const data = aisleData[aisle as keyof typeof aisleData];
      if (!data) return;
      
      const titleEl = document.getElementById('tooltip-title');
      const contentEl = document.getElementById('tooltip-content');
      
      if (titleEl && contentEl) {
        titleEl.textContent = data.title;
        contentEl.innerHTML = `
          <div class="mb-2">
            <div class="font-medium text-gray-800">Key Items:</div>
            <div class="text-xs text-gray-600">${data.keyItems.join(', ')}</div>
          </div>
          <div class="mb-2">
            <div class="font-medium text-gray-800">Sales vs Forecast:</div>
            <div class="text-xs ${data.salesVsForecast.startsWith('+') ? 'text-green-600' : 'text-red-600'}">${data.salesVsForecast}</div>
          </div>
          <div class="mb-2">
            <div class="font-medium text-gray-800">Stock Status:</div>
            <div class="text-xs ${data.stockStatus.includes('Alert') ? 'text-red-600' : data.stockStatus === 'Excellent' ? 'text-green-600' : 'text-gray-600'}">${data.stockStatus}</div>
          </div>
          ${data.alerts.length > 0 ? `
            <div class="mb-2">
              <div class="font-medium text-red-800">Alerts:</div>
              <div class="text-xs text-red-600">${data.alerts.join(', ')}</div>
            </div>
          ` : ''}
          <div>
            <div class="font-medium text-blue-800">External Drivers:</div>
            <div class="text-xs text-blue-600">${data.externalDrivers.join(', ')}</div>
          </div>
        `;
        
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 10 + 'px';
        tooltip.style.opacity = '1';
      }
    };
    
    const hideTooltip = () => {
      if (tooltip) {
        tooltip.style.opacity = '0';
      }
    };
    
    aisleGroups.forEach(group => {
      const aisle = group.getAttribute('data-aisle');
      if (aisle) {
        group.addEventListener('mouseenter', (e) => showTooltip(e as MouseEvent, aisle));
        group.addEventListener('mouseleave', hideTooltip);
        group.addEventListener('mousemove', (e) => showTooltip(e as MouseEvent, aisle));
      }
    });
    
    return () => {
      aisleGroups.forEach(group => {
        const aisle = group.getAttribute('data-aisle');
        if (aisle) {
          group.removeEventListener('mouseenter', (e) => showTooltip(e as MouseEvent, aisle));
          group.removeEventListener('mouseleave', hideTooltip);
          group.removeEventListener('mousemove', (e) => showTooltip(e as MouseEvent, aisle));
        }
      });
    };
  }, []);

  return (
    <div className="space-y-4 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 min-h-screen p-6 m-4">
      {/* Filters + API Connectors */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={store} onChange={(e)=>setStore(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white/80 backdrop-blur-md text-gray-800 shadow-2xl">
          {['All Stores','Encino','NYC','Dallas','Miami'].map(s=> <option key={s} className="text-gray-800">{s}</option>)}
        </select>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white/80 backdrop-blur-md text-gray-800 shadow-2xl">
          {['All','Produce','Meat','Bakery','Center Store'].map(s=> <option key={s} className="text-gray-800">{s}</option>)}
        </select>
        <select value={range} onChange={(e)=>setRange(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white/80 backdrop-blur-md text-gray-800 shadow-2xl">
          {['Last 7 days','Last 30 days','Quarter to date','Year to date'].map(s=> <option key={s} className="text-gray-800">{s}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-700">
          <Wifi className="w-4 h-4"/>
          External APIs
          <Button variant="outline" onClick={load} title="Attempt to fetch external demo APIs" className="bg-white/80 backdrop-blur-md border-gray-200 text-gray-800 hover:bg-gray-50 shadow-2xl"><Download className="w-4 h-4"/> Pull now</Button>
        </div>
      </div>

      {/* KPI Cards with Liquid Glass Effect */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-medium">MAE</div>
          <div className="text-2xl font-bold text-gray-800">{kpiValues.mae}</div>
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-medium">RMSE</div>
          <div className="text-2xl font-bold text-gray-800">{kpiValues.rmse}</div>
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-medium">WMAPE</div>
          <div className="text-2xl font-bold text-gray-800">{kpiValues.wmape}%</div>
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-medium">Bias</div>
          <div className="text-2xl font-bold text-gray-800">{kpiValues.bias}%</div>
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-medium">Coverage</div>
          <div className="text-2xl font-bold text-gray-800">{kpiValues.coverage}%</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-gray-800">Forecast vs. Actual Sales</div>
            {activeVariables.size > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Live Impact
              </div>
            )}
          </div>
          <LineChartMini data={salesSeries} />
          {/* Debug info */}
          <div className="text-xs text-gray-400 mt-2">
            Debug: {salesSeries.length} data points, Active vars: {activeVariables.size}
          </div>
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-sm font-bold text-gray-800 mb-2">Accuracy by Department</div>
          <BarChartMini data={accuracyByDept.map(d=>({k:d.k, v:d.v}))} />
        </Card>
      </div>

      {/* Interactive 2D Store Layout */}
      <Card className="p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
        <div className="text-sm font-bold text-gray-800 mb-4">Interactive Store Layout</div>
        <div className="text-xs text-gray-600 mb-4">Hover over aisles to explore product performance and demand insights</div>
        
        <div className="relative w-full h-[500px] border border-gray-200 rounded-3xl bg-white overflow-hidden">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            
            {/* Left Wall - Refrigeration Units */}
            <g className="aisle-group" data-aisle="produce">
              {/* Upper refrigeration unit */}
              <rect x="80" y="80" width="100" height="160" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="8" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="130" y="70" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-emerald-600 transition-colors duration-200">PRODUCE</text>
              
              {/* Lower refrigeration unit */}
              <rect x="80" y="260" width="100" height="160" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="8" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              
              {/* Product indicators */}
              <circle cx="100" cy="120" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="160" cy="140" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="100" cy="160" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="160" cy="180" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="100" cy="200" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="160" cy="300" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="100" cy="320" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="160" cy="340" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="100" cy="360" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
              <circle cx="160" cy="380" r="3" fill="#9ca3af" className="hover:fill-emerald-500 transition-colors duration-200"/>
            </g>
            
            {/* Back Wall - Continuous Shelving */}
            <g className="aisle-group" data-aisle="meat">
              <rect x="220" y="70" width="560" height="60" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="8" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="500" y="60" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-red-600 transition-colors duration-200">MEAT & SEAFOOD</text>
              
              {/* Product indicators along back wall */}
              <circle cx="260" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
              <circle cx="360" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
              <circle cx="460" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
              <circle cx="560" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
              <circle cx="660" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
              <circle cx="760" cy="100" r="3" fill="#9ca3af" className="hover:fill-red-500 transition-colors duration-200"/>
            </g>
            
            {/* Right Wall - Shelving Units */}
            <g className="aisle-group" data-aisle="dairy">
              <rect x="820" y="80" width="100" height="340" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="8" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="870" y="70" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-blue-600 transition-colors duration-200">DAIRY</text>
              
              {/* Product indicators */}
              <circle cx="840" cy="120" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="140" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="160" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="180" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="200" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="220" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="240" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="260" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="280" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="300" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="320" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="340" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="840" cy="360" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
              <circle cx="900" cy="380" r="3" fill="#9ca3af" className="hover:fill-blue-500 transition-colors duration-200"/>
            </g>
            
            {/* Central Gondola Shelving - Three Main Units */}
            {/* Gondola 1 - Bakery */}
            <g className="aisle-group" data-aisle="bakery">
              <rect x="300" y="180" width="120" height="200" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="12" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="360" y="170" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-amber-600 transition-colors duration-200">BAKERY</text>
              
              {/* Product indicators */}
              <circle cx="320" cy="220" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="400" cy="240" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="320" cy="260" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="400" cy="280" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="320" cy="300" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="400" cy="320" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="320" cy="340" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
              <circle cx="400" cy="360" r="3" fill="#9ca3af" className="hover:fill-amber-500 transition-colors duration-200"/>
            </g>
            
            {/* Gondola 2 - Pantry */}
            <g className="aisle-group" data-aisle="pantry">
              <rect x="450" y="180" width="120" height="200" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="12" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="510" y="170" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-purple-600 transition-colors duration-200">PANTRY</text>
              
              {/* Product indicators */}
              <circle cx="470" cy="220" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="550" cy="240" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="470" cy="260" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="550" cy="280" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="470" cy="300" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="550" cy="320" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="470" cy="340" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
              <circle cx="550" cy="360" r="3" fill="#9ca3af" className="hover:fill-purple-500 transition-colors duration-200"/>
            </g>
            
            {/* Gondola 3 - Frozen */}
            <g className="aisle-group" data-aisle="frozen">
              <rect x="600" y="180" width="120" height="200" fill="#9ca3af" fillOpacity="0.2" stroke="#6b7280" strokeWidth="1" rx="12" className="hover:fill-green-500 hover:fill-opacity-30 hover:stroke-green-500 hover:stroke-2 cursor-pointer transition-all duration-200"/>
              <text x="660" y="170" fontSize="10" fill="#6b7280" textAnchor="middle" fontWeight="bold" className="hover:fill-cyan-600 transition-colors duration-200">FROZEN</text>
              
              {/* Product indicators */}
              <circle cx="620" cy="220" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="700" cy="240" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="620" cy="260" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="700" cy="280" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="620" cy="300" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="700" cy="320" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="620" cy="340" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
              <circle cx="700" cy="360" r="3" fill="#9ca3af" className="hover:fill-cyan-500 transition-colors duration-200"/>
            </g>
            
          </svg>
          
          {/* Hover Tooltip */}
          <div id="aisle-tooltip" className="absolute bg-white border border-gray-200 rounded-lg shadow-2xl p-4 pointer-events-none opacity-0 transition-opacity duration-200 z-10 max-w-sm">
            <div className="text-sm font-bold text-gray-800 mb-2" id="tooltip-title">Aisle Information</div>
            <div className="text-xs text-gray-600 space-y-1" id="tooltip-content">
              <div>Hover over an aisle to see details</div>
            </div>
          </div>
        </div>
        
        {/* Store Layout Performance Summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/50">
            <div className="text-xs font-medium text-green-800 mb-1">Top Performer</div>
            <div className="text-sm font-bold text-green-700">Produce Refrigeration</div>
            <div className="text-xs text-green-600">94% accuracy</div>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
            <div className="text-xs font-medium text-amber-800 mb-1">Needs Attention</div>
            <div className="text-sm font-bold text-amber-700">Frozen Gondola</div>
            <div className="text-xs text-amber-600">86% accuracy</div>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
            <div className="text-xs font-medium text-blue-800 mb-1">Risk Alerts</div>
            <div className="text-sm font-bold text-blue-700">2 Active</div>
            <div className="text-xs text-blue-600">Meat Wall / Frozen</div>
          </div>
        </div>
      </Card>

      {/* SKU Error Distribution and Geographic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-sm font-bold text-gray-800 mb-4">SKU Error Distribution</div>
          <div className="text-xs text-gray-600 mb-4">Forecast accuracy by product category and error magnitude</div>
          
          {/* Enhanced Histogram with Labels */}
          <div className="mb-4">
            <div className="w-full h-32 border border-gray-200 rounded-lg bg-white/50 p-2">
              <svg viewBox="0 0 300 100" className="w-full h-full">
                {skuErrorHist.map((value, i) => {
                  const height = (value / 31) * 80; // Scale to max value
                  const x = 20 + (i * 25);
                  const y = 90 - height;
                  const color = value > 20 ? '#ef4444' : value > 10 ? '#f59e0b' : '#10b981';
                  
                  return (
                    <g key={i}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={20} 
                        height={height} 
                        fill={color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      <text 
                        x={x + 10} 
                        y={95} 
                        fontSize="8" 
                        fill="#6b7280" 
                        textAnchor="middle"
                      >
                        {i * 5}%
                      </text>
                      <text 
                        x={x + 10} 
                        y={y - 2} 
                        fontSize="8" 
                        fill="#374151" 
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Error Categories */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-red-50 rounded border border-red-200">
              <div className="font-medium text-red-800">High Error</div>
              <div className="text-red-600">20+ SKUs</div>
            </div>
            <div className="p-2 bg-amber-50 rounded border border-amber-200">
              <div className="font-medium text-amber-800">Medium Error</div>
              <div className="text-amber-600">10-19 SKUs</div>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <div className="font-medium text-green-800">Low Error</div>
              <div className="text-green-600">0-9 SKUs</div>
            </div>
          </div>

          {/* Top Problematic SKUs */}
          <div className="mt-4 p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
            <div className="text-xs font-medium text-gray-700 mb-2">Top Problematic SKUs:</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Organic Bananas (Produce)</span>
                <span className="text-red-600 font-medium">-23% error</span>
              </div>
              <div className="flex justify-between">
                <span>Fresh Salmon (Meat)</span>
                <span className="text-red-600 font-medium">-19% error</span>
              </div>
              <div className="flex justify-between">
                <span>Artisan Bread (Bakery)</span>
                <span className="text-amber-600 font-medium">-15% error</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-gray-800">Geographic Performance</div>
            <StatusPill label="sync with globe" color="gray"/>
          </div>
          <div className="text-xs text-gray-600 mb-4">Regional forecast accuracy and performance metrics</div>
          
          {/* Regional Performance Map */}
          <div className="mb-4">
            <div className="w-full h-32 border border-gray-200 rounded-lg bg-white/50 p-2">
              <svg viewBox="0 0 300 100" className="w-full h-full">
                {/* Simplified map representation */}
                <g>
                  {/* West Coast */}
                  <rect x="20" y="20" width="40" height="30" fill="#10b981" className="hover:opacity-80 cursor-pointer" />
                  <text x="40" y="35" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">West</text>
                  <text x="40" y="45" fontSize="6" fill="white" textAnchor="middle">94%</text>
                  
                  {/* Central */}
                  <rect x="80" y="30" width="50" height="40" fill="#f59e0b" className="hover:opacity-80 cursor-pointer" />
                  <text x="105" y="45" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">Central</text>
                  <text x="105" y="55" fontSize="6" fill="white" textAnchor="middle">87%</text>
                  
                  {/* East Coast */}
                  <rect x="150" y="25" width="45" height="35" fill="#ef4444" className="hover:opacity-80 cursor-pointer" />
                  <text x="172" y="40" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">East</text>
                  <text x="172" y="50" fontSize="6" fill="white" textAnchor="middle">82%</text>
                  
                  {/* South */}
                  <rect x="210" y="35" width="40" height="25" fill="#8b5cf6" className="hover:opacity-80 cursor-pointer" />
                  <text x="230" y="47" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">South</text>
                  <text x="230" y="55" fontSize="6" fill="white" textAnchor="middle">91%</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Regional Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/50">
              <div className="text-xs font-medium text-green-800 mb-1">Best Performing</div>
              <div className="text-sm font-bold text-green-700">West Coast</div>
              <div className="text-xs text-green-600">94% accuracy</div>
            </div>
            <div className="p-3 bg-red-50/50 rounded-lg border border-red-200/50">
              <div className="text-xs font-medium text-red-800 mb-1">Needs Attention</div>
              <div className="text-sm font-bold text-red-700">East Coast</div>
              <div className="text-xs text-red-600">82% accuracy</div>
            </div>
          </div>

          {/* Store Performance List */}
          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50">
            <div className="text-xs font-medium text-gray-700 mb-2">Top Performing Stores:</div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Seattle Downtown</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">96%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>San Francisco Market</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">95%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Portland Central</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">94%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>New York Times Square</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">78%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Impact by Region */}
          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
            <div className="text-xs font-medium text-blue-700 mb-2">Weather Impact by Region:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-blue-600">
                <span className="font-medium">West:</span> +12% (mild weather)
              </div>
              <div className="text-blue-600">
                <span className="font-medium">Central:</span> -8% (storms)
              </div>
              <div className="text-blue-600">
                <span className="font-medium">East:</span> -15% (hurricane season)
              </div>
              <div className="text-blue-600">
                <span className="font-medium">South:</span> +5% (stable)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading && <div className="text-xs text-gray-500">Fetching external data…</div>}
      {(data.pos || data.weather || data.trends) && (
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-bold mb-2">External Data (demo)</div>
          <pre className="text-[11px] max-h-48 overflow-auto bg-white/10 backdrop-blur-md p-2 rounded-xl border border-gray-200/50 text-gray-700">{JSON.stringify(data, null, 2)}</pre>
        </Card>
      )}

      {/* Interactive Variables Section */}
      <Card className="p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
        <div className="text-sm font-bold text-gray-800 mb-4">Demand Drivers & External Factors</div>
        <div className="text-xs text-gray-600 mb-4">Tap the variables to include them in your forecasting model</div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Weather */}
          <div 
            onClick={() => toggleVariable('weather')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('weather') 
                ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🌤️</div>
              <div className="text-xs font-medium text-gray-700">Weather</div>
              <div className="text-xs text-gray-500 mt-1">Temperature, rain, storms</div>
            </div>
          </div>

          {/* Promotions */}
          <div 
            onClick={() => toggleVariable('promotions')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('promotions') 
                ? 'border-green-500 bg-green-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-xs font-medium text-gray-700">Promotions</div>
              <div className="text-xs text-gray-500 mt-1">Sales, discounts, BOGO</div>
            </div>
          </div>

          {/* Events */}
          <div 
            onClick={() => toggleVariable('events')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('events') 
                ? 'border-purple-500 bg-purple-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-xs font-medium text-gray-700">Events</div>
              <div className="text-xs text-gray-500 mt-1">Holidays, festivals, sports</div>
            </div>
          </div>

          {/* Seasonality */}
          <div 
            onClick={() => toggleVariable('seasonality')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('seasonality') 
                ? 'border-orange-500 bg-orange-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-xs font-medium text-gray-700">Seasonality</div>
              <div className="text-xs text-gray-500 mt-1">Monthly, weekly patterns</div>
            </div>
          </div>


          {/* Economic Factors */}
          <div 
            onClick={() => toggleVariable('economic')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('economic') 
                ? 'border-yellow-500 bg-yellow-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-xs font-medium text-gray-700">Economic</div>
              <div className="text-xs text-gray-500 mt-1">Inflation, unemployment</div>
            </div>
          </div>

          {/* 250+ Advanced Variables */}
          <div 
            onClick={() => toggleVariable('advanced')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              activeVariables.has('advanced') 
                ? 'border-indigo-500 bg-indigo-50/50 shadow-md' 
                : 'border-gray-200 bg-white/30 hover:border-gray-300 hover:bg-white/40'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔬</div>
              <div className="text-xs font-medium text-gray-700">250+ Variables</div>
              <div className="text-xs text-gray-500 mt-1">Advanced ML factors</div>
            </div>
          </div>
        </div>

        {/* Active Variables Summary */}
        {activeVariables.size > 0 && (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-200/50">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Active Variables ({activeVariables.size}):
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(activeVariables).map(variable => (
                  <span 
                    key={variable}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                  >
                    {variable.charAt(0).toUpperCase() + variable.slice(1)}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Impact Summary */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
              <div className="text-xs font-medium text-blue-700 mb-2">
                📊 Live Impact on Forecast:
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                {activeVariables.has('weather') && <div>• Weather: +15% sales boost</div>}
                {activeVariables.has('promotions') && <div>• Promotions: +25% actual sales, +10% predictions</div>}
                {activeVariables.has('events') && <div>• Events: +20% overall sales increase</div>}
                {activeVariables.has('seasonality') && <div>• Seasonality: +10% baseline adjustment</div>}
                {activeVariables.has('economic') && <div>• Economic: +5% market conditions</div>}
                {activeVariables.has('advanced') && <div>• 250+ Variables: +35% comprehensive ML model</div>}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Factor Impact Analysis Graph */}
      <Card className="p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
        <div className="text-sm font-bold text-gray-800 mb-4">Factor Impact Analysis</div>
        <div className="text-xs text-gray-600 mb-4">Real-time visualization of how selected factors affect forecast accuracy</div>
        
        <div className="w-full">
          <svg viewBox="0 0 400 200" className="w-full h-[200px] border border-gray-200 rounded-lg bg-white/50">
            {/* Grid lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1={50} x2={350} y1={50 + (i * 22.5)} y2={50 + (i * 22.5)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={50 + (i * 37.5)} x2={50 + (i * 37.5)} y1={50} y2={140} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            
            {/* Y-axis labels */}
            {Array.from({ length: 5 }).map((_, i) => (
              <text key={i} x={45} y={55 + (i * 22.5)} fontSize="10" fill="#6b7280" textAnchor="end">
                {120 - (i * 20)}%
              </text>
            ))}
            
            {/* X-axis labels */}
            {['Base', 'Weather', 'Promo', 'Events', 'Season', 'Economic', 'Advanced', 'All'].map((label, i) => (
              <text key={i} x={50 + (i * 37.5)} y={165} fontSize="10" fill="#6b7280" textAnchor="middle">
                {label}
              </text>
            ))}
            
            {/* Calculate accuracy based on active variables */}
            {(() => {
              let baseAccuracy = 75;
              const factors = [
                { name: 'weather', impact: 5 },
                { name: 'promotions', impact: 8 },
                { name: 'events', impact: 6 },
                { name: 'seasonality', impact: 4 },
                { name: 'economic', impact: 3 },
                { name: 'advanced', impact: 15 }
              ];
              
              const points = [baseAccuracy];
              let cumulativeAccuracy = baseAccuracy;
              
              factors.forEach(factor => {
                if (activeVariables.has(factor.name)) {
                  cumulativeAccuracy += factor.impact;
                }
                points.push(cumulativeAccuracy);
              });
              
              // Add final point for "All" (if all are selected)
              if (activeVariables.size === factors.length) {
                points.push(cumulativeAccuracy + 2); // Bonus for using all factors
              } else {
                points.push(cumulativeAccuracy);
              }
              
              // Calculate Y position with proper scaling (40% to 120% range)
              const yPos = (accuracy: number) => 140 - ((accuracy - 40) / 80) * 90;
              
              const pathData = points.map((accuracy, i) => 
                `${i === 0 ? 'M' : 'L'}${50 + (i * 37.5)},${yPos(accuracy)}`
              ).join(' ');
              
              return (
                <>
                  <path d={pathData} stroke="#3b82f6" strokeWidth={3} fill="none" />
                  {points.map((accuracy, i) => (
                    <circle key={i} cx={50 + (i * 37.5)} cy={yPos(accuracy)} r={4} fill="#3b82f6" />
                  ))}
                </>
              );
            })()}
            
            {/* Title */}
            <text x={200} y={25} fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">
              Forecast Accuracy by Factor Combination
            </text>
          </svg>
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-gray-600">Accuracy %</span>
            </div>
            <div className="text-gray-500">
              Active factors: {activeVariables.size}/6
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 3) Forecasts Screen (expanded future demand)
const ForecastsScreen: React.FC = () => {
  const [level, setLevel] = useState("Department");
  const [entity, setEntity] = useState("Produce");

  const demandSeries = [
    { x: "Mon", p: 320, a: 0 },
    { x: "Tue", p: 340, a: 0 },
    { x: "Wed", p: 360, a: 0 },
    { x: "Thu", p: 400, a: 0 },
    { x: "Fri", p: 520, a: 0 },
    { x: "Sat", p: 600, a: 0 },
    { x: "Sun", p: 420, a: 0 }
  ];

  const seasonal = [
    { k: "Jan", v: 70 },{ k: "Feb", v: 72 },{ k: "Mar", v: 90 },{ k: "Apr", v: 102 },{ k: "May", v: 120 },{ k: "Jun", v: 132 },{ k: "Jul", v: 138 },{ k: "Aug", v: 130 },{ k: "Sep", v: 110 },{ k: "Oct", v: 100 },{ k: "Nov", v: 92 },{ k: "Dec", v: 86 }
  ];

  const riskStack = [
    { k: "Encino", g: 72, y: 22, r: 6 },
    { k: "NYC", g: 60, y: 28, r: 12 },
    { k: "Dallas", g: 64, y: 26, r: 10 },
    { k: "Miami", g: 68, y: 24, r: 8 }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select value={level} onChange={(e)=>setLevel(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-lg">
          {['Department','SKU','Store'].map(s=> <option key={s}>{s}</option>)}
        </select>
        <input value={entity} onChange={(e)=>setEntity(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-lg" />
        <Button variant="outline"><Download className="h-4 w-4"/> Export CSV</Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4"><div className="text-sm font-medium text-gray-700 mb-2">Daily Demand Curves ({level}: {entity})</div><LineChartMini data={demandSeries} /></Card>
        <Card className="p-4"><div className="text-sm font-medium text-gray-700 mb-2">Seasonal Trend Projection</div><BarChartMini data={seasonal} /></Card>
        <Card className="p-4"><div className="text-sm font-medium text-gray-700 mb-2">Over/Under-stock Risk (green=ok, yellow=watch, orange=action)</div><StackedBarMini data={riskStack} /></Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Event-driven Spikes</div>
          <ul className="text-sm text-gray-700 list-disc ml-5">
            <li>Heatwave in NYC → +20% cold beverages</li>
            <li>Holiday weekend → +15% bakery</li>
            <li>Local festival in Miami → +12% fruit cups</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

// 4) Orders Screen (DC Buyer Ordering)
const OrdersScreen: React.FC = () => {
  const [rows] = useState(SAMPLE_ORDERS);

  const exportCSV = () => {
    const header = ["Vendor","Product ID","Product","Next Order","On-hand","Projected","Recommended"].join(",");
    const body = rows.map(r => [r.vendor, r.productId, r.product, r.next, r.onHand, r.proj, r.rec].join(",")).join("\n");
    const blob = new Blob([header+"\n"+body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">DC Buyer Ordering</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4"/> Export CSV</Button>
          <Button className="bg-orange-500 hover:bg-orange-400"><ClipboardList className="h-4 w-4"/> Place Order</Button>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full border border-gray-200 text-sm shadow-lg">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-left">Product ID</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2">Next Order Date</th>
              <th className="px-3 py-2">Current On-hand</th>
              <th className="px-3 py-2">Projected On-hand</th>
              <th className="px-3 py-2">Recommended Qty</th>
              <th className="px-3 py-2">Order Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{r.vendor}</td>
                <td className="px-3 py-2">{r.productId}</td>
                <td className="px-3 py-2">{r.product}</td>
                <td className="px-3 py-2 text-center">{r.next}</td>
                <td className="px-3 py-2 text-center">{r.onHand}</td>
                <td className="px-3 py-2 text-center">{r.proj}</td>
                <td className="px-3 py-2 text-center text-emerald-600 font-semibold">{r.rec}</td>
                <td className="px-3 py-2 text-center"><input type="number" defaultValue={r.rec} className="w-24 border rounded px-2 py-1 shadow-lg"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5) Past Orders
const PastOrdersScreen: React.FC = () => {
  const rows = SAMPLE_PAST_ORDERS;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Past Orders</h2>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full border border-gray-200 text-sm shadow-lg">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-left">Product ID</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2">Order Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Forecast Accuracy</th>
              <th className="px-3 py-2">Waste Prevented</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{r.vendor}</td>
                <td className="px-3 py-2">{r.productId}</td>
                <td className="px-3 py-2">{r.product}</td>
                <td className="px-3 py-2 text-center">{r.next}</td>
                <td className="px-3 py-2 text-center">
                  <StatusPill label={r.status} color={r.status==="Completed"?"green":r.status==="Pending"?"yellow":"orange"} />
                </td>
                <td className="px-3 py-2 text-center">{r.kpiAccuracy}%</td>
                <td className="px-3 py-2 text-center">{r.kpiWastePrevented}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 6) Demand Drivers (expanded)
const DemandDriversScreen: React.FC = () => {
  const cards = [
    { title: "Weather", text: "NYC Heatwave → +20% Cold Beverages", accent: "bg-orange-50 text-orange-700 border-orange-200" },
    { title: "Holidays", text: "Holiday Weekend → +15% Bakery", accent: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { title: "Promotions", text: "BOGO Strawberries in Miami → +18%", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { title: "Local Events", text: "Dallas Rodeo → +12% BBQ meats", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { title: "Demographics", text: "Encino: Family-focused SKUs +8%", accent: "bg-gray-50 text-gray-700 border-gray-200" },
    { title: "Social Trends", text: "Viral Avocado Toast → +10%", accent: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map((c, i)=>(
        <Card key={i} className={`p-4 border ${c.accent}`}>
          <div className="text-sm font-semibold mb-1">{c.title}</div>
          <div className="text-sm">{c.text}</div>
        </Card>
      ))}
      <Card className="p-4 md:col-span-3">
        <div className="text-sm font-medium text-gray-700 mb-2">Connect enrichment APIs</div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><Wifi className="w-4 h-4"/> OpenWeather</div>
            <input placeholder="Weather API URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="API Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><Wifi className="w-4 h-4"/> Google Trends</div>
            <input placeholder="Trends API URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="API Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
        </div>
      </Card>
    </div>
  );
};

// 7) Products (expanded)
const ProductsScreen: React.FC = () => {
  const rows = [
    { id: "FF-OB-12", name: "Organic Banana", vendor: "Fresh Fields", category: "Produce", shelf: "5-7d", waste: 6, img: "🍌", avg: 420, margin: 32 },
    { id: "FF-LI-08", name: "Limes", vendor: "Fresh Fields", category: "Produce", shelf: "10-14d", waste: 4, img: "🍋", avg: 210, margin: 28 },
    { id: "NB-ST-33", name: "Strawberries", vendor: "Nature's Best", category: "Produce", shelf: "3-5d", waste: 12, img: "🍓", avg: 180, margin: 26 },
    { id: "NB-AS-18", name: "Asparagus", vendor: "Nature's Best", category: "Produce", shelf: "4-6d", waste: 9, img: "🥦", avg: 130, margin: 24 },
    { id: "FF-AV-09", name: "Avocado", vendor: "Fresh Fields", category: "Produce", shelf: "5-7d", waste: 7, img: "🥑", avg: 260, margin: 34 },
  ];

  const [selected, setSelected] = useState<typeof rows[number] | null>(null);
  const demandSeries = [
    { x: "Mon", p: 120, a: 110 },
    { x: "Tue", p: 130, a: 115 },
    { x: "Wed", p: 135, a: 142 },
    { x: "Thu", p: 140, a: 130 },
    { x: "Fri", p: 180, a: 188 },
    { x: "Sat", p: 220, a: 210 },
    { x: "Sun", p: 160, a: 150 }
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full border border-gray-200 text-sm shadow-lg">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Product ID</th>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Shelf Life</th>
              <th className="px-3 py-2">Avg Demand</th>
              <th className="px-3 py-2">Waste %</th>
              <th className="px-3 py-2">Margin %</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} className="border-t">
                <td className="px-3 py-2 text-center text-xl">{r.img}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.vendor}</td>
                <td className="px-3 py-2 text-center">{r.category}</td>
                <td className="px-3 py-2 text-center">{r.shelf}</td>
                <td className="px-3 py-2 text-center">{r.avg}</td>
                <td className="px-3 py-2 text-center">{r.waste}%</td>
                <td className="px-3 py-2 text-center">{r.margin}%</td>
                <td className="px-3 py-2 text-center"><Button variant="outline" onClick={()=>setSelected(r)}>View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Product Detail: {selected.name} ({selected.id})</div>
            <Button variant="ghost" onClick={()=>setSelected(null)}>Close</Button>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-4"><div className="text-xs text-gray-500 mb-1">Demand Curves</div><LineChartMini data={demandSeries} /></Card>
            <Card className="p-4">
              <div className="text-xs text-gray-500 mb-1">Elasticity & Substitution</div>
              <ul className="text-sm text-gray-700 list-disc ml-5">
                <li>Elasticity (price): -1.3</li>
                <li>Substitutes risk: Mango (0.62), Papaya (0.41)</li>
                <li>Promo uplift: +18% (avg)</li>
              </ul>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};

// 8) Stores
const StoresScreen: React.FC = () => {
  const rows = [
    { name: "Encino", avail: 97, waste: 4, lift: 3.1, top: "Banana, Avocado, Mango" },
    { name: "NYC", avail: 95, waste: 5, lift: 2.2, top: "Strawberries, Banana, Lettuce" },
    { name: "Dallas", avail: 93, waste: 6, lift: 1.8, top: "Avocado, Mango, Carrot" },
    { name: "Miami", avail: 96, waste: 3, lift: 2.5, top: "Limes, Banana, Strawberries" },
  ];
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="min-w-full border border-gray-200 text-sm shadow-lg">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left">Store</th>
            <th className="px-3 py-2">On-Shelf Availability</th>
            <th className="px-3 py-2">Waste %</th>
            <th className="px-3 py-2">Sales lift vs. forecast</th>
            <th className="px-3 py-2 text-left">Top 5 SKUs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t">
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2 text-center">{r.avail}%</td>
              <td className="px-3 py-2 text-center">{r.waste}%</td>
              <td className="px-3 py-2 text-center">{r.lift}%</td>
              <td className="px-3 py-2">{r.top}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 9) Notices (expanded)
const NoticesScreen: React.FC = () => {
  const items = [
    { text: "Urgent: Understock risk for avocados in NYC", priority: "High", cat: "Understock" },
    { text: "Reduce over-ordering of lettuce in SF", priority: "Medium", cat: "Overstock" },
    { text: "Trend shift: Mango demand cooling in Encino", priority: "Low", cat: "Trend" },
  ];
  return (
    <div className="space-y-2">
      {items.map((n,i)=> (
        <Card key={i} className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm">{n.text}</div>
            <div className="text-[11px] text-gray-500 mt-1">Category: {n.cat}</div>
          </div>
          <StatusPill label={`${n.priority} Priority`} color={n.priority==="High"?"orange":n.priority==="Medium"?"yellow":"gray"} />
        </Card>
      ))}
    </div>
  );
};

// 10) Admin placeholders (expanded Settings)
const UsersScreen: React.FC = () => (
  <div className="text-sm text-gray-600">Add/remove users, roles (Store Manager, DC Buyer, HQ Analyst)</div>
);
const IntegrationsScreen: React.FC = () => (
  <div className="text-sm text-gray-600">Connect POS, ERP, supplier feeds</div>
);
const SettingsScreen: React.FC = () => {
  const [model, setModel] = useState("Neural Net");
  const [thresholds, setThresholds] = useState({ over: 0.2, under: 0.15 });
  const [tz, setTz] = useState("America/New_York");
  const [notify, setNotify] = useState(true);

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-2xl border border-gray-200/50">
        <div className="text-sm font-medium text-gray-700 mb-2">Forecasting Model</div>
        <select value={model} onChange={(e)=>setModel(e.target.value)} className="border rounded-xl px-3 py-2 text-sm shadow-lg">
          {['ARIMA','Prophet','Neural Net'].map(m=> <option key={m}>{m}</option>)}
        </select>
      </Card>
      <Card className="p-4 shadow-2xl border border-gray-200/50">
        <div className="text-sm font-medium text-gray-700 mb-2">Alert Thresholds</div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">Overstock <input type="number" value={thresholds.over} step={0.01} onChange={(e)=>setThresholds({...thresholds, over: Number(e.target.value)})} className="border rounded px-2 py-1 w-24 shadow-lg"/></label>
          <label className="flex items-center gap-2">Understock <input type="number" value={thresholds.under} step={0.01} onChange={(e)=>setThresholds({...thresholds, under: Number(e.target.value)})} className="border rounded px-2 py-1 w-24 shadow-lg"/></label>
        </div>
      </Card>
      <Card className="p-4 shadow-2xl border border-gray-200/50">
        <div className="text-sm font-medium text-gray-700 mb-2">API Keys & Integrations</div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4"/> POS / Sales</div>
            <input placeholder="POS API URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="POS API Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4"/> Weather</div>
            <input placeholder="OpenWeather URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="OpenWeather Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4"/> Google Trends</div>
            <input placeholder="Trends URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="Trends Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4"/> USDA FoodData</div>
            <input placeholder="USDA URL" className="w-full border rounded-xl px-3 py-2 mb-2 shadow-lg" />
            <input placeholder="USDA Key" className="w-full border rounded-xl px-3 py-2 shadow-lg" />
          </div>
        </div>
      </Card>
      <Card className="p-4 shadow-2xl border border-gray-200/50">
        <div className="text-sm font-medium text-gray-700 mb-2">Time Zone & Notifications</div>
        <div className="flex items-center gap-3 text-sm">
          <select value={tz} onChange={(e)=>setTz(e.target.value)} className="border rounded-xl px-3 py-2 shadow-lg">
            {['America/New_York','America/Los_Angeles','UTC','Europe/London','Asia/Tokyo'].map(t=> <option key={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={notify} onChange={(e)=>setNotify(e.target.checked)} /> Email notifications</label>
        </div>
      </Card>
    </div>
  );
};

// ---------------------------------------------
// Main App Shell
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
            <GlobeScreen />
          </div>
        )}

        {view === "evaluation" && <EvaluationScreen />}
        {view === "forecasts" && <ForecastsScreen />}
        {view === "orders" && <OrdersScreen />}
        {view === "pastOrders" && <PastOrdersScreen />}
        {view === "demand" && <DemandDriversScreen />}
        {view === "products" && <ProductsScreen />}
        {view === "stores" && <StoresScreen />}
        {view === "notices" && <NoticesScreen />}
        {view === "users" && <UsersScreen />}
        {view === "integrations" && <IntegrationsScreen />}
        {view === "settings" && <SettingsScreen />}
      </main>

    </div>
  );
};

export default GroceryForecastingApp;
