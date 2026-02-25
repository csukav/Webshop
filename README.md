# 🛍️ WebShop

Modern e-commerce webshop **Next.js 14**, **Supabase** és **shadcn/ui** alapokon.

## Funkciók

### Vevői felület

- 🏠 Termékbemutató lap kategória-szűrővel és kereséssel
- 📦 Termékrészlet oldal
- 🛒 Kosár kezelés (Zustand, localStorage-ból is fennmarad)
- 📋 Rendelés leadása szállítási cím megadásával
- 🗂️ Rendelések listája bejelentkezés után

### Admin felület (`/admin`)

- 📊 Dashboard (statisztikák, legutóbbi rendelések)
- ➕ Termékek létrehozása, szerkesztése, törlése
- 🖼️ Képfeltöltés Supabase Storage-ba
- 🏷️ Kategóriák kezelése (CRUD)
- 📦 Rendelések állapotának frissítése

### Hitelesítés

- 📧 Regisztráció email + jelszóval
- 🔐 Bejelentkezés (Supabase Auth)
- 🛡️ Admin-only felület role-alapú védelem

---

## Gyors indítás

### 1. Supabase projekt létrehozása

1. Menj a [supabase.com](https://supabase.com) oldalra és hozz létre egy új projektet.
2. A **SQL Editor**-ban futtasd le a `supabase/schema.sql` fájl tartalmát.
3. A **Storage** fülön ellenőrizd, hogy a `product-images` bucket létrejött (a schema.sql automatikusan létrehozza).

### 2. Környezeti változók beállítása

Másold le a `.env.local.example` fájlt:

```bash
cp .env.local.example .env.local
```

Töltsd ki a Supabase projekt adataival:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

Az értékeket a Supabase projektben a **Settings → API** menüpontban találod.

### 3. Függőségek telepítése és indítás

```bash
npm install
npm run dev
```

Nyisd meg a böngészőben: **http://localhost:3000**

---

## Admin hozzáférés beállítása

1. Regisztrálj a `/register` oldalon egy email-jelszó párossal.
2. A Supabase **Table Editor**-ban keresd meg a `profiles` táblát.
3. A saját profilod `role` mezőjét változtasd `admin`-ra.
4. Ezután elérhető lesz az `/admin` felület.

---

## Projekt struktúra

```
src/
├── app/
│   ├── page.tsx                        # Webshop főoldal (termékek)
│   ├── layout.tsx                      # Root layout
│   ├── (auth)/login/page.tsx           # Bejelentkezés
│   ├── (auth)/register/page.tsx        # Regisztráció
│   ├── (shop)/products/[id]/page.tsx   # Termék részlet
│   ├── (shop)/cart/page.tsx            # Kosár + rendelés
│   ├── (shop)/orders/page.tsx          # Saját rendelések
│   └── admin/                          # Admin felület
├── components/
│   ├── admin/                          # Admin komponensek
│   ├── layout/Navbar.tsx               # Navigációs sáv
│   ├── shop/                           # Termék kártyák, szűrő
│   └── ui/                             # shadcn/ui komponensek
├── lib/supabase/                       # Supabase kliensek
├── store/cartStore.ts                  # Zustand kosár
└── types/index.ts                      # TypeScript típusok
supabase/
└── schema.sql                          # Adatbázis séma + RLS + Storage
```

---

## Tech Stack

| Technológia             | Cél                      |
| ----------------------- | ------------------------ |
| Next.js 14 (App Router) | SSR keretrendszer        |
| TypeScript              | Típusbiztonság           |
| Supabase                | Adatbázis, Auth, Storage |
| Tailwind CSS            | Stílusok                 |
| shadcn/ui               | UI komponensek           |
| Zustand                 | Kosár állapot            |
| use-debounce            | Keresés optimalizálás    |

---

## Parancsok

```bash
npm run dev      # Fejlesztői szerver (http://localhost:3000)
npm run build    # Production build
npm run start    # Production szerver
npm run lint     # ESLint ellenőrzés
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
