"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormSheet } from "@/components/admin/ProductFormSheet";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const MOCK_PRODUCTS = [
  { id: "1", name: "Royal Canin Medium Adult 2kg", sku: "RC-MA-2KG", category: "Dog Food", brand: "Royal Canin", price: 1299, discount_percentage: 10, stock_quantity: 2, is_active: true, featured_image_url: "" },
  { id: "2", name: "Whiskas Adult Tuna 1.2kg", sku: "WK-TU-1.2KG", category: "Cat Food", brand: "Whiskas", price: 499, discount_percentage: 0, stock_quantity: 38, is_active: true, featured_image_url: "" },
  { id: "3", name: "Drools Focus Puppy Super Premium 1kg", sku: "DR-FP-1KG", category: "Dog Food", brand: "Drools", price: 649, discount_percentage: 15, stock_quantity: 3, is_active: true, featured_image_url: "" },
  { id: "4", name: "Farmina N&D Ancestral Grain Cat 1.5kg", sku: "FA-ANC-1.5KG", category: "Cat Food", brand: "Farmina", price: 2499, discount_percentage: 5, stock_quantity: 24, is_active: false, featured_image_url: "" },
  { id: "5", name: "Taiyo Goldfish Pellets 200g", sku: "TY-GF-200G", category: "Fish Food", brand: "Taiyo", price: 129, discount_percentage: 0, stock_quantity: 7, is_active: true, featured_image_url: "" },
  { id: "6", name: "Pedigree Adult Chicken Rice 10kg", sku: "PD-AC-10KG", category: "Dog Food", brand: "Pedigree", price: 1899, discount_percentage: 20, stock_quantity: 15, is_active: true, featured_image_url: "" },
];

const CATEGORIES = ["All", "Dog Food", "Cat Food", "Bird Food", "Fish Food", "Hamster Food"];

export default function AdminProductsPage(): JSX.Element {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  const openCreate = () => { setEditProduct(null); setSheetOpen(true); };
  const openEdit = (p: any) => { setEditProduct(p); setSheetOpen(true); };

  const handleSuccess = (updated: any) => {
    if (editProduct) {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setProducts((prev) => [updated, ...prev]);
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} of {products.length} products</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const discounted = p.discount_percentage > 0
                  ? p.price * (1 - p.discount_percentage / 100)
                  : null;
                return (
                  <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          🛍️
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm">
                          ₹{discounted ?? p.price}
                        </p>
                        {discounted && (
                          <p className="text-xs text-muted-foreground line-through">₹{p.price}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-semibold ${p.stock_quantity <= 5 ? "text-red-600" : p.stock_quantity <= 20 ? "text-amber-600" : "text-green-600"}`}>
                        {p.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(p.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    No products found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sheet */}
      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={editProduct}
        onSuccess={handleSuccess}
      />

      {/* Delete dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Product?"
        description="This will permanently remove the product from your store. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
