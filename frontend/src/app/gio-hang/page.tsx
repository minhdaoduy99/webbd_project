"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  size: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      setCart([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const syncCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateQuantity = (id: number | string, size: number, delta: number) => {
    const updated = cart
      .map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);
    syncCart(updated);
  };

  const removeItem = (id: number | string, size: number) => {
    syncCart(cart.filter((item) => !(item.id === id && item.size === size)));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!loaded) {
    return <div className="min-h-screen bg-gray-50 p-10 text-center">Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold">🛒 Giỏ hàng của bạn</h1>
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Giỏ hàng đang trống.</p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Xem sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900">{item.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    <p className="text-rose-600 font-extrabold mt-1">
                      {item.price.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.size, -1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.size, 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs text-gray-400 hover:text-rose-600 font-medium ml-2"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Tóm tắt đơn hàng</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tổng số lượng</span>
                <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} đôi</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold border-t border-gray-100 pt-4">
                <span>Tổng tiền</span>
                <span className="text-rose-600">{totalPrice.toLocaleString("vi-VN")} ₫</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert("Đặt hàng thành công!");
                  syncCart([]);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}