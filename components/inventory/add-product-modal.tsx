"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddProductModal() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    stock_quantity: 0,
    price: 0,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          stock_quantity: formData.stock_quantity,
          price: formData.price,
        },
      ]);

    if (error) {
      toast.error("Failed to add product", {
        description: error.message,
      });
    } else {
      toast.success("Product added successfully", {
        description: `${formData.name} has been added to your inventory.`,
      });
      setOpen(false);
      setFormData({ name: "", sku: "", category: "", stock_quantity: 0, price: 0 });
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-zinc-800 text-white gap-2 font-bold uppercase text-[10px] tracking-widest px-6 h-11">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md font-sans border-zinc-200">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic">Add New Product</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">Fill in the details to add to inventory.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Product Name</Label>
              <Input 
                id="name" 
                required
                className="h-11 focus-visible:ring-black"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Arabica Coffee" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SKU</Label>
                <Input 
                  id="sku" 
                  className="h-11 focus-visible:ring-black font-mono"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="SKU-001" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</Label>
                <Input 
                  id="category" 
                  className="h-11 focus-visible:ring-black"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Beverage" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Initial Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  className="h-11 focus-visible:ring-black font-bold"
                  min={0}
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price (₱)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  className="h-11 focus-visible:ring-black font-bold"
                  min={0}
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              type="button" 
              className="font-bold uppercase text-[10px] tracking-widest"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              disabled={loading} 
              className="bg-black text-white hover:bg-zinc-800 font-bold uppercase text-[10px] tracking-widest px-8" 
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}