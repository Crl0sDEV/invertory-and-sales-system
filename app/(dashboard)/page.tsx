import { createClient } from "@/utils/supabase/server";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Sales, Products, at Settings sabay-sabay (Promise.all para mabilis)
  const [salesRes, productsRes, settingsRes] = await Promise.all([
    supabase.from("sales").select("total_amount, created_at"),
    supabase.from("products").select("*"),
    supabase.from("shop_settings").select("*").single()
  ]);

  const sales = salesRes.data;
  const products = productsRes.data;
  const settings = settingsRes.data;

  // 2. Identify Critical Stocks base sa threshold sa Settings
  const threshold = settings?.low_stock_threshold ?? 5;
  const lowStockItems = products?.filter(p => p.stock_quantity <= threshold) || [];

  // --- LOGIC PARA SA CHART ---
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    const dayName = format(date, "EEEE");
    
    const dailyTotal = sales
      ?.filter((sale) => isSameDay(new Date(sale.created_at), date))
      .reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

    return { day: dayName, sales: dailyTotal };
  });

  // --- STATS COMPUTATION ---
  const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
  const totalItems = products?.reduce((sum, p) => sum + Number(p.stock_quantity), 0) || 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-black uppercase italic">Dashboard</h2>
        <p className="text-sm text-muted-foreground font-medium">Real-time overview of your business performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-600">
              ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Items in Stock</CardTitle>
            <Package className="h-4 w-4 text-zinc-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-600">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-zinc-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">{sales?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Left Side) */}
        <div className="lg:col-span-2">
          <SalesChart data={last7Days} />
        </div>

        {/* Critical Stock Alerts (Right Side) */}
        <div className="space-y-6">
          <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-red-50/50 border-b border-red-100">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Critical Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockItems.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {lowStockItems.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-black uppercase tracking-tighter leading-none">{item.name}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{item.sku || "NO SKU"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-red-600">{item.stock_quantity}</span>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Units</p>
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/inventory" 
                    className="flex items-center justify-center gap-2 p-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all"
                  >
                    Manage Inventory <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">All stocks healthy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}