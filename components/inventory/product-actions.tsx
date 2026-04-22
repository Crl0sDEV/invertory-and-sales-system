"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const supabase = createClient();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku || "",
    category: product.category || "",
    stock_quantity: product.stock_quantity,
    price: product.price,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("products").update(formData).eq("id", product.id);

    if (error) {
      toast.error("Update failed", { description: error.message });
    } else {
      toast.success("Product updated");
      setIsEditDialogOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    
    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      toast.success("Product deleted", { description: "Item removed from inventory." });
      setIsDeleteDialogOpen(false); // Close modal
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-sans w-40">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer font-medium text-xs">
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Product
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Imbis na confirm(), i-set lang natin yung state para magbukas ang Alert Dialog */}
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600 cursor-pointer font-medium text-xs">
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog (Existing) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md font-sans border-zinc-200">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Edit Product</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium text-xs">Update product details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Product Name</Label>
                <Input 
                  className="h-11 focus-visible:ring-black"
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stock</Label>
                  <Input 
                    type="number"
                    className="h-11 focus-visible:ring-black font-bold"
                    value={formData.stock_quantity} 
                    onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price</Label>
                  <Input 
                    type="number"
                    className="h-11 focus-visible:ring-black font-bold"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-zinc-800 font-bold uppercase text-[10px] tracking-widest px-8">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modern Delete Modal (Alert Dialog) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="font-sans sm:max-w-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase italic tracking-tighter">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-xs leading-relaxed">
              This action cannot be undone. This will permanently delete <span className="font-black text-black">{product.name}</span> and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="font-bold uppercase text-[10px] tracking-widest">Cancel</AlertDialogCancel>
            <Button 
              onClick={handleDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-widest px-6"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}