"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ShieldOff, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/* ── Mock data ─────────────────────────── */
const MOCK_ADMINS: Admin[] = [
  { id: "a1", name: "Rahul Mehta", email: "rahul@petsupply.in", shop: "PetSupply India", shopTag: "petsupply", registered: "28 Mar 2026", status: "pending", products: 0 },
  { id: "a2", name: "Sneha Patel", email: "sneha@furryfoods.com", shop: "Furry Foods", shopTag: "furryfoods", registered: "29 Mar 2026", status: "pending", products: 0 },
  { id: "a3", name: "Kiran Nair", email: "kiran@zoozone.in", shop: "ZooZone", shopTag: "zoozone", registered: "30 Mar 2026", status: "pending", products: 0 },
  { id: "a4", name: "Aisha Fernandez", email: "aisha@pawfeast.in", shop: "PawFeast", shopTag: "pawfeast", registered: "10 Jan 2026", status: "approved", products: 142 },
  { id: "a5", name: "Vikram Sharma", email: "vikram@petmart.co", shop: "PetMart", shopTag: "petmart", registered: "5 Feb 2026", status: "approved", products: 89 },
  { id: "a6", name: "Priya Das", email: "priya@nutrivet.in", shop: "NutriVet", shopTag: "nutrivet", registered: "15 Mar 2026", status: "approved", products: 37 },
  { id: "a7", name: "Ravi Kumar", email: "ravi@suspendedshop.in", shop: "SuspendedShop", shopTag: "suspshop", registered: "1 Feb 2026", status: "suspended", products: 54, suspendedAt: "20 Mar 2026", suspendReason: "Selling counterfeit products" },
  { id: "a8", name: "Tanvi Roy", email: "tanvi@rejectedshop.in", shop: "RejectedShop", shopTag: "rejshop", registered: "25 Feb 2026", status: "rejected", products: 0 },
];

type AdminStatus = "pending" | "approved" | "suspended" | "rejected";
interface Admin {
  id: string;
  name: string;
  email: string;
  shop: string;
  shopTag: string;
  registered: string;
  status: AdminStatus;
  products: number;
  suspendedAt?: string;
  suspendReason?: string;
}

const STATUS_BADGE: Record<AdminStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-600",
};

export default function SuperAdminAdmins(): JSX.Element {
  const [admins, setAdmins] = useState<Admin[]>(MOCK_ADMINS);
  const [tab, setTab] = useState<AdminStatus>("pending");

  // Suspend dialog state
  const [suspendTarget, setSuspendTarget] = useState<Admin | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspending, setSuspending] = useState(false);

  const byStatus = (s: AdminStatus) => admins.filter((a) => a.status === s);
  const pendingCount = byStatus("pending").length;

  const updateStatus = (id: string, newStatus: AdminStatus, extra?: Partial<Admin>) => {
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus, ...extra } : a));
  };

  const handleApprove = (admin: Admin) => {
    updateStatus(admin.id, "approved");
    toast.success(`${admin.name} approved successfully`);
  };

  const handleReject = (admin: Admin) => {
    updateStatus(admin.id, "rejected");
    toast.error(`${admin.name} rejected`);
  };

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) return;
    setSuspending(true);
    await new Promise((r) => setTimeout(r, 600));
    updateStatus(suspendTarget.id, "suspended", {
      suspendedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      suspendReason,
    });
    toast.warning(`${suspendTarget.name}'s account has been suspended`);
    setSuspendTarget(null);
    setSuspendReason("");
    setSuspending(false);
  };

  const handleReactivate = (admin: Admin) => {
    updateStatus(admin.id, "approved", { suspendedAt: undefined, suspendReason: undefined });
    toast.success(`${admin.name} reactivated`);
  };

  /* ── Admin row ─────────────────────── */
  function AdminRow({ admin }: { admin: Admin }) {
    return (
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {admin.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold">{admin.name}</p>
              <p className="text-xs text-muted-foreground">{admin.email}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded">{admin.shopTag}</span>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{admin.registered}</TableCell>
        <TableCell>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[admin.status]}`}>
            {admin.status}
          </span>
        </TableCell>
        <TableCell className="text-center text-sm font-medium">{admin.products}</TableCell>
        <TableCell>
          {admin.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1 h-7" onClick={() => handleApprove(admin)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-7" onClick={() => handleReject(admin)}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            </div>
          )}
          {admin.status === "approved" && (
            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-7" onClick={() => setSuspendTarget(admin)}>
              <ShieldOff className="w-3.5 h-3.5" /> Suspend
            </Button>
          )}
          {admin.status === "suspended" && (
            <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => handleReactivate(admin)}>
              <RotateCcw className="w-3.5 h-3.5" /> Reactivate
            </Button>
          )}
          {admin.status === "rejected" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1 h-7" onClick={() => handleApprove(admin)}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  }

  const AdminTable = ({ list }: { list: Admin[] }) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {list.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No admins in this category.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Shop Tag</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((a) => (
              <AdminRow key={a.id} admin={a} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Review, approve, and manage shop admins</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AdminStatus)}>
        <TabsList className="bg-white border">
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pendingCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected"] as AdminStatus[]).map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            <AdminTable list={byStatus(s)} />
          </TabsContent>
        ))}

        <TabsContent value="suspended" className="mt-4 space-y-3">
          {byStatus("suspended").map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{a.name} <span className="text-xs text-muted-foreground">({a.email})</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Shop: <span className="font-medium">{a.shop}</span> · Suspended: {a.suspendedAt}</p>
                  <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-700"><span className="font-semibold">Reason:</span> {a.suspendReason}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => handleReactivate(a)}>
                  <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                </Button>
              </div>
            </div>
          ))}
          {byStatus("suspended").length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-muted-foreground text-sm">
              No suspended admins.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ShieldOff className="w-5 h-5" /> Suspend Admin
            </DialogTitle>
            <DialogDescription>
              You are about to suspend <span className="font-semibold text-foreground">{suspendTarget?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>This will immediately log them out and hide all their products from the storefront.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for suspension <span className="text-red-500">*</span></label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Describe the reason clearly…"
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 flex-row justify-end">
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 gap-2"
              disabled={!suspendReason.trim() || suspending}
              onClick={handleSuspend}
            >
              <ShieldOff className="w-4 h-4" />
              {suspending ? "Suspending…" : "Confirm Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
