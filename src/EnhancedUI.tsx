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
  Filter,
  Wifi
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
    <div className="space-y-4 p-6">
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

      {/* KPI Cards */}
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
        </Card>
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-sm font-bold text-gray-800 mb-2">Accuracy by Department</div>
          <BarChartMini data={accuracyByDept.map(d=>({k:d.k, v:d.v}))} />
        </Card>
      </div>

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
          </div>
        )}
      </Card>

      {loading && <div className="text-xs text-gray-500">Fetching external data…</div>}
      {(data.pos || data.weather || data.trends) && (
        <Card className="p-4 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 before:ease-out">
          <div className="text-xs text-gray-600 font-bold mb-2">External Data (demo)</div>
          <pre className="text-[11px] max-h-48 overflow-auto bg-white/10 backdrop-blur-md p-2 rounded-xl border border-gray-200/50 text-gray-700">{JSON.stringify(data, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
};

// ---------------------------------------------
// Orders Screen with Interactive Table
// ---------------------------------------------

const OrdersScreen: React.FC = () => {
  const [orders] = useState<OrderRow[]>(SAMPLE_ORDERS);
  
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">DC Buyer Ordering</h1>
          <p className="text-sm text-gray-600">Smart recommendations for next week's orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="h-4 w-4"/> Export</Button>
          <Button><Upload className="h-4 w-4"/> Submit Orders</Button>
        </div>
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
                <th className="text-center py-3 px-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
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
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" className="p-1 h-6 w-6">
                        <ArrowRight className="h-3 w-3"/>
                      </Button>
                      <Button variant="ghost" className="p-1 h-6 w-6">
                        <Filter className="h-3 w-3"/>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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