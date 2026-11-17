"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  brand?: string;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Nike Air Force 1 '07 Trắng Cổ Điển",
    price: 2950000,
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: 2,
    name: "Adidas Ultraboost Light Running",
    price: 3400000,
    brand: "Adidas",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  },
  {
    id: 3,
    name: "Jordan 1 Retro High OG Chicago",
    price: 4850000,
    brand: "Jordan",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
  },
  {
    id: 4,
    name: "New Balance 550 White Green",
    price: 3100000,
    brand: "New Balance",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  },
];

const BANNERS = [
  {
    id: 1,
    title: "Bộ Sưu Tập Sneaker Mùa Mới 2026",
    subtitle: "Giảm ngay 20% cho đơn hàng đầu tiên khi đăng nhập tài khoản thành viên.",
    bg: "from-slate-900 via-indigo-950 to-slate-900",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80",
  },
  {
    id: 2,
    title: "Chính Hãng 100% - Đổi Size Miễn Phí",
    subtitle: "Đầy đủ các size 39, 40, 41, 42 sẵn sàng giao nhanh trong 2 giờ.",
    bg: "from-zinc-900 via-rose-950 to-zinc-900",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount] = useState(2);

  // State cho Nhiệm vụ 4: Đăng nhập & lưu JWT vào localStorage
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // Kiểm tra token đã lưu trong localStorage khi mở trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setSavedToken(token);
  }, []);

  // Tự động chuyển slide Banner mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Gọi API danh sách sản phẩm của Bạn 2
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/products");
        if (!res.ok) return;
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw.data || raw.content || [];
        if (list.length > 0) {
          const mapped: Product[] = list.map((item: Record<string, unknown>, idx: number) => ({
            id: (item.id as number | string) ?? idx + 1,
            name: (item.name || item.tenSanPham || item.title || `Giày Sneaker #${idx + 1}`) as string,
            price: Number(item.price ?? item.gia ?? 2500000),
            brand: (item.brand || item.thuongHieu || "Sneaker") as string,
            image:
              (item.image ||
                item.imageUrl ||
                item.hinhAnh ||
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80") as string,
          }));
          setProducts(mapped);
        }
      } catch {
        // Giữ nguyên danh sách mẫu nếu API Bạn 2 chưa bật
      }
    }
    fetchProducts();
  }, []);

  // Xử lý Nhiệm vụ 4: Gọi POST /api/v1/auth/login của Leader
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameOrEmail,
          email: usernameOrEmail,
          password: password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Sai tài khoản hoặc mật khẩu!");
      }

      // Lấy chuỗi JWT từ các trường phổ biến hoặc chuỗi trực tiếp
      const token =
        typeof data === "string"
          ? data
          : data.token || data.accessToken || data.jwt || data.data?.token;

      if (!token) {
        throw new Error("Đăng nhập thành công nhưng không tìm thấy trường token trong phản hồi!");
      }

      localStorage.setItem("token", token);
      setSavedToken(token);
      setLoginMessage({ type: "success", text: "Đăng nhập thành công! Đã lưu JWT vào localStorage." });
      setTimeout(() => {
        setShowLoginModal(false);
        setLoginMessage(null);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kết nối tới Server cổng 8080";
      setLoginMessage({ type: "error", text: message });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSavedToken(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight text-indigo-600">
            <span>👟</span>
            <span>WebBD Sneaker</span>
          </Link>

          {/* Ô tìm kiếm */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm giày Nike, Adidas, Jordan..."
                className="w-full rounded-full border border-gray-300 bg-gray-100 py-2 pl-4 pr-10 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Giỏ hàng & Nút Đăng nhập */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
              title="Giỏ hàng"
            >
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {savedToken ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                  Đã đăng nhập (JWT)
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-rose-600 font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BANNER TRƯỢT (SLIDER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${BANNERS[currentBanner].bg} text-white shadow-lg`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 items-center p-8 md:p-12 gap-8 min-h-[320px]">
            <div className="space-y-4 z-10">
              <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                WebBD Official Store
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                {BANNERS[currentBanner].title}
              </h1>
              <p className="text-gray-200 text-sm md:text-base">
                {BANNERS[currentBanner].subtitle}
              </p>
              <div className="pt-2 flex gap-2">
                {BANNERS.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrentBanner(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentBanner === idx ? "w-8 bg-white" : "w-2.5 bg-white/40"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={BANNERS[currentBanner].image}
                alt={BANNERS[currentBanner].title}
                className="h-56 md:h-64 w-full max-w-md object-cover rounded-xl shadow-2xl transform hover:scale-105 transition duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH THẺ SẢN PHẨM (CARD) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
          <span className="text-sm text-gray-500">{filteredProducts.length} sản phẩm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
            >
              <Link href={`/san-pham/${product.id}`} className="block overflow-hidden bg-gray-100 h-56">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </Link>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-indigo-600">
                    {product.brand || "Sneaker"}
                  </span>
                  <Link href={`/san-pham/${product.id}`}>
                    <h3 className="font-bold text-gray-900 mt-1 line-clamp-2 hover:text-indigo-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-rose-600">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </span>
                  <Link
                    href={`/san-pham/${product.id}`}
                    className="text-xs font-semibold bg-gray-900 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL ĐĂNG NHẬP (NHIỆM VỤ 4) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Đăng nhập tài khoản</h3>
            <p className="text-xs text-gray-500 mb-4">
              Kết nối trực tiếp tới API <code className="bg-gray-100 px-1 rounded">POST /api/v1/auth/login</code>
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên đăng nhập hoặc Email
                </label>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Nhập username hoặc email..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {loginMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    loginMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {loginMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition text-sm"
              >
                {loginLoading ? "Đang xác thực..." : "Đăng nhập ngay"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}