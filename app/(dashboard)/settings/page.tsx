"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    id: "00000000-0000-0000-0000-000000000000",
    shop_name: "",
    shop_email: "",
    address: "",
    low_stock_threshold: 5,
    low_stock_alerts: true,
    auto_receipt: true,
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from("shop_settings")
        .select("*")
        .single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, [supabase]);

  const handleUpdate = async (updates: Partial<typeof settings>) => {
    setLoading(true);
    const { error } = await supabase
      .from("shop_settings")
      .update(updates)
      .eq("id", settings.id);

    if (error) {
      toast.error("Error updating settings", {
        description: error.message,
      });
    } else {
      setSettings((prev) => ({ ...prev, ...updates }));
      toast.success("Settings saved", {
        description: "Your preferences have been updated successfully.",
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password too short", {
        description: "Password must be at least 6 characters.",
      });
    }
  
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match", {
        description: "Please check your new and confirm passwords.",
      });
    }
  
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });
  
    if (error) {
      toast.error("Update failed", { description: error.message });
    } else {
      toast.success("Password updated", {
        description: "Your security credentials have been changed.",
      });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <header>
        <h1 className="text-2xl tracking-tight uppercase italic font-black">Settings</h1>
        <p className="text-sm font-medium text-zinc-500">
          Manage your shop profile and system preferences.
        </p>
      </header>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-zinc-100 p-1">
          <TabsTrigger value="profile" className="text-[10px] font-bold uppercase tracking-widest">Shop Profile</TabsTrigger>
          <TabsTrigger value="system" className="text-[10px] font-bold uppercase tracking-widest">System</TabsTrigger>
          <TabsTrigger value="account" className="text-[10px] font-bold uppercase tracking-widest">Account</TabsTrigger>
        </TabsList>

        {/* Tab 1: Shop Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Business Information</CardTitle>
              <CardDescription className="text-xs">This data will appear on your receipts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  <Input 
                    value={settings.shop_name} 
                    onChange={(e) => setSettings({...settings, shop_name: e.target.value})}
                    className="focus-visible:ring-black" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    value={settings.shop_email} 
                    onChange={(e) => setSettings({...settings, shop_email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Input 
                  value={settings.address} 
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>
              <Button 
                onClick={() => handleUpdate({
                  shop_name: settings.shop_name,
                  shop_email: settings.shop_email,
                  address: settings.address
                })} 
                disabled={loading}
                className="bg-black text-white hover:bg-zinc-800 font-bold uppercase text-[10px] tracking-widest"
              >
                {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: System Preferences */}
        <TabsContent value="system" className="space-y-4">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Notifications & Automation</CardTitle>
              <CardDescription className="text-xs">Control how the system behaves.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Low Stock Threshold Input */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-bold uppercase tracking-tighter">Low Stock Threshold</Label>
          <p className="text-xs text-muted-foreground">Set the quantity to trigger low stock alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            className="w-20 text-right font-bold"
            value={settings.low_stock_threshold}
            onChange={(e) => setSettings({...settings, low_stock_threshold: parseInt(e.target.value)})}
            onBlur={() => handleUpdate({ low_stock_threshold: settings.low_stock_threshold })}
          />
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Units</span>
        </div>
      </div>

      {/* Low Stock Switch */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-bold uppercase tracking-tighter">Low Stock Alerts</Label>
          <p className="text-xs text-muted-foreground">Enable visual indicators for low inventory.</p>
        </div>
        <Switch 
          checked={settings.low_stock_alerts}
          onCheckedChange={(checked) => handleUpdate({ low_stock_alerts: checked })}
        />
      </div>

              {/* Auto Receipt Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold uppercase tracking-tighter">Auto-Generate PDF Receipt</Label>
                  <p className="text-xs text-muted-foreground">Automatically download receipt after sale.</p>
                </div>
                <Switch 
                  checked={settings.auto_receipt}
                  onCheckedChange={(checked) => handleUpdate({ auto_receipt: checked })}
                />
              </div>

              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold uppercase tracking-tighter">Dark Mode (Beta)</Label>
                  <p className="text-xs text-muted-foreground">Coming soon in next update.</p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Account Settings */}
<TabsContent value="account" className="space-y-4">
  <Card className="border-zinc-200 shadow-sm">
    <CardHeader>
      <CardTitle className="text-sm font-bold uppercase tracking-widest">Security</CardTitle>
      <CardDescription className="text-xs">Update your password and account security.</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPass">New Password</Label>
          <Input 
            id="newPass" 
            type="password" 
            placeholder="Min. 6 characters"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            className="focus-visible:ring-black"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPass">Confirm New Password</Label>
          <Input 
            id="confirmPass" 
            type="password" 
            placeholder="Repeat new password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            className="focus-visible:ring-black"
          />
        </div>
        <Button 
          type="submit"
          disabled={loading || !passwordData.newPassword}
          className="bg-black text-white hover:bg-zinc-800 font-bold uppercase text-[10px] tracking-widest w-full md:w-auto"
        >
          {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Update Password
        </Button>
      </form>
    </CardContent>
  </Card>
  
  {/* Bonus: User Info Display */}
  <Card className="border-zinc-200 shadow-sm bg-zinc-50/50">
    <CardContent className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Active Account</p>
          <p className="text-sm font-bold text-zinc-600">Administrator Access</p>
        </div>
        <Badge className="bg-zinc-200 text-zinc-700 hover:bg-zinc-200 border-none uppercase text-[9px] font-black">Verified</Badge>
      </div>
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>
    </div>
  );
}