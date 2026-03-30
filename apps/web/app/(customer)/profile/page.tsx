"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProfileAction, changePasswordAction } from "@/app/actions/auth";
import { User, Lock, ShoppingBag, Heart, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit number"),
});

const passwordSchema = z.object({
  current_password: z.string().min(6, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

// Mock user data — replace with Supabase getUser()
const MOCK_USER = {
  full_name: "Priya Sharma",
  email: "priya@example.com",
  phone: "9876543210",
  joined: "January 2026",
  orders: 4,
  wishlist: 7,
};

export default function ProfilePage(): JSX.Element {
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: MOCK_USER.full_name,
      phone: MOCK_USER.phone,
    },
  });

  const pwForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const onProfileSave = async (values: z.infer<typeof profileSchema>) => {
    setProfileSaving(true);
    try {
      const fd = new FormData();
      fd.set("full_name", values.full_name);
      fd.set("phone", values.phone);
      const res = await updateProfileAction(fd);
      if (res.success) {
        toast.success("Profile updated!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSave = async (values: z.infer<typeof passwordSchema>) => {
    setPwSaving(true);
    try {
      const res = await changePasswordAction({
        current_password: values.current_password,
        new_password: values.new_password,
      } as any);
      if (res.success) {
        toast.success("Password changed successfully!");
        pwForm.reset();
      } else {
        toast.error(res.error || "Failed to change password");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-8">
        {/* Profile hero */}
        <div className="bg-gradient-to-br from-[#2C4A2E] to-[#1a2e1c] rounded-3xl p-8 text-white flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-400 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-xl">
            {MOCK_USER.full_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{MOCK_USER.full_name}</h1>
            <p className="text-green-200 text-sm mt-1">{MOCK_USER.email}</p>
            <p className="text-green-300 text-xs mt-1">Member since {MOCK_USER.joined}</p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold">{MOCK_USER.orders}</p>
                <p className="text-green-300 text-xs">Orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: MOCK_USER.orders, icon: ShoppingBag, color: "bg-blue-50 text-blue-700" },
            { label: "Wishlist Items", value: MOCK_USER.wishlist, icon: Heart, color: "bg-red-50 text-red-700" },
            { label: "Loyalty Points", value: "420", icon: CheckCircle2, color: "bg-amber-50 text-amber-700" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-center">
                <div className={`w-10 h-10 mx-auto rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="bg-white border">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-3.5 h-3.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="w-3.5 h-3.5" /> Password
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-4">
              <h2 className="text-base font-semibold mb-5">Personal Information</h2>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email — read only */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <Input value={MOCK_USER.email} disabled className="mt-1.5 bg-gray-50 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-sm text-muted-foreground">+91</span>
                            <Input {...field} maxLength={10} className="rounded-l-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={profileSaving} className="w-full gap-2">
                    {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-4">
              <h2 className="text-base font-semibold mb-5">Change Password</h2>
              <Form {...pwForm}>
                <form onSubmit={pwForm.handleSubmit(onPasswordSave)} className="space-y-4">
                  <FormField
                    control={pwForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={pwForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><Input type="password" placeholder="Min 8 characters" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={pwForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl><Input type="password" placeholder="Repeat new password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={pwSaving} className="w-full gap-2">
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Update Password
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
