"use client";

import { Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const TAX_RATE = 0.16;

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function POSPage() {
  const [search, setSearch] = useState("");

  // REAL PRODUCTS STATE
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Discount state
  const [discount, setDiscount] = useState(0);

  // FETCH PRODUCTS FROM BACKEND
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  //  FILTER PRODUCTS
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Increase quantity
  const increaseQty = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // Decrease quantity
  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  // Cart calculation
  const calculateCartTotals = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.price * item.qty,
      0
    );

    const tax = subtotal * TAX_RATE;

    const total = subtotal + tax - discount;

    return {
      subtotal,
      tax,
      total,
    };
  };

  const totals = calculateCartTotals();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-bold">TruVend Terminal</h1>

        <div className="text-sm text-gray-500">
          Live POS System
        </div>
      </div>

      {/* POS Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        {/* Product Panel */}
        <div className="md:col-span-2 border-r p-6 flex flex-col">
          {/* Search */}
          <div className="relative mb-6">
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

          {/* Product List */}
          <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
            {loadingProducts ? (
              <p className="text-sm text-gray-500">
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-500">
                No products found
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center bg-white border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      KES {product.price}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-semibold">Cart</h2>
          </div>

          {/* Cart Items */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50 space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-500">
                Cart is empty
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white border rounded-md px-3 py-2"
                >
                  <span className="font-medium">{item.name}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="w-6 text-center">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KES {totals.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax (16%)</span>
              <span>KES {totals.tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Discount</span>

              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-right"
              />
            </div>

            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span>KES {totals.total.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={clearCart}
                className="w-1/2 border py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Clear
              </button>

              <button className="w-1/2 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition">
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}