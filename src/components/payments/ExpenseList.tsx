"use client";
import { useState } from "react";
import { createExpense, deleteExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExpenseListProps {
  initialExpenses: any[];
}

const CATEGORIES = ["Rent", "Utilities", "Marketing", "Software", "Travel", "Salaries (Other)", "Office Supplies", "Others"];

export function ExpenseList({ initialExpenses }: ExpenseListProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    category: "Others",
    amount: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    description: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
    }
    setLoading(true);
    try {
      await createExpense(formData);
      toast.success("Expense logged successfully");
      setOpen(false);
      // We rely on revalidatePath via the server action, but for absolute safety in UI:
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || "Failed to log expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success("Expense deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" /> Recent Expenses
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Log Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Rent for March, etc." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Logging..." : "Log Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No expenses logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="py-3 text-sm">{format(new Date(expense.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium border uppercase tracking-wider whitespace-nowrap">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{expense.description || "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600 text-sm">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
