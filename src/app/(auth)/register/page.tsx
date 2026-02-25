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

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(
      "Sikeres regisztráció! Ellenőrizd az email-edet a megerősítéshez.",
    );
    router.push("/login");
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🛍️</div>
        <CardTitle className="text-2xl">Regisztráció</CardTitle>
        <CardDescription>Hozd létre a WebShop fiókodat</CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Teljes név</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Kovács János"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
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
            <Label htmlFor="password">Jelszó (min. 6 karakter)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Regisztráció..." : "Fiók létrehozása"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Már van fiókod?{" "}
            <Link href="/login" className="text-primary underline">
              Bejelentkezés
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
