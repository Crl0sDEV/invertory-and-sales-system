import { createClient } from "@/utils/supabase/server";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);

  const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-sm text-muted-foreground">Monitor your business performance and revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">
              ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-green-600 font-bold mt-1">↑ All time earnings</p>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-black">{sales?.length || 0}</div>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">Completed sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-zinc-50/50 border-b">
          <CardTitle className="text-sm font-bold uppercase tracking-tight">Recent Transactions</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/30">
              <TableHead className="font-bold text-black uppercase text-[10px]">Transaction ID</TableHead>
              <TableHead className="font-bold text-black uppercase text-[10px]">Date</TableHead>
              <TableHead className="font-bold text-black uppercase text-[10px]">Payment</TableHead>
              <TableHead className="text-right font-bold text-black uppercase text-[10px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales && sales.length > 0 ? (
              sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-zinc-50/50 transition-colors">
                  <TableCell className="font-mono text-[10px] text-zinc-500">{sale.id}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(sale.created_at), "MMM dd, yyyy • hh:mm b")}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold uppercase tracking-tighter">
                      {sale.payment_method}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-black">
                    ₱{Number(sale.total_amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-zinc-400 italic text-sm">
                  No sales recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}