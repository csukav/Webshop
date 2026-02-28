import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  pending: { label: "Függőben", variant: "secondary" },
  processing: { label: "Feldolgozás alatt", variant: "default" },
  shipped: { label: "Kiszállítva", variant: "default" },
  delivered: { label: "Teljesítve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(name, image_url, price))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Rendeléseim</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: Order & { order_items: any[] }) => {
            const s = statusLabels[order.status] ?? {
              label: order.status,
              variant: "secondary",
            };
            return (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={s.variant as any}>{s.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("hu-HU")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-3">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.product?.name ?? "Törölt termék"} ×{" "}
                          {item.quantity}
                        </span>
                        <span>
                          {(
                            Number(item.price_at_purchase || 0) * item.quantity
                          ).toLocaleString("hu-HU")}{" "}
                          Ft
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Összesen</span>
                    <span className="text-primary">
                      {Number(order.total_amount ?? 0).toLocaleString("hu-HU")}{" "}
                      Ft
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Szállítási cím: {order.shipping_address}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold mb-2">Még nincs rendelésed</h2>
          <p className="text-muted-foreground mb-6">Kezdj el vásárolni!</p>
          <Link href="/">
            <Button>Termékek böngészése</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
