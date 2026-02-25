"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";
import type { Category, Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("A termék neve kötelező!");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Érvényes árat adj meg!");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      stock: Number(stock) || 0,
      category_id: categoryId || null,
      image_url: imageUrl || null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) {
      toast.error("Hiba mentés közben: " + error.message);
    } else {
      toast.success(isEdit ? "Termék frissítve!" : "Termék létrehozva!");
      router.push("/admin/products");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left – main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alapadatok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Termék neve *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="pl. iPhone 15 Pro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Leírás</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Termék részletes leírása..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kép</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </CardContent>
          </Card>
        </div>

        {/* Right – price, stock, category */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ár és készlet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Ár (Ft) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Készlet (db)</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategória</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Válassz kategóriát" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Nincs kategória —</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Mégse
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Mentés..." : isEdit ? "Frissítés" : "Létrehozás"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
