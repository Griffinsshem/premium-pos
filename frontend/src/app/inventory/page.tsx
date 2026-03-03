"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_products: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "/api/products?page=1&per_page=5",
          {
            credentials: "include", // ✅ IMPORTANT FIX
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.error);
          return;
        }

        console.log("Products:", data);

        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          TruVend Inventory Management
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your products, stock levels, and pricing.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 border">
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-3 flex justify-between"
              >
                <span>{product.name}</span>
                <span>${product.price}</span>
                <span>Stock: {product.stock}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}