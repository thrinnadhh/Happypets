"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Store, Package } from "lucide-react";
import { toast } from "sonner";

interface Shop {
  id: string;
  name: string;
  displayName: string;
  description: string;
  adminCount: number;
  productCount: number;
  active: boolean;
  createdAt: string;
}

const MOCK_SHOPS: Shop[] = [
  { id: "s1", name: "pawfeast", displayName: "PawFeast", description: "Premium dog and cat nutrition.", adminCount: 1, productCount: 142, active: true, createdAt: "Jan 2026" },
  { id: "s2", name: "petmart", displayName: "PetMart", description: "Everything your pet needs.", adminCount: 2, productCount: 89, active: true, createdAt: "Feb 2026" },
  { id: "s3", name: "nutrivet", displayName: "NutriVet", description: "Vet-formulated nutrition.", adminCount: 1, productCount: 37, active: true, createdAt: "Mar 2026" },
  { id: "s4", name: "birdnest", displayName: "BirdNest", description: "Specialist bird feed.", adminCount: 1, productCount: 22, active: false, createdAt: "Mar 2026" },
  { id: "s5", name: "furfit", displayName: "FurFit", description: "Health and wellness for pets.", adminCount: 1, productCount: 60, active: true, createdAt: "Feb 2026" },
];

const SHOP_EMOJIS = ["🐕","🐈","🦜","🐟","🐹","🦮","🐾","🏪"];

type DialogMode = "add" | "edit" | null;

export default function SuperAdminShops(): JSX.Element {
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  const [mode, setMode] = useState<DialogMode>(null);
  const [editTarget, setEditTarget] = useState<Shop | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shop | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", displayName: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setForm({ name: "", displayName: "", description: "" });
    setErrors({});
    setEditTarget(null);
    setMode("add");
  };

  const openEdit = (shop: Shop) => {
    setForm({ name: shop.name, displayName: shop.displayName, description: shop.description });
    setErrors({});
    setEditTarget(shop);
    setMode("edit");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "add") {
      if (!/^[a-z0-9]+$/.test(form.name)) e.name = "Only lowercase letters and numbers, no spaces";
      if (shops.some((s) => s.name === form.name)) e.name = "Shop name already taken";
    }
    if (!form.displayName.trim()) e.displayName = "Display name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    if (mode === "add") {
      const newShop: Shop = {
        id: `s${Date.now()}`,
        name: form.name,
        displayName: form.displayName,
        description: form.description,
        adminCount: 0,
        productCount: 0,
        active: true,
        createdAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      };
      setShops((p) => [newShop, ...p]);
      toast.success(`Shop "${form.displayName}" created`);
    } else if (editTarget) {
      setShops((p) => p.map((s) => s.id === editTarget.id
        ? { ...s, displayName: form.displayName, description: form.description }
        : s
      ));
      toast.success("Shop updated");
    }

    setSaving(false);
    setMode(null);
  };

  const handleDeactivate = () => {
    if (!deleteTarget) return;
    setShops((p) => p.map((s) => s.id === deleteTarget.id ? { ...s, active: false } : s));
    toast.warning(`${deleteTarget.displayName} deactivated`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-muted-foreground text-sm mt-1">{shops.length} registered shops</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Shop
        </Button>
      </div>

      {/* Shop cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shops.map((shop, i) => (
          <div
            key={shop.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${!shop.active ? "opacity-60 border-dashed border-gray-200" : "border-gray-200 hover:shadow-md"}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {SHOP_EMOJIS[i % SHOP_EMOJIS.length]}
              </div>
              {!shop.active && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
              )}
            </div>

            <h3 className="font-bold text-base">{shop.displayName}</h3>
            <p className="text-xs font-mono text-muted-foreground">/{shop.name}</p>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{shop.description || "—"}</p>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Store className="w-3.5 h-3.5" /> {shop.adminCount} admin{shop.adminCount !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="w-3.5 h-3.5" /> {shop.productCount} products
              </div>
              <p className="text-xs text-muted-foreground ml-auto">{shop.createdAt}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1 gap-1 h-7" onClick={() => openEdit(shop)}>
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              {shop.active && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 h-7 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(shop)}
                >
                  <Trash2 className="w-3 h-3" /> Deactivate
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add New Shop" : "Edit Shop"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {mode === "add" && (
              <div>
                <label className="text-sm font-medium">Shop Name (slug) <span className="text-red-500">*</span></label>
                <Input
                  className="mt-1.5"
                  placeholder="e.g. pawfeast (no spaces, lowercase)"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") }))}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                <p className="text-xs text-muted-foreground mt-1">This cannot be changed later.</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Display Name <span className="text-red-500">*</span></label>
              <Input
                className="mt-1.5"
                placeholder="e.g. PawFeast"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              />
              {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                className="mt-1.5 resize-none"
                rows={3}
                placeholder="Short description of the shop…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setMode(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "add" ? "Create Shop" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deleteTarget?.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the shop. Products will be hidden. This can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
