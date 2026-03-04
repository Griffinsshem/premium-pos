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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
  });

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/products?page=1&per_page=5",
        { credentials: "include" }
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

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     CREATE PRODUCT
  ========================= */
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      alert("All fields are required");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create product");
        return;
      }

      // Reset form
      setFormData({ name: "", price: "", stock: "" });
      setIsModalOpen(false);

      // Refresh list
      await fetchProducts();
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            TruVend Inventory Management
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your products, stock levels, and pricing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">Add New Product</h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                type="number"
                step="0.01"
                placeholder="Price"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}