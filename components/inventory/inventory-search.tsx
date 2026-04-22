"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function InventorySearch({ defaultValue }: { defaultValue: string }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Para hindi bawat press ng key ay nagre-request (Performance)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <Input
        placeholder="Search product name..."
        defaultValue={defaultValue}
        className="pl-10 h-11 focus-visible:ring-black border-zinc-200 uppercase text-xs font-bold tracking-widest"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}