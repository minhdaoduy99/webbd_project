"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import Header from "@/components/ui/Header";

// Dữ liệu mẫu 4 sản phẩm nổi bật giống giao diện của bạn
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Nike Free RN Flyknit Red",
    price: "2.450.000đ",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Puma Court Star White",
    price: "1.890.000đ",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Air Jordan 1 Low Bred Toe",
    price: "3.200.000đ",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "New Balance 247 Olive",
    price: "2.150.000đ",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
  },
];

// Dữ liệu 2 slide Banner của bạn
const BANNERS = [
  {
    tag: "WEBBD OFFICIAL STORE",
    title: "Chính Hãng 100% - Đổi Size Miễn Phí",
    desc: "Đầy đủ các size 39, 40, 41, 42 sẵn sàng giao nhanh trong 2 giờ.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
    bgGradient: "from-[#18191c] via-[#2b1019] to-[#4a1525]",
  },
  {
    tag: "WEBBD OFFICIAL STORE",
    title: "Bộ Sưu Tập Sneaker Mùa Mới 2026",
    desc: "Giảm ngay 20% cho đơn hàng đầu tiên khi đăng nhập tài khoản thành viên.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
    bgGradient: "from-[#171923] via-[#1a202c] to-[#2d3748]",
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* 1. TẦNG TRÊN CÙNG: Logo + Thanh tìm kiếm + Giỏ hàng + Đăng nhập */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo WebBD Sneaker */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">👟</span>
            <span className="text-xl font-bold text-[#4f46e5] tracking-tight">
              WebBD Sneaker
            </span>
          </Link>

          {/* Ô tìm kiếm ở giữa */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giày Nike, Adidas, Jordan..."
              className="w-full pl-5 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#4f46e5] focus:bg-white transition"
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4f46e5] hover:text-indigo-800"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Giỏ hàng & Nút Đăng nhập */}
          <div className="flex items-center gap-4">
            <Link
              href="/gio-hang"
              className="relative p-2 text-gray-600 hover:text-[#4f46e5] transition"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-0.5 right-0.5 bg-[#e11d48] text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            <Link
  href="/admin/login"
  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
>
  Đăng nhập
</Link>
          </div>
        </div>
      </div>

      {/* 2. TẦNG DƯỚI THANH TÌM KIẾM: Thanh Danh Mục Màu Đen (Header.tsx) */}
      <Header />

      {/* 3. NỘI DUNG TRANG CHỦ (Banner + Sản phẩm nổi bật) */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Banner Slider */}
        <section
          className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${BANNERS[currentSlide].bgGradient} text-white p-8 md:p-12 shadow-md transition-all duration-500`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-block bg-white/15 backdrop-blur-sm text-xs font-semibold tracking-wider px-3 py-1 rounded-full uppercase">
                {BANNERS[currentSlide].tag}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {BANNERS[currentSlide].title}
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                {BANNERS[currentSlide].desc}
              </p>

              {/* Nút chuyển slide chấm tròn */}
              <div className="flex items-center gap-2 pt-4">
                {BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx ? "w-7 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <img
                src={BANNERS[currentSlide].image}
                alt={BANNERS[currentSlide].title}
                className="w-full max-w-md h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block bg-amber-400 text-zinc-950 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded mb-2">
                  New Pack 2026
                </span>
                <h2 className="text-2xl font-black tracking-tight uppercase leading-tight">
                  Bright Lights Pack
                </h2>
                <p className="text-xs text-zinc-300 mt-1">Bứt tốc mọi mặt sân cỏ nhân tạo & tự nhiên</p>
              </div>
            </div>

            <div
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedBrand("ALL");
                setOnlyDiscount(false);
                document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="md:col-span-5 relative h-80 md:h-[430px] rounded-xl overflow-hidden group cursor-pointer border border-zinc-800"
            >
              <img
                src="https://media.soccerstore.vn/soccerstore/2026/10/Adidas-F50-Final-Rush-on-Julian-Alvares.png"
                alt="Hàng mới về"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-5 bottom-6 text-center text-white flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  SoccerStore Official
                </span>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tight mt-1">
                  Final Rush Edition
                </h1>
                <p className="text-xs text-zinc-300 mt-1.5 max-w-sm">
                  Đầy đủ các mẫu giày bóng đá chính hãng Nike, Adidas, Mizuno, Kamito, NMS
                </p>
                <span className="mt-4 inline-block bg-zinc-900/90 hover:bg-amber-400 hover:text-zinc-950 text-white border border-zinc-600 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition">
                  Hàng mới về
                </span>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-3.5 h-auto md:h-[430px]">
              <div
                onClick={() => {
                  setSelectedCategory("Giày bóng đá sân cỏ nhân tạo");
                  setOnlyDiscount(false);
                  document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="relative h-44 md:h-full rounded-xl overflow-hidden group cursor-pointer border border-zinc-800"
              >
                <img
                  src="https://media.soccerstore.vn/soccerstore/2026/10/ChatGPT-Image-Sep-26-2026-10_47_51-AM.png"
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <div className="text-sm font-extrabold uppercase">Giày Sân Cỏ Nhân Tạo</div>
                  <div className="text-[11px] text-amber-400 font-semibold">Đế TF bám sân cực tốt →</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedBrand("ALL");
                  setOnlyDiscount(true);
                  document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="relative h-44 md:h-full rounded-xl overflow-hidden group cursor-pointer border border-zinc-800"
              >
                <img
                  src="https://scontent.fhan9-1.fna.fbcdn.net/v/t39.30808-6/482977476_980979800802942_1822166685469997831_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x800&ctp=s526x395&_nc_cat=108&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=bd9a62&_nc_eui2=AeF4X9-mROFfTOFHp5OtF7Ts0k1zOn4apz_STXM6fhqnP9iea2hQyMLFEMk6hX0FVMWFO7G9LRc8FiThOa1gefoA&_nc_ohc=WlwNcGVqrYYQ7kNvwEREcIa&_nc_oc=AdriCICRnlR7grt0OIQhLv8NLqXYEAwIwD6pzOBDcncpU8inHjAppLpTCZRU4Bst7jSlBwnUv1eBk-a4JU1XNmwj&_nc_zt=23&_nc_ht=scontent.fhan9-1.fna&_nc_gid=zpkPOnXnDjZabCh_1pPJRA&_nc_ss=7b2a8&oh=00_AQTyfxYLmRt0MvhEbe6ff0YARP13_M2pqtKTwLKNADNGRQ&oe=6B04A3F7"
                  alt="Xả kho giảm giá"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-black/40 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <span className="inline-block bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                    Hot Deals
                  </span>
                  <div className="text-sm font-extrabold uppercase">Ưu Đãi Giảm Giá</div>
                  <div className="text-[11px] text-zinc-200">Xem toàn bộ sản phẩm sale →</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                title: "Nike Mercurial",
                img: "https://media.soccerstore.vn/soccerstore/2025/03/web-new-2-690x690.png",
                action: () => { setSelectedCategory("ALL"); setSelectedBrand("ALL"); setSearchTerm("MERCURIAL"); },
              },
              {
                title: "Nike Tiempo",
                img: "https://media.soccerstore.vn/soccerstore/2025/03/web-new-3-690x690.png",
                action: () => { setSelectedCategory("ALL"); setSelectedBrand("ALL"); setSearchTerm("TIEMPO"); },
              },
              {
                title: "Adidas F50",
                img: "https://media.soccerstore.vn/soccerstore/2025/03/web-new-690x690.png",
                action: () => { setSelectedCategory("ALL"); setSelectedBrand("Adidas"); setSearchTerm(""); },
              },
              {
                title: "Mizuno Morelia",
                img: "https://i.pinimg.com/474x/9e/7e/79/9e7e79b40332e7f5ba5599fc73deb5f3.jpg",
                action: () => { setSelectedCategory("ALL"); setSelectedBrand("Mizuno"); setSearchTerm(""); },
              },
              {
                title: "Giày NMS / Kamito",
                img: "https://cdn.hstatic.net/themes/1000341630/1001416770/14/logo.png?v=6988",
                action: () => { setSelectedCategory("ALL"); setSelectedBrand("NMS"); setSearchTerm(""); },
              },
              {
                title: "Găng tay thủ môn",
                img: "https://media.soccerstore.vn/soccerstore/2025/03/web-new-6-690x690.png",
                action: () => { setSelectedBrand("ALL"); setSearchTerm(""); setSelectedCategory("Găng tay thủ môn"); },
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setOnlyDiscount(false);
                  item.action();
                  document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-amber-400 transition shadow-md">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <span className="mt-2.5 text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Sản phẩm nổi bật */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Sản phẩm nổi bật
            </h2>
            <span className="text-sm text-gray-500">
              {FEATURED_PRODUCTS.length} sản phẩm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#4f46e5] transition">
                    {product.name}
                  </h3>
                  <p className="text-[#4f46e5] font-bold mt-2">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}