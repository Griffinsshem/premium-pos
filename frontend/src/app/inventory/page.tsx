"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  DollarSign,
  Package,
  Calendar,
  X
} from "lucide-react";

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

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
  });

  /* =========================
     DEBOUNCE SEARCH
  ========================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================
     FETCH PRODUCTS
  ========================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        page: "1",
        per_page: "5",
        search: debouncedSearch,
      });

      const response = await fetch(`/api/products?${query.toString()}`, {
        credentials: "include",
      });

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
  }, [debouncedSearch]);

  /* =========================
     OPEN CREATE MODAL
  ========================= */
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", stock: "" });
    setIsModalOpen(true);
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setIsModalOpen(true);
  };

  /* =========================
     SUBMIT (CREATE OR UPDATE)
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      alert("All fields are required");
      return;
    }

    try {
      setCreating(true);

      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const response = await fetch(url, {
        method,
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
        alert(data.error || "Operation failed");
        return;
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", price: "", stock: "" });

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
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search products..."
          className="w-full border rounded-lg pl-10 pr-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                  <th className="px-6 py-3 text-left">Name</th>

                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} />
                      Price
                    </div>
                  </th>

                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <Package size={16} />
                      Stock
                    </div>
                  </th>

                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Created
                    </div>
                  </th>

                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium">
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

                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
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
            <h2 className="text-xl font-semibold">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

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
                min="0"
                placeholder="Price"
                className="w-full border rounded-lg px-3 py-2"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />

              <input
                type="number"
                min="0"
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
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {creating
                    ? "Processing..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}