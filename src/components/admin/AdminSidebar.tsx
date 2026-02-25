"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/admin", label: "Áttekintés", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Termékek", icon: Package, exact: false },
  { href: "/admin/categories", label: "Kategóriák", icon: Tag, exact: false },
  {
    href: "/admin/orders",
    label: "Rendelések",
    icon: ShoppingBag,
    exact: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Kijelentkezve");
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin" className="font-bold text-xl">
          🛍️ Admin Panel
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Webshop megtekintése
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}
