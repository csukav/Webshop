import { createServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  pending: { label: "Függőben", variant: "secondary" },
  processing: { label: "Feldolgozás", variant: "default" },
  shipped: { label: "Kiszállítva", variant: "default" },
  delivered: { label: "Teljesítve", variant: "outline" },
  cancelled: { label: "Törölve", variant: "destructive" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(
        *,
        product:products(id, name, image_url, price)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", order.user_id)
    .single();

  const s = statusConfig[order.status] ?? {
    label: order.status,
    variant: "secondary" as const,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Vissza
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex-1">
          Rendelés #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <DeleteOrderButton orderId={order.id} redirectAfter />
      </div>

      <div className="space-y-6">
        {/* Összefoglaló */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendelés adatai</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Vásárló</p>
              <p className="font-medium">{profile?.full_name ?? "—"}</p>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Dátum</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Szállítási cím</p>
              <p className="font-medium">{order.shipping_address}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Végösszeg</p>
              <p className="text-xl font-bold">
                {Number(order.total_amount ?? 0).toLocaleString("hu-HU")} Ft
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Státusz módosítás */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Státusz</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Badge variant={s.variant as any}>{s.label}</Badge>
            <span className="text-muted-foreground text-sm">→</span>
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={order.status}
            />
          </CardContent>
        </Card>

        {/* Rendelési tételek */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tételek</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 border-b last:border-0"
              >
                {item.product?.image_url ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {item.product?.name ?? "Törölt termék"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Number(item.price_at_purchase ?? 0).toLocaleString(
                      "hu-HU",
                    )}{" "}
                    Ft × {item.quantity} db
                  </p>
                </div>
                <p className="font-semibold text-sm flex-shrink-0">
                  {(
                    Number(item.price_at_purchase ?? 0) * item.quantity
                  ).toLocaleString("hu-HU")}{" "}
                  Ft
                </p>
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <p className="text-lg font-bold">
                Összesen:{" "}
                {Number(order.total_amount ?? 0).toLocaleString("hu-HU")} Ft
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
