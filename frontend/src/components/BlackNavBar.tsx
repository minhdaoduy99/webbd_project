"use client";

import React, { useState } from "react";

export interface NavFilter {
  category?: string; // "all" | "football" | "accessory" | "clear-stock"
  brand?: string;    // "Nike" | "Adidas" | "Puma" | "Jordan" | "New Balance" | "Mizuno" | "Kamito"
  surface?: string;  // "TF" | "FG" | "IC"
  sort?: "default" | "price-asc" | "price-desc";
  label: string;
}

interface BlackNavBarProps {
  onSelectFilter: (filter: NavFilter) => void;
}

const GUIDE_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  size: {
    title: "Bảng quy đổi chọn Size giày (39 – 42)",
    body: (
      <div className="space-y-3 text-sm text-gray-700">
        <p>Đo chiều dài bàn chân từ gót đến ngón dài nhất rồi đối chiếu bảng sau:</p>
        <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-2 border-b">Size EU</th>
              <th className="p-2 border-b">Chiều dài chân (cm)</th>
              <th className="p-2 border-b">Gợi ý form</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="p-2 font-bold">39</td><td className="p-2">24.0 – 24.5 cm</td><td className="p-2">Chân thon</td></tr>
            <tr className="border-b"><td className="p-2 font-bold">40</td><td className="p-2">24.5 – 25.0 cm</td><td className="p-2">Phổ biến</td></tr>
            <tr className="border-b"><td className="p-2 font-bold">41</td><td className="p-2">25.5 – 26.0 cm</td><td className="p-2">Bè nhẹ +0.5 size</td></tr>
            <tr><td className="p-2 font-bold">42</td><td className="p-2">26.0 – 26.5 cm</td><td className="p-2">Chân dài / bè</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
  return: {
    title: "Chính sách đổi size & bảo hành",
    body: (
      <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
        <li>Đổi size miễn phí trong vòng <strong>7 ngày</strong> kể từ khi nhận hàng (giày còn mới, chưa đá sân).</li>
        <li>Bảo hành keo, chỉ khâu miễn phí trong <strong>6 tháng</strong>.</li>
        <li>Kiểm tra hàng và thử size trước khi thanh toán.</li>
      </ul>
    ),
  },
  order: {
    title: "Hướng dẫn đặt hàng nhanh",
    body: (
      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        <li>Chọn đôi giày yêu thích ở Trang chủ hoặc lọc theo Thương hiệu / Mặt sân.</li>
        <li>Bấm vào sản phẩm, chọn đúng size <strong>39, 40, 41 hoặc 42</strong> rồi bấm <strong>Thêm vào giỏ hàng</strong>.</li>
        <li>Mở biểu tượng <strong>Giỏ hàng</strong> ở góc phải, kiểm tra số lượng và bấm <strong>Thanh toán ngay</strong>.</li>
      </ol>
    ),
  },
};

export default function BlackNavBar({ onSelectFilter }: BlackNavBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<string | null>(null);
  const [servicePhone, setServicePhone] = useState("");
  const [serviceNote, setServiceNote] = useState("");
  const [serviceDone, setServiceDone] = useState(false);

  const applyFilter = (filter: NavFilter) => {
    onSelectFilter(filter);
    setOpenMenu(null);
    document.getElementById("danh-sach-san-pham")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServiceDone(true);
    setTimeout(() => {
      setServiceDone(false);
      setServiceModal(null);
      setServicePhone("");
      setServiceNote("");
    }, 1500);
  };

  return (
    <>
      <nav
        className="bg-zinc-950 text-white border-b border-zinc-800 relative z-30"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 h-12 text-sm font-medium">
          {/* 1. SẢN PHẨM */}
          <div className="relative" onMouseEnter={() => setOpenMenu("san-pham")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "san-pham" ? null : "san-pham")}
              className="hover:text-indigo-400 transition py-3"
            >
              Sản Phẩm ▾
            </button>
            {openMenu === "san-pham" && (
              <div className="absolute left-0 top-full w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <button onClick={() => applyFilter({ category: "all", sort: "default", label: "Tất cả sản phẩm" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Tất cả sản phẩm</button>
                <button onClick={() => applyFilter({ category: "all", sort: "price-asc", label: "Giá thấp → cao" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Giá thấp → cao</button>
                <button onClick={() => applyFilter({ category: "all", sort: "price-desc", label: "Giá cao → thấp" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Giá cao → thấp</button>
              </div>
            )}
          </div>

          {/* 2. GIÀY BÓNG ĐÁ */}
          <div className="relative" onMouseEnter={() => setOpenMenu("giay-bong-da")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "giay-bong-da" ? null : "giay-bong-da")}
              className="hover:text-indigo-400 transition py-3"
            >
              Giày Bóng Đá ▾
            </button>
            {openMenu === "giay-bong-da" && (
              <div className="absolute left-0 top-full w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <button onClick={() => applyFilter({ category: "football", surface: "TF", label: "Giày Cỏ Nhân Tạo (TF)" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Cỏ nhân tạo (Đinh TF)</button>
                <button onClick={() => applyFilter({ category: "football", surface: "FG", label: "Giày Cỏ Tự Nhiên (FG)" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Cỏ tự nhiên (Đinh FG)</button>
                <button onClick={() => applyFilter({ category: "football", surface: "IC", label: "Giày Futsal (IC)" })} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Sân Futsal (Đế bằng IC)</button>
              </div>
            )}
          </div>

          {/* 3. THƯƠNG HIỆU */}
          <div className="relative" onMouseEnter={() => setOpenMenu("thuong-hieu")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "thuong-hieu" ? null : "thuong-hieu")}
              className="hover:text-indigo-400 transition py-3"
            >
              Thương Hiệu ▾
            </button>
            {openMenu === "thuong-hieu" && (
              <div className="absolute left-0 top-full w-48 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                {["Nike", "Adidas", "Puma", "Jordan", "New Balance", "Mizuno", "Kamito"].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => applyFilter({ brand, label: `Thương hiệu: ${brand}` })}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. PHỤ KIỆN */}
          <div className="relative" onMouseEnter={() => setOpenMenu("phu-kien")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "phu-kien" ? null : "phu-kien")}
              className="hover:text-indigo-400 transition py-3"
            >
              Phụ Kiện ▾
            </button>
            {openMenu === "phu-kien" && (
              <div className="absolute left-0 top-full w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                {["Găng tay thủ môn", "Tất chống trơn", "Túi đựng giày", "Bóng đá"].map((item) => (
                  <button
                    key={item}
                    onClick={() => applyFilter({ category: "accessory", label: `Phụ kiện: ${item}` })}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. DỊCH VỤ */}
          <div className="relative" onMouseEnter={() => setOpenMenu("dich-vu")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "dich-vu" ? null : "dich-vu")}
              className="hover:text-indigo-400 transition py-3"
            >
              Dịch vụ ▾
            </button>
            {openMenu === "dich-vu" && (
              <div className="absolute left-0 top-full w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                {["In tên & số lên giày", "Vệ sinh & bảo dưỡng giày", "Khâu đế & dán keo"].map((sv) => (
                  <button
                    key={sv}
                    onClick={() => {
                      setServiceModal(sv);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50"
                  >
                    {sv}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. CLEAR STOCK */}
          <button
            type="button"
            onClick={() => applyFilter({ category: "clear-stock", label: "Clear Stock - Xả kho giá tốt" })}
            className="text-rose-500 hover:text-rose-400 font-bold transition py-3"
          >
            Clear Stock
          </button>

          {/* 7. HƯỚNG DẪN */}
          <div className="relative" onMouseEnter={() => setOpenMenu("huong-dan")}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "huong-dan" ? null : "huong-dan")}
              className="hover:text-indigo-400 transition py-3"
            >
              Hướng dẫn ▾
            </button>
            {openMenu === "huong-dan" && (
              <div className="absolute right-0 top-full w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <button onClick={() => { setActiveGuide("size"); setOpenMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Hướng dẫn chọn Size (39–42)</button>
                <button onClick={() => { setActiveGuide("return"); setOpenMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Chính sách đổi trả & bảo hành</button>
                <button onClick={() => { setActiveGuide("order"); setOpenMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50">Hướng dẫn đặt hàng</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* POPUP HƯỚNG DẪN */}
      {activeGuide && GUIDE_CONTENT[activeGuide] && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative text-gray-900">
            <button onClick={() => setActiveGuide(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">✕</button>
            <h3 className="text-lg font-bold mb-4">{GUIDE_CONTENT[activeGuide].title}</h3>
            {GUIDE_CONTENT[activeGuide].body}
          </div>
        </div>
      )}

      {/* POPUP ĐĂNG KÝ DỊCH VỤ */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative text-gray-900">
            <button onClick={() => setServiceModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg">✕</button>
            <h3 className="text-lg font-bold mb-1">Đăng ký dịch vụ</h3>
            <p className="text-sm text-indigo-600 font-semibold mb-4">{serviceModal}</p>
            <form onSubmit={handleServiceSubmit} className="space-y-3">
              <input
                type="tel"
                required
                value={servicePhone}
                onChange={(e) => setServicePhone(e.target.value)}
                placeholder="Số điện thoại liên hệ..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows={3}
                value={serviceNote}
                onChange={(e) => setServiceNote(e.target.value)}
                placeholder="Ghi chú (ví dụ: tên/số muốn in, mẫu giày...)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {serviceDone && (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
                  Đã ghi nhận yêu cầu! Cửa hàng sẽ liên hệ lại sớm.
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm">
                Gửi yêu cầu dịch vụ
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}