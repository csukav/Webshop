"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error(
          "Erősítsd meg az email-edet! Ellenőrizd a beérkező leveleid.",
        );
      } else if (error.message === "Invalid login credentials") {
        toast.error("Hibás email cím vagy jelszó!");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    toast.success("Sikeres bejelentkezés!");
    router.push("/");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🛍️</div>
        <CardTitle className="text-2xl">Bejelentkezés</CardTitle>
        <CardDescription>Lépj be a WebShop fiókodba</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email cím</Label>
            <Input
              id="email"
              type="email"
              placeholder="pelda@email.hu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Jelszó</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Bejelentkezés..." : "Bejelentkezés"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Még nincs fiókod?{" "}
            <Link href="/register" className="text-primary underline">
              Regisztrálj
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
