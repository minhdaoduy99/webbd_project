"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Item {
  id: number | string;
  name: string;
  brand: string;
  category: "giay-bong-da" | "phu-kien" | "sneaker";
  surface?: "TF" | "FG" | "IC";
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
}

const CATALOG: Item[] = [
  {
    id: 1,
    name: "Nike Mercurial Vapor 15 Pro TF",
    brand: "Nike",
    category: "giay-bong-da",
    surface: "TF",
    price: 2450000,
    oldPrice: 2950000,
    discount: 17,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  },
  {
    id: 2,
    name: "Adidas F50 Elite FG",
    brand: "Adidas",
    category: "giay-bong-da",
    surface: "FG",
    price: 3400000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  },
  {
    id: 3,
    name: "Puma Future 7 Match TF",
    brand: "Puma",
    category: "giay-bong-da",
    surface: "TF",
    price: 1890000,
    oldPrice: 2400000,
    discount: 21,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
  },
  {
    id: 4,
    name: "Mizuno Morelia Neo IV Pro IC",
    brand: "Mizuno",
    category: "giay-bong-da",
    surface: "IC",
    price: 2650000,
    oldPrice: 3100000,
    discount: 15,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  },
  {
    id: 5,
    name: "Kamito TA11 Cỏ Nhân Tạo TF",
    brand: "Kamito",
    category: "giay-bong-da",
    surface: "TF",
    price: 690000,
    oldPrice: 890000,
    discount: 22,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80",
  },
  {
    id: 101,
    name: "Găng Tay Thủ Môn Predator Pro",
    brand: "Adidas",
    category: "phu-kien",
    price: 850000,
    oldPrice: 1050000,
    discount: 19,
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&q=80",
  },
  {
    id: 102,
    name: "Tất Chống Trơn Cao Cấp WebBD",
    brand: "WebBD",
    category: "phu-kien",
    price: 95000,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",
  },
  {
    id: 103,
    name: "Túi Đựng Giày 2 Ngăn Chống Nước",
    brand: "Nike",
    category: "phu-kien",
    price: 290000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  },
];

const PAGE_TITLES: Record<string, string> = {
  "san-pham": "Tất Cả Sản Phẩm",
  "giay-bong-da": "Giày Bóng Đá Chính Hãng",
  "thuong-hieu": "Thương Hiệu Nổi Bật",
  "phu-kien": "Phụ Kiện Bóng Đá",
  "clear-stock": "Clear Stock – Xả Kho Giá Sốc",
  "dich-vu": "Dịch Vụ Chăm Sóc & In Giày",
  "huong-dan": "Hướng Dẫn Chọn Size & Mua Hàng",
};

function DynamicCategoryContent() {
  const params = useParams();
  const slugs = Array.isArray(params?.slug) ? params.slug : [params?.slug || ""];
  const mainSlug = (slugs[0] || "").toLowerCase();
  const subSlug = (slugs[1] || "").toLowerCase();

  const [items, setItems] = useState<Item[]>(CATALOG);
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedSurface, setSelectedSurface] = useState<string>("ALL");
  const [serviceForm, setServiceForm] = useState({ name: "", phone: "", service: "In tên & số lên giày", note: "" });
  const [serviceSent, setServiceSent] = useState(false);

  // Tự chọn bộ lọc nếu đường dẫn có slug con (ví dụ /thuong-hieu/nike)
  useEffect(() => {
    if (subSlug) {
      const matchedBrand = ["nike", "adidas", "puma", "mizuno", "kamito"].find((b) => subSlug.includes(b));
      if (matchedBrand) setSelectedBrand(matchedBrand);
      if (subSlug.includes("tf")) setSelectedSurface("TF");
      if (subSlug.includes("fg")) setSelectedSurface("FG");
      if (subSlug.includes("ic")) setSelectedSurface("IC");
    }
  }, [subSlug]);

  // Lấy thêm dữ liệu thật từ Backend cổng 8080 nếu đang bật
  useEffect(() => {
    async function loadApi() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/products");
        if (!res.ok) return;
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw.data || raw.content || [];
        if (list.length > 0) {
          const mapped: Item[] = list.map((p: Record<string, unknown>, i: number) => {
            const price = Number(p.salePrice ?? p.price ?? p.gia ?? 2000000);
            const oldPrice = p.salePrice && p.price ? Number(p.price) : undefined;
            const discount = Number(p.discountPercent ?? p.discount_percent ?? 0) || undefined;
            return {
              id: (p.id as number | string) ?? i + 1,
              name: String(p.name || p.tenSanPham || `Giày #${i + 1}`),
              brand: String(p.brand || p.thuongHieu || "Nike"),
              category: "giay-bong-da",
              surface: (p.surface as "TF" | "FG" | "IC") || "TF",
              price,
              oldPrice,
              discount,
              image: String(
                p.image || p.imageUrl || p.hinhAnh || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
              ),
            };
          });
          setItems([...mapped, ...CATALOG.filter((c) => c.category === "phu-kien")]);
        }
      } catch {
        // Dùng CATALOG mẫu khi Backend chưa bật
      }
    }
    loadApi();
  }, []);

  const title = PAGE_TITLES[mainSlug] || `Danh mục: ${slugs.join(" / ")}`;

  // 1. TRANG DỊCH VỤ
  if (mainSlug.includes("dich-vu")) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">← Quay lại Trang chủ</Link>
          <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="font-bold text-indigo-900">In tên & số giày</p>
              <p className="text-gray-600 mt-1">In ép nhiệt bền màu, lấy ngay trong 15 phút (50.000 ₫).</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="font-bold text-emerald-900">Vệ sinh & khử mùi</p>
              <p className="text-gray-600 mt-1">Làm sạch sâu không bong keo (80.000 ₫).</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="font-bold text-amber-900">Khâu đế & dán keo</p>
              <p className="text-gray-600 mt-1">Khâu full đế chắc chắn, bảo hành 6 tháng (100.000 ₫).</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setServiceSent(true);
            }}
            className="space-y-4 pt-4 border-t border-gray-100"
          >
            <h2 className="text-lg font-bold">Đặt lịch dịch vụ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Họ và tên"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                required
                value={serviceForm.phone}
                onChange={(e) => setServiceForm({ ...serviceForm, phone: e.target.value })}
                placeholder="Số điện thoại"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <select
              value={serviceForm.service}
              onChange={(e) => setServiceForm({ ...serviceForm, service: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            >
              <option>In tên & số lên giày</option>
              <option>Vệ sinh & bảo dưỡng giày</option>
              <option>Khâu đế & dán keo</option>
            </select>
            <textarea
              rows={3}
              value={serviceForm.note}
              onChange={(e) => setServiceForm({ ...serviceForm, note: e.target.value })}
              placeholder="Ghi chú (tên/số muốn in, thời gian ghé shop...)"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
            {serviceSent && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">
                Đã gửi yêu cầu dịch vụ thành công! Shop sẽ gọi xác nhận sớm.
              </div>
            )}
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm">
              Gửi yêu cầu
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. TRANG HƯỚNG DẪN
  if (mainSlug.includes("huong-dan")) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
          <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">← Quay lại Trang chủ</Link>
          <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>

          <div>
            <h2 className="text-lg font-bold mb-3">1. Bảng quy đổi Size giày chuẩn (39 – 42)</h2>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left border-b">Size EU</th>
                  <th className="p-3 text-left border-b">Chiều dài bàn chân</th>
                  <th className="p-3 text-left border-b">Phù hợp</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-3 font-bold">39</td><td className="p-3">24.0 – 24.5 cm</td><td className="p-3">Chân thon</td></tr>
                <tr className="border-b"><td className="p-3 font-bold">40</td><td className="p-3">24.5 – 25.0 cm</td><td className="p-3">Form tiêu chuẩn</td></tr>
                <tr className="border-b"><td className="p-3 font-bold">41</td><td className="p-3">25.5 – 26.0 cm</td><td className="p-3">Chân bè nhẹ</td></tr>
                <tr><td className="p-3 font-bold">42</td><td className="p-3">26.0 – 26.5 cm</td><td className="p-3">Chân dài / bè</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-2">2. Chính sách đổi size & bảo hành</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>Hỗ trợ đổi size miễn phí trong <strong>7 ngày</strong> nếu giày chưa qua sử dụng trên sân.</li>
              <li>Bảo hành keo và chỉ khâu <strong>6 tháng</strong> toàn quốc.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 3. CÁC TRANG DANH MỤC SẢN PHẨM (giay-bong-da, san-pham, thuong-hieu, phu-kien, clear-stock)
  const filtered = items.filter((item) => {
    if (mainSlug === "phu-kien" && item.category !== "phu-kien") return false;
    if (mainSlug === "giay-bong-da" && item.category !== "giay-bong-da") return false;
    if (mainSlug === "clear-stock" && !item.discount) return false;
    if (selectedBrand !== "ALL" && item.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (selectedSurface !== "ALL" && item.surface !== selectedSurface) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/" className="text-sm font-semibold text-indigo-600 hover:underline">
              ← Quay lại Trang chủ
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2">{title}</h1>
          </div>
          <Link href="/gio-hang" className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:border-indigo-500">
            🛒 Giỏ hàng
          </Link>
        </div>

        {/* Bộ lọc nhanh */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "Nike", "Adidas", "Puma", "Mizuno", "Kamito"].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                selectedBrand.toLowerCase() === brand.toLowerCase()
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-500"
              }`}
            >
              {brand === "ALL" ? "Tất cả hãng" : brand}
            </button>
          ))}

          {mainSlug === "giay-bong-da" &&
            ["ALL", "TF", "FG", "IC"].map((sf) => (
              <button
                key={sf}
                onClick={() => setSelectedSurface(sf)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selectedSurface === sf
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-zinc-900"
                }`}
              >
                {sf === "ALL" ? "Mọi mặt sân" : `Đinh ${sf}`}
              </button>
            ))}
        </div>

        {/* Danh sách sản phẩm */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
            Không có sản phẩm phù hợp bộ lọc này.{" "}
            <button
              onClick={() => {
                setSelectedBrand("ALL");
                setSelectedSurface("ALL");
              }}
              className="text-indigo-600 font-semibold underline ml-1"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <Link href={`/san-pham/${item.id}`} className="relative block h-56 bg-gray-100 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                  {item.discount && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      -{item.discount}%
                    </span>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase text-indigo-600">
                      {item.brand} {item.surface ? `• ${item.surface}` : ""}
                    </span>
                    <Link href={`/san-pham/${item.id}`}>
                      <h3 className="font-bold text-gray-900 mt-1 hover:text-indigo-600">{item.name}</h3>
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-rose-600">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </span>
                      {item.oldPrice && (
                        <span className="block text-xs text-gray-400 line-through">
                          {item.oldPrice.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/san-pham/${item.id}`}
                      className="text-xs font-semibold bg-gray-900 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynamicCategoryPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải danh mục...</div>}>
      <DynamicCategoryContent />
    </Suspense>
  );
}
