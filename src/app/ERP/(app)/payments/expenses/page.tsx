import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getExpenses } from "@/actions/expenses";
import { ExpenseList } from "@/components/payments/ExpenseList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingDown, Receipt } from "lucide-react";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ERP/login");

  const expenses = await getExpenses();
  
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Expense Tracking" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString("en-IN")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{thisMonthExpenses.toLocaleString("en-IN")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entries</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>
        </div>

        <ExpenseList initialExpenses={expenses} />
      </div>
    </div>
  );
}
