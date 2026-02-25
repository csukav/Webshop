export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping_address: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
}

export interface Profile {
  id: string;
  email: string;
  role: "user" | "admin";
  full_name: string | null;
  created_at: string;
}
