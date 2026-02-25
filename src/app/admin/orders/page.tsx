import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

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

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(count), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Rendelések</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Azonosító</TableHead>
              <TableHead>Vásárló</TableHead>
              <TableHead>Összeg</TableHead>
              <TableHead>Tételek</TableHead>
              <TableHead>Státusz</TableHead>
              <TableHead>Dátum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order: any) => {
                const s = statusConfig[order.status] ?? {
                  label: order.status,
                  variant: "secondary",
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {order.profiles?.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Number(order.total ?? 0).toLocaleString("hu-HU")} Ft
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.order_items?.[0]?.count ?? 0} tétel
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(order.created_at).toLocaleDateString("hu-HU")}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Még nincsenek rendelések.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
