"use client";

import { useEffect, useState } from "react";
import { Package, Search, Plus, X } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [role, setRole] = useState<string | null>(null);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);

  // FORM STATE
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:5000/products?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);

    fetchProducts();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchProducts();
  };

  // CREATE PRODUCT
  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          sku,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create product");
        return;
      }

      // Reset form
      setName("");
      setPrice("");
      setStock("");
      setSku("");

      setShowModal(false);

      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error("Create product failed", err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Package size={28} />
            Products
          </h1>
          <p className="text-gray-500">
            Manage your inventory and stock levels
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={handleSearch}
              className="text-sm px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Search
            </button>
          </div>

          {/* ADMIN ONLY BUTTON */}
          {role === "admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Plus size={18} />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">SKU</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">KES {p.price}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4 text-gray-500">{p.sku || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Product</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Product name"
              className="w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price"
              className="w-full border rounded-lg px-3 py-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              type="number"
              placeholder="Stock"
              className="w-full border rounded-lg px-3 py-2"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />

            <input
              type="text"
              placeholder="SKU (optional)"
              className="w-full border rounded-lg px-3 py-2"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />

            <button
              onClick={handleCreateProduct}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Create Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}