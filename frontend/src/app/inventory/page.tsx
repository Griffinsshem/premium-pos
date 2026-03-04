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
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(data.error);
          return;
        }

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

      <div className="bg-white shadow-md rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-6">
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6">
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="px-6 py-3 font-semibold text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && (
              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600 flex justify-between">
                <span>
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <span>
                  Total Products: {pagination.total_products}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}