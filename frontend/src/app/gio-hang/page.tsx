"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  size: number | string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccessCode, setOrderSuccessCode] = useState("");

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
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (id: number | string, size: number | string, delta: number) => {
    const updated = cart
      .map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
      .filter((item) => item.quantity > 0);
    syncCart(updated);
  };

  const removeItem = (id: number | string, size: number | string) => {
    syncCart(cart.filter((item) => !(item.id === id && item.size === size)));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          shippingAddress,
          paymentMethod: "COD",
          items: cart,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try { data = rawText ? JSON.parse(rawText) : {}; } catch {}
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Lỗi máy chủ (${res.status}): ${rawText.slice(0, 120) || "Không có phản hồi"}`);
      }

      setOrderSuccessCode(data.orderCode || `#${data.id}`);
      syncCart([]);
    } catch (err: any) {
      setErrorMsg(err?.message || "Không kết nối được với máy chủ Backend.");
    } finally {
      setSubmitting(false);
    }
  };

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

        {orderSuccessCode && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900">
            <h2 className="text-lg font-extrabold text-emerald-800">
              🎉 Đặt hàng thành công! Mã đơn: {orderSuccessCode}
            </h2>
            <p className="text-sm mt-1">
              Đơn hàng đã được lưu vào hệ thống MySQL và gửi về trang Quản trị (Admin) để xử lý giao hàng.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
              >
                Về Trang chủ
              </Link>
              <Link
                href="/admin/orders"
                className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-sm font-semibold hover:bg-emerald-100"
              >
                Xem đơn bên Trang Quản Trị →
              </Link>
            </div>
          </div>
        )}

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
                    className="w-20 h-20 rounded-xl object-contain p-2 bg-white border border-gray-100"
                  />
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900">{item.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    <p className="text-rose-600 font-extrabold mt-1">
                      {item.price.toLocaleString("vi-VN")} đ
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

            <form
              onSubmit={handleCheckout}
              className="bg-white rounded-2xl border border-gray-200 p-6 h-fit shadow-sm space-y-4"
            >
              <h3 className="text-lg font-bold">Thông tin giao hàng</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Địa chỉ nhận hàng *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tổng số lượng</span>
                  <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} sản phẩm</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Thanh toán</span>
                  <span className="font-medium text-gray-800">Tiền mặt (COD)</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-1">
                  <span>Tổng tiền</span>
                  <span className="text-rose-600">{totalPrice.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition cursor-pointer"
              >
                {submitting ? "Đang gửi đơn hàng..." : "Xác nhận đặt hàng"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
