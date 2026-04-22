import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { AddProductModal } from "@/components/inventory/add-product-modal";
  import { createClient } from "@/utils/supabase/server";
  import { ProductActions } from "@/components/inventory/product-actions";
  import { Product } from "@/types";
  import { InventorySearch } from "@/components/inventory/inventory-search";
  
  export default async function InventoryPage({
    searchParams,
  }: {
    searchParams: Promise<{ query?: string }>;
  }) {
    const supabase = await createClient();
    const query = (await searchParams).query || "";
  
    const { data: settings } = await supabase
      .from("shop_settings")
      .select("*")
      .single();
  
    // Fetch products query base
    let supabaseQuery = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
  
    // Database-side filtering
    if (query) {
      supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
    }
  
    const { data: products, error } = await supabaseQuery;
  
    if (error) console.error("Error fetching products:", error);
  
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-black">Inventory</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Manage your stock and products.
            </p>
          </div>
          <AddProductModal />
        </div>
  
        <div className="flex items-center gap-4">
          {/* Ito na yung handle ng Input at Search icon sa loob */}
          <InventorySearch defaultValue={query} />
        </div>
  
        <div className="rounded-md border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="font-black text-black uppercase text-[10px] tracking-[0.2em]">Product Name</TableHead>
                <TableHead className="font-black text-black uppercase text-[10px] tracking-[0.2em]">SKU</TableHead>
                <TableHead className="font-black text-black uppercase text-[10px] tracking-[0.2em]">Category</TableHead>
                <TableHead className="font-black text-black uppercase text-[10px] tracking-[0.2em]">Stock</TableHead>
                <TableHead className="text-right font-black text-black uppercase text-[10px] tracking-[0.2em]">Price</TableHead>
                <TableHead className="w-12.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product: Product) => (
                  <TableRow key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-bold text-black uppercase text-xs tracking-tighter">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-zinc-400 font-mono text-[10px] uppercase font-bold">
                      {product.sku || "---"}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                      {product.category}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ring-1 ring-inset ${
                        settings?.low_stock_alerts && product.stock_quantity <= (settings?.low_stock_threshold || 5)
                          ? "bg-red-50 text-red-700 ring-red-600/20"
                          : "bg-zinc-100 text-zinc-900 ring-zinc-200"
                      }`}>
                        {product.stock_quantity} units
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-black">
                      ₱{Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActions product={product} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-zinc-400">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                      {query ? `No results for "${query}"` : "No products found."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }