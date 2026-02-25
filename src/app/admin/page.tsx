import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, ShoppingBag, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: categoryCount },
    { count: orderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: revenueData } = await supabase
    .from("orders")
    .select("total")
    .eq("status", "delivered");

  const totalRevenue =
    revenueData?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) ?? 0;

  const stats = [
    {
      label: "Termékek",
      value: productCount ?? 0,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Kategóriák",
      value: categoryCount ?? 0,
      icon: Tag,
      color: "text-green-600",
    },
    {
      label: "Rendelések",
      value: orderCount ?? 0,
      icon: ShoppingBag,
      color: "text-orange-600",
    },
    {
      label: "Bevétel (teljesített)",
      value: `${totalRevenue.toLocaleString("hu-HU")} Ft`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Áttekintés</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Legutóbbi rendelések</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm border-b pb-3 last:border-0"
                >
                  <span className="font-mono text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {Number(order.total ?? 0).toLocaleString("hu-HU")} Ft
                  </span>
                  <span className="capitalize text-muted-foreground">
                    {order.status}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("hu-HU")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Még nincsenek rendelések.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
