import Navbar from "@/components/layout/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WebShop. Minden jog fenntartva.
      </footer>
    </div>
  );
}
