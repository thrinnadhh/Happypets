"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Save, RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";

const MOCK_INVENTORY = [
  { id: "1", name: "Royal Canin Medium Adult 2kg", sku: "RC-MA-2KG", category: "Dog Food", stock: 2, threshold: 10 },
  { id: "2", name: "Whiskas Adult Tuna 1.2kg", sku: "WK-TU-1.2KG", category: "Cat Food", stock: 38, threshold: 10 },
  { id: "3", name: "Drools Focus Puppy 1kg", sku: "DR-FP-1KG", category: "Dog Food", stock: 3, threshold: 10 },
  { id: "4", name: "Farmina N&D Cat 1.5kg", sku: "FA-ANC-1.5KG", category: "Cat Food", stock: 24, threshold: 10 },
  { id: "5", name: "Taiyo Goldfish Pellets 200g", sku: "TY-GF-200G", category: "Fish Food", stock: 7, threshold: 5 },
  { id: "6", name: "Pedigree Adult Chicken 10kg", sku: "PD-AC-10KG", category: "Dog Food", stock: 15, threshold: 5 },
  { id: "7", name: "Whiskas Kitten Ocean Fish 400g", sku: "WK-KT-400G", category: "Cat Food", stock: 52, threshold: 15 },
  { id: "8", name: "NutriPet Hamster Mix 500g", sku: "NP-HM-500G", category: "Hamster Food", stock: 18, threshold: 8 },
];

type StockEntry = typeof MOCK_INVENTORY[0];

function getStockStatus(stock: number, threshold: number) {
  if (stock === 0) return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
  if (stock <= Math.floor(threshold / 2)) return { label: "Critical", className: "bg-red-100 text-red-700" };
  if (stock <= threshold) return { label: "Low", className: "bg-amber-100 text-amber-700" };
  return { label: "In Stock", className: "bg-green-100 text-green-700" };
}

export default function AdminInventoryPage(): JSX.Element {
  const [inventory, setInventory] = useState<StockEntry[]>(MOCK_INVENTORY);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const filtered = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setEdits((prev) => ({ ...prev, [id]: num }));
    }
  };

  const getDisplayStock = (item: StockEntry) =>
    item.id in edits ? edits[item.id] : item.stock;

  const hasPendingChanges = Object.keys(edits).length > 0;

  const saveChanges = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setInventory((prev) =>
      prev.map((item) =>
        item.id in edits ? { ...item, stock: edits[item.id] } : item
      )
    );
    setEdits({});
    setSaving(false);
    toast.success("Inventory updated successfully");
  };

  const exportCSV = () => {
    const header = "SKU,Name,Category,Stock,Status\n";
    const rows = inventory
      .map((i) => {
        const status = getStockStatus(i.stock, i.threshold).label;
        return `${i.sku},"${i.name}",${i.category},${i.stock},${status}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `happypets-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and update stock levels directly
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          {hasPendingChanges && (
            <Button size="sm" className="gap-2" onClick={saveChanges} disabled={saving}>
              {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes ({Object.keys(edits).length})
            </Button>
          )}
        </div>
      </div>

      {/* Alerts summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Out of Stock", count: inventory.filter((i) => i.stock === 0).length, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Low Stock (≤ threshold)", count: inventory.filter((i) => i.stock > 0 && i.stock <= i.threshold).length, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Healthy Stock", count: inventory.filter((i) => i.stock > i.threshold).length, color: "bg-green-50 border-green-200 text-green-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 flex items-center justify-between ${s.color}`}>
            <span className="text-sm font-medium">{s.label}</span>
            <span className="text-2xl font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-5">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36">Stock Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const status = getStockStatus(getDisplayStock(item), item.threshold);
                const isEdited = item.id in edits;
                return (
                  <TableRow key={item.id} className={`hover:bg-gray-50 transition-colors ${isEdited ? "bg-amber-50/60" : ""}`}>
                    <TableCell className="pl-5 font-medium text-sm">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={getDisplayStock(item)}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                        className={`w-28 h-8 text-sm font-medium ${isEdited ? "border-amber-400 ring-1 ring-amber-300" : ""}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {hasPendingChanges && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background rounded-2xl px-5 py-3 shadow-xl flex items-center gap-4">
          <p className="text-sm font-medium">{Object.keys(edits).length} unsaved change{Object.keys(edits).length !== 1 ? "s" : ""}</p>
          <Button size="sm" variant="secondary" onClick={saveChanges} disabled={saving} className="gap-2">
            {saving ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
