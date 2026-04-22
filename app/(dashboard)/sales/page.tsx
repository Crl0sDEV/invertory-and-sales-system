"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, ShoppingCart, Trash2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { generateReceipt } from "@/lib/generate-receipt";
import { Product, CartItem } from "@/types";
import { toast } from "sonner";

export default function SalesPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Memoized fetch para safe gamitin sa loob at labas ng useEffect
  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .gt("stock_quantity", 0);
    if (data) setProducts(data);
  }, [supabase]);

  // Initial Load with cleanup
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .gt("stock_quantity", 0);
      
      if (isMounted && data) {
        setProducts(data);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [supabase]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) return toast.error("Out of stock!");
      setCart(cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. Fetch natin ang Settings para malaman kung auto-receipt at para sa headers
      const { data: settings } = await supabase
        .from("shop_settings")
        .select("*")
        .single();

      // 2. Create the Main Sale Record sa Database
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([{ total_amount: total, payment_method: "Cash" }])
        .select()
        .single();

      if (saleError) {
        toast.error("Sale Error", { description: saleError.message });
        setLoading(false);
        return;
      }

      // 3. Create the Sale Items (Ito ang magbabawas ng stocks via SQL Trigger)
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);

      if (itemsError) {
        toast.error("Items Error", { description: itemsError.message });
      } else {
        // 4. CHECKOUT SUCCESS: Condition para sa Receipt
        if (settings?.auto_receipt) {
          generateReceipt({
            id: sale.id,
            items: cart,
            total: total,
            paymentMethod: "Cash",
            shopName: settings?.shop_name,
            address: settings?.address,
          });
          toast.success("Sale Successful", { description: "Receipt has been generated." });
        } else {
          toast.success("Sale Successful", { description: "Transaction recorded successfully." });
        }

        setCart([]);
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
      toast.error("Unexpected Error", { description: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-6 font-sans">
      {/* Product Selection Side */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search product or scan barcode..." 
            className="pl-10 h-12 text-lg focus-visible:ring-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
              .map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-black transition-all group shadow-sm border-zinc-200"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{product.sku}</Badge>
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{product.stock_quantity} Left</span>
                  </div>
                  <h3 className="font-bold text-zinc-900 group-hover:text-black">{product.name}</h3>
                  <p className="text-lg font-black text-black">₱{product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Checkout Side */}
      <Card className="w-96 flex flex-col border-zinc-200 shadow-xl bg-white">
        <CardHeader className="border-b bg-zinc-50/50">
          <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
            <ShoppingCart className="w-4 h-4" /> Current Order
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-zinc-400 text-[10px] uppercase font-bold tracking-widest italic">
                Cart is empty
              </div>
            )}
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 last:border-0">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-black uppercase tracking-tighter">{item.name}</p>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{item.quantity} x ₱{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm">₱{(item.price * item.quantity).toFixed(2)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromCart(item.id)} 
                    className="h-8 w-8 text-zinc-300 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>

          <div className="p-6 bg-zinc-50 border-t space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Total Amount</span>
              <span className="text-3xl font-black italic tracking-tighter">₱{total.toFixed(2)}</span>
            </div>
            <Button 
              disabled={loading || cart.length === 0} 
              onClick={handleCheckout}
              className="w-full h-14 bg-black text-white hover:bg-zinc-800 text-lg font-black gap-2 uppercase tracking-widest"
            >
              <CheckCircle2 className="w-5 h-5" />
              {loading ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}