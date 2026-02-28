"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } =
    useCartStore();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOrder = async () => {
    if (!address.trim()) {
      toast.error("Kérlek add meg a szállítási címet!");
      return;
    }
    if (items.length === 0) {
      toast.error("A kosarad üres!");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Rendeléshez be kell jelentkezned!");
      router.push("/login");
      setLoading(false);
      return;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total(),
        shipping_address: address,
        status: "pending",
      })
      .select()
      .single();

    if (error || !order) {
      console.error("Order insert error:", error);
      toast.error(
        `Hiba a rendelés leadásakor: ${error?.message ?? "ismeretlen hiba"}`,
      );
      setLoading(false);
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      price_at_purchase: i.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      toast.error(`Hiba a rendelési tételek mentésekor: ${itemsError.message}`);
      setLoading(false);
      return;
    }

    clearCart();
    toast.success("Rendelés sikeresen leadva!");
    router.push("/orders");
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">A kosarad üres</h2>
        <p className="text-muted-foreground mb-6">
          Adj hozzá termékeket a vásárláshoz!
        </p>
        <Link href="/">
          <Button>Vissza a termékekhez</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Kosár</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <Card key={product.id}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      📦
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Number(product.price ?? 0).toLocaleString("hu-HU")} Ft / db
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-bold w-28 text-right">
                  {(Number(product.price ?? 0) * quantity).toLocaleString(
                    "hu-HU",
                  )}{" "}
                  Ft
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeItem(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Összesítő</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Összesen:</span>
                <span className="text-primary">
                  {Number(total() ?? 0).toLocaleString("hu-HU")} Ft
                </span>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Szállítási cím
                </label>
                <Input
                  placeholder="Utca, házszám, város, irányítószám"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                onClick={handleOrder}
                disabled={loading}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {loading ? "Feldolgozás..." : "Rendelés leadása"}
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-500"
                onClick={clearCart}
              >
                Kosár ürítése
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
