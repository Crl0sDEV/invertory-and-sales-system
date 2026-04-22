"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-zinc-50/50 font-sans">
        {/* Tunay na Shadcn Sidebar */}
        <Sidebar className="border-r border-zinc-200 bg-white">
          <SidebarHeader className="p-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-black tracking-tighter text-black uppercase italic">KREIZZYY</h2>
              <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold">Systems v1.0</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-2">
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-11 px-4 text-zinc-600 hover:text-black hover:bg-zinc-100 transition-all rounded-lg data-[active=true]:bg-black data-[active=true]:text-white"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span className="font-bold uppercase text-[11px] tracking-widest">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* FIXED FOOTER: Hinding-hindi aalis sa pwesto ito */}
          <SidebarFooter className="p-4 border-t border-zinc-100 bg-white">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-11 px-4 text-zinc-600 hover:text-black rounded-lg transition-all">
                  <Link href="/settings">
                    <Settings className="w-4 h-4" />
                    <span className="font-bold uppercase text-[11px] tracking-widest">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 px-4 py-6 text-zinc-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase text-[11px] tracking-widest transition-all rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area: Ito lang ang magiging scrollable */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {pathname === "/" ? "Overview" : pathname.replace("/", "")}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-[10px] text-white font-black italic">
                KM
              </div>
            </div>
          </header>

          {/* Ito yung scrollable section */}
          <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}