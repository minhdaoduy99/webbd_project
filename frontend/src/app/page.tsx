"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

export interface Product {
  id: number | string;
  name: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  image: string;
  brand?: string;
  category?: string;
  availableSizes?: string[];
  totalStock?: number;
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
  const [categories, setCategories] = useState<{ id: number; name: string; children?: { id: number; name: string }[] }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState("ALL");
  const [selectedSize, setSelectedSize] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartCount, setCartCount] = useState<number>(0);
  useEffect(() => {
    const syncCart = () => {
      try {
        const raw = localStorage.getItem("cart");
        const arr = raw ? JSON.parse(raw) : [];
        const total = Array.isArray(arr)
          ? arr.reduce((s: number, i: any) => s + (i.quantity || 1), 0)
          : 0;
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };
    syncCart();
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  // State cho Nhiệm vụ 4: Đăng nhập & lưu JWT vào localStorage
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

  // Kiểm tra token đã lưu trong localStorage khi mở trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles") || "";
    if (token) setSavedToken(token);
    if (roles.includes("ROLE_ADMIN")) setIsAdmin(true);
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) setLoggedInEmail(savedEmail);
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
        const res = await fetch(apiUrl("/api/v1/public/products"));
        if (!res.ok) return;
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw.data || raw.content || [];
        if (list.length > 0) {
          const mapped: Product[] = list.map((item: Record<string, unknown>, idx: number) => ({
          id: (item.id as number | string) ?? idx + 1,
          name: (item.name || `Sản phẩm #${idx + 1}`) as string,
          price: Number(item.basePrice ?? item.price ?? 0),
          salePrice: Number(item.salePrice ?? item.basePrice ?? item.price ?? 0),
          discountPercent: Number(item.discountPercent ?? 0),
          brand: (item.brandName || item.brand || "SoccerStore") as string,
          category: (item.categoryName || "") as string,
          availableSizes: Array.isArray(item.availableSizes) ? (item.availableSizes as string[]) : [],
          totalStock: item.totalStock !== undefined && item.totalStock !== null ? Number(item.totalStock) : undefined,
          image:
            (item.thumbnailUrl ||
              item.image ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80") as string,
        }));
          setProducts(mapped);
        }
      } catch {
        // Giữ nguyên danh sách mẫu nếu API Bạn 2 chưa bật
      }
    }
    fetchProducts();
    fetch(apiUrl("/api/v1/public/categories"))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch(apiUrl("/api/v1/public/brands"))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setBrands(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Xử lý Nhiệm vụ 4: Gọi POST /api/v1/auth/login của Leader
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);

    try {
      const response = await fetch(apiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usernameOrEmail.trim(),
          password,
        }),
      });

      const rawText = await response.text();
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText };
      }

      if (!response.ok) {
        throw new Error((data.message as string) || "Email hoặc mật khẩu không chính xác!");
      }

      const token =
        typeof data === "string"
          ? data
          : ((data.token || data.accessToken || data.jwt) as string);

      if (!token) {
        throw new Error("Không nhận được phiên đăng nhập từ máy chủ.");
      }

      const emailVal = (data.email as string) || usernameOrEmail.trim();
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", emailVal);
      setSavedToken(token);
      setLoggedInEmail(emailVal);

      const roles = Array.isArray(data.roles) ? (data.roles as string[]) : [];
      localStorage.setItem("roles", JSON.stringify(roles));
      const adminFlag = roles.includes("ROLE_ADMIN");
      setIsAdmin(adminFlag);

      setLoginMessage({
        type: "success",
        text: adminFlag
          ? "Đăng nhập thành công với quyền Quản trị viên!"
          : "Đăng nhập thành công! Chào mừng bạn quay lại SoccerStore.",
      });
      setTimeout(() => {
        setShowLoginModal(false);
        setLoginMessage(null);
      }, 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kết nối tới máy chủ.";
      setLoginMessage({ type: "error", text: message });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);

    try {
      const response = await fetch(apiUrl("/api/v1/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          email: usernameOrEmail.trim(),
          phone: regPhone.trim(),
          address: regAddress.trim(),
          password,
        }),
      });

      const rawText = await response.text();
      let msg = rawText;
      try {
        const parsed = JSON.parse(rawText);
        msg = parsed.message || rawText;
      } catch {
        // giữ nguyên rawText
      }

      if (!response.ok) {
        throw new Error(msg || "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.");
      }

      setLoginMessage({
        type: "success",
        text: "Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.",
      });
      setPassword("");
      setTimeout(() => {
        setAuthMode("LOGIN");
        setLoginMessage(null);
      }, 1100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kết nối tới máy chủ.";
      setLoginMessage({ type: "error", text: message });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    setSavedToken(null);
    setIsAdmin(false);
    setLoggedInEmail(null);
    localStorage.removeItem("userEmail");
  };

  const filteredProducts = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = selectedBrand === "ALL" || p.brand === selectedBrand;
    const matchDiscount = !onlyDiscount || (p.discountPercent ?? 0) > 0;
    let matchCat = selectedCategory === "ALL" || p.category === selectedCategory;
    if (!matchCat) {
      const parentCat = categories.find((c) => c.name === selectedCategory);
      if (parentCat && parentCat.children) {
        matchCat = parentCat.children.some((sub) => sub.name === p.category);
      }
    }

    const effectivePrice = p.salePrice ?? p.price;
    let matchPrice = true;
    if (selectedPriceRange === "UNDER_1M") matchPrice = effectivePrice < 1000000;
    else if (selectedPriceRange === "1M_2M") matchPrice = effectivePrice >= 1000000 && effectivePrice <= 2000000;
    else if (selectedPriceRange === "2M_4M") matchPrice = effectivePrice > 2000000 && effectivePrice <= 4000000;
    else if (selectedPriceRange === "OVER_4M") matchPrice = effectivePrice > 4000000;

    const matchSize =
      selectedSize === "ALL" || (Array.isArray(p.availableSizes) && p.availableSizes.includes(selectedSize));

    return matchName && matchCat && matchBrand && matchDiscount && matchPrice && matchSize;
  });

  const allSizes = Array.from(
    new Set(products.flatMap((p) => p.availableSizes ?? []))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 shadow-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight text-indigo-400">
            <span>👟</span>
            <span>SoccerStore</span>
          </Link>

          {/* Ô tìm kiếm */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm giày bóng đá Nike, Adidas, Mizuno..."
                className="w-full rounded-full border border-slate-700 bg-slate-800 py-2 pl-4 pr-10 text-sm focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Giỏ hàng & Nút Đăng nhập */}
          <div className="flex items-center gap-4">
            <Link href="/gio-hang"
              type="button"
              className="relative p-2 rounded-full hover:bg-slate-800 transition"
              title="Giỏ hàng"
            >
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {savedToken ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="text-xs bg-indigo-600 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold transition"
                  >
                    Trang quản trị
                  </Link>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                    Đã đăng nhập
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-400 hover:text-rose-600 font-medium"
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

      {/* THANH MENU DANH MỤC & THƯƠNG HIỆU KIỂU SOCCERSTORE */}
      <nav
        className="bg-zinc-900 text-zinc-100 border-b border-zinc-800 sticky top-16 z-30 shadow-md"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-1 sm:gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedBrand("ALL");
              setOnlyDiscount(false);
              setOpenMenu(null);
            }}
            className={`py-3 px-2 cursor-pointer transition-colors ${
              selectedCategory === "ALL" && selectedBrand === "ALL" && !onlyDiscount
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-zinc-200 hover:text-amber-400"
            }`}
          >
            Tất Cả Sản Phẩm
          </button>

          {categories.map((cat) => {
            const isCatActive =
              selectedCategory === cat.name ||
              (cat.children ?? []).some((sub) => sub.name === selectedCategory);
            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setOpenMenu(`cat-${cat.id}`)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setOpenMenu(openMenu === `cat-${cat.id}` ? null : `cat-${cat.id}`);
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`py-3 px-2 flex items-center gap-1 cursor-pointer transition-colors ${
                    isCatActive
                      ? "text-amber-400 border-b-2 border-amber-400"
                      : "text-zinc-200 hover:text-amber-400"
                  }`}
                >
                  <span>{cat.name}</span>
                  {(cat.children ?? []).length > 0 && <span className="text-xs">▾</span>}
                </button>

                {openMenu === `cat-${cat.id}` && (cat.children ?? []).length > 0 && (
                  <div className="absolute left-0 top-full w-64 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-b-lg py-1.5 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setOpenMenu(null);
                        document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-amber-400 flex items-center justify-between cursor-pointer border-b border-zinc-800"
                    >
                      <span>Tất cả {cat.name.toLowerCase()}</span>
                      <span className="text-zinc-500 text-xs">›</span>
                    </button>
                    {(cat.children ?? []).map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(sub.name);
                          setOpenMenu(null);
                          document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 hover:text-amber-400 flex items-center justify-between cursor-pointer ${
                          selectedCategory === sub.name ? "text-amber-400 bg-zinc-800/60" : "text-zinc-200"
                        }`}
                      >
                        <span>{sub.name}</span>
                        <span className="text-zinc-500 text-xs">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Menu Thương Hiệu thả xuống */}
          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("brands")}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "brands" ? null : "brands")}
              className={`py-3 px-2 flex items-center gap-1 cursor-pointer transition-colors ${
                selectedBrand !== "ALL"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-zinc-200 hover:text-amber-400"
              }`}
            >
              <span>{selectedBrand === "ALL" ? "Thương Hiệu" : `Hãng: ${selectedBrand}`}</span>
              <span className="text-xs">▾</span>
            </button>

            {openMenu === "brands" && (
              <div className="absolute left-0 top-full w-56 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-b-lg py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrand("ALL");
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-amber-400 cursor-pointer border-b border-zinc-800"
                >
                  Tất cả thương hiệu
                </button>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(b.name);
                      setOpenMenu(null);
                      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 hover:text-amber-400 flex items-center justify-between cursor-pointer ${
                      selectedBrand === b.name ? "text-amber-400 bg-zinc-800/60" : "text-zinc-200"
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-zinc-500 text-xs">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOnlyDiscount(!onlyDiscount);
              setOpenMenu(null);
              document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`py-3 px-2 cursor-pointer transition-colors ${
              onlyDiscount ? "text-rose-400 border-b-2 border-rose-400 font-bold" : "text-rose-400 hover:text-rose-300"
            }`}
          >
            Sale / Giảm Giá
          </button>
        </div>
      </nav>

      {/* BANNER TRƯỢT (SLIDER) */}
      {/* HERO BANNER LƯỚI 3 CỘT KIỂU SOCCERSTORE.VN */}
      <section className="bg-zinc-950 pt-4 pb-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedBrand("Nike");
                setOnlyDiscount(false);
                document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="md:col-span-4 relative h-72 md:h-[430px] rounded-xl overflow-hidden group cursor-pointer border border-zinc-800"
            >
              <img
                src="https://media.soccerstore.vn/soccerstore/2026/10/ChatGPT-Image-Oct-9-2026-10_58_40-AM.png"
                alt="Bright Lights Pack"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
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
        </div>
      </section>

      {/* DANH SÁCH THẺ SẢN PHẨM & BỘ LỌC (LAYOUT 2 CỘT) */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(() => {
          const sortedProducts = [...filteredProducts].sort((a, b) => {
            const priceA = a.salePrice ?? a.price;
            const priceB = b.salePrice ?? b.price;
            if (sortBy === "PRICE_ASC") return priceA - priceB;
            if (sortBy === "PRICE_DESC") return priceB - priceA;
            if (sortBy === "DISCOUNT") return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
            return 0;
          });

          const hasActiveFilters =
            selectedCategory !== "ALL" ||
            selectedBrand !== "ALL" ||
            selectedPriceRange !== "ALL" ||
            selectedSize !== "ALL" ||
            onlyDiscount ||
            searchTerm.trim() !== "";

          const popularLines = [
            { label: "Nike Mercurial", query: "Mercurial" },
            { label: "Nike Tiempo", query: "Tiempo" },
            { label: "Nike Phantom", query: "Phantom" },
            { label: "Adidas F50", query: "F50" },
            { label: "Mizuno Morelia", query: "Morelia" },
            { label: "Kamito / NMS", query: "NMS" },
          ];

          const latestProducts = products.slice(0, 4);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI: SIDEBAR DANH MỤC & SẢN PHẨM MỚI NHẤT */}
              <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-20">
                {/* Khối Danh mục */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5 bg-indigo-600 text-white font-bold text-sm tracking-wide flex items-center justify-between">
                    <span>DANH MỤC SẢN PHẨM</span>
                    <span className="text-xs font-normal text-gray-300">{products.length} SP</span>
                  </div>
                  <ul className="divide-y divide-gray-100 text-sm">
                    <li>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("ALL")}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition cursor-pointer ${
                          selectedCategory === "ALL"
                            ? "bg-indigo-50 text-indigo-400 font-bold"
                            : "text-slate-300 hover:bg-[#0B1120]"
                        }`}
                      >
                        <span>Tất cả sản phẩm</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {products.length}
                        </span>
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id} className="bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`w-full text-left px-4 py-2.5 font-medium flex items-center justify-between transition cursor-pointer ${
                            selectedCategory === cat.name
                              ? "bg-indigo-50 text-indigo-400 font-bold"
                              : "text-slate-200 hover:bg-[#0B1120]"
                          }`}
                        >
                          <span>{cat.name}</span>
                        </button>
                        {cat.children && cat.children.length > 0 && (
                          <ul className="bg-[#0B1120]/70 border-t border-slate-800 py-1">
                            {cat.children.map((sub) => (
                              <li key={sub.id}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategory(sub.name)}
                                  className={`w-full text-left pl-7 pr-4 py-1.5 text-xs flex items-center gap-2 transition cursor-pointer ${
                                    selectedCategory === sub.name
                                      ? "text-indigo-400 font-bold"
                                      : "text-slate-400 hover:text-indigo-400"
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                  <span>{sub.name}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Khối Dòng giày phổ biến */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-3">
                    Dòng giày & Phụ kiện hot
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {popularLines.map((item) => {
                      const active = searchTerm.toLowerCase() === item.query.toLowerCase();
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setSearchTerm(active ? "" : item.query)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                            active
                              ? "bg-indigo-600 text-white border-gray-900"
                              : "bg-[#0B1120] text-slate-300 border-slate-800 hover:border-indigo-400 hover:text-indigo-400"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Khối Sản phẩm mới nhất */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-4 hidden lg:block">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-100 mb-3 pb-2 border-b border-slate-800">
                    Sản phẩm mới nhất
                  </h3>
                  <div className="space-y-3">
                    {latestProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={`/san-pham/${item.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-14 h-14 rounded-xl border border-slate-800 bg-slate-900 p-1 shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-rose-600 mt-0.5">
                            {(item.salePrice ?? item.price).toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>

              {/* CỘT PHẢI: THANH BỘ LỌC NGANG + LƯỚI SẢN PHẨM */}
              <div className="lg:col-span-9 space-y-5">
                {/* Thanh Bộ Lọc Gọn Gàng */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-4 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-100">
                        {selectedCategory !== "ALL"
                          ? selectedCategory
                          : selectedBrand !== "ALL"
                          ? `Thương hiệu ${selectedBrand}`
                          : "Tất cả sản phẩm"}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Đang hiển thị <span className="font-bold text-slate-200">{sortedProducts.length}</span> sản phẩm phù hợp
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOnlyDiscount(!onlyDiscount)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          onlyDiscount
                            ? "bg-rose-600 text-white border-rose-600"
                            : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {onlyDiscount ? "✓ Đang giảm giá" : "Chỉ xem hàng Sale"}
                      </button>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-[#0B1120] px-3 py-1.5 text-xs font-medium text-slate-300 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
                      >
                        <option value="DEFAULT">Sắp xếp: Mặc định</option>
                        <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                        <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
                        <option value="DISCOUNT">Ưu đãi giảm sâu nhất</option>
                      </select>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory("ALL");
                            setSelectedBrand("ALL");
                            setSelectedPriceRange("ALL");
                            setSelectedSize("ALL");
                            setOnlyDiscount(false);
                            setSearchTerm("");
                            setSortBy("DEFAULT");
                          }}
                          className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          ✕ Xoá lọc
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4 Ô LỌC CHIA ĐỀU HÀNG NGANG */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Hãng sản xuất
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120]/70 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Tất cả hãng</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Mức giá
                      </label>
                      <select
                        value={selectedPriceRange}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120]/70 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Tất cả mức giá</option>
                        <option value="UNDER_1M">Dưới 1.000.000 đ</option>
                        <option value="1M_2M">1.000.000 - 2.000.000 đ</option>
                        <option value="2M_4M">2.000.000 - 4.000.000 đ</option>
                        <option value="OVER_4M">Trên 4.000.000 đ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Kích cỡ (Size)
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120]/70 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Tất cả size</option>
                        {allSizes.map((sz) => (
                          <option key={sz} value={sz}>
                            Size {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Danh mục
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-[#0B1120]/70 px-3 py-2 text-sm font-medium text-slate-200 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none"
                      >
                        <option value="ALL">Tất cả danh mục</option>
                        {categories
                          .flatMap((c) => (c.children && c.children.length > 0 ? c.children : [c]))
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* LƯỚI THẺ SẢN PHẨM */}
                {sortedProducts.length === 0 ? (
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
                    <p className="text-base font-bold text-slate-200">Không tìm thấy sản phẩm phù hợp</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Hãy thử đổi mức giá, chọn size khác hoặc bấm xoá bộ lọc để xem toàn bộ kho hàng.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("ALL");
                        setSelectedBrand("ALL");
                        setSelectedPriceRange("ALL");
                        setSelectedSize("ALL");
                        setOnlyDiscount(false);
                        setSearchTerm("");
                      }}
                      className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-600 transition cursor-pointer"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedProducts.map((product) => {
                      const sizes = Array.isArray(product.availableSizes) ? product.availableSizes : [];
                      const isOutOfStock = typeof product.totalStock === "number" && product.totalStock <= 0;
                      return (
                        <div
                          key={product.id}
                          className="group bg-slate-900 rounded-2xl border border-slate-800/90 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 flex flex-col"
                        >
                          <Link
                            href={`/san-pham/${product.id}`}
                            className="relative block aspect-square bg-slate-900 border-b border-slate-800 p-3 overflow-hidden"
                          >
                            {isOutOfStock ? (
                              <span className="absolute top-2.5 left-2.5 z-10 bg-zinc-900/90 text-white text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm">
                                Hết hàng
                              </span>
                            ) : (
                              (product.discountPercent ?? 0) > 0 && (
                                <span className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                                  -{product.discountPercent}%
                                </span>
                              )
                            )}
                            <span className="absolute top-2.5 right-2.5 z-10 bg-slate-800/90 backdrop-blur-xs text-slate-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                              {product.brand || "Store"}
                            </span>
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? "opacity-60 grayscale-[35%]" : ""}`}
                            />
                          </Link>

                          <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                            <div>
                              <Link href={`/san-pham/${product.id}`}>
                                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition">
                                  {product.name}
                                </h3>
                              </Link>

                              {sizes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                  {sizes.slice(0, 4).map((sz) => (
                                    <span
                                      key={sz}
                                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-800/80"
                                    >
                                      {sz}
                                    </span>
                                  ))}
                                  {sizes.length > 4 && (
                                    <span className="text-[10px] font-semibold text-gray-400">
                                      +{sizes.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-800 space-y-2.5">
                              {(product.discountPercent ?? 0) > 0 ? (
                                <div className="flex flex-wrap items-baseline gap-1.5">
                                  <span className="text-base font-extrabold text-rose-600">
                                    {(product.salePrice ?? product.price).toLocaleString("vi-VN")} đ
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    {product.price.toLocaleString("vi-VN")} đ
                                  </span>
                                </div>
                              ) : (
                                <div className="text-base font-extrabold text-rose-600">
                                  {product.price.toLocaleString("vi-VN")} đ
                                </div>
                              )}

                              <Link
                                href={`/san-pham/${product.id}`}
                                className={`block w-full text-center text-xs font-bold py-2 rounded-xl transition ${
                                  isOutOfStock
                                    ? "bg-slate-800 text-slate-400 hover:bg-gray-300"
                                    : "bg-indigo-600 group-hover:bg-indigo-600 text-white"
                                }`}
                              >
                                {isOutOfStock ? "Hết hàng" : "Xem chi tiết"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* MODAL ĐĂNG NHẬP & ĐĂNG KÝ TÀI KHOẢN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowLoginModal(false);
                setLoginMessage(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-slate-800 hover:text-slate-300 text-xl cursor-pointer"
            >
              ×
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-extrabold text-slate-100">
                {authMode === "LOGIN" ? "Đăng nhập SoccerStore" : "Tạo tài khoản mới"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === "LOGIN"
                  ? "Đăng nhập để theo dõi đơn hàng và nhận ưu đãi thành viên."
                  : "Đăng ký miễn phí để mua sắm nhanh chóng hơn tại SoccerStore."}
              </p>
            </div>

            {/* Chuyển Tab Đăng nhập / Đăng ký */}
            <div className="grid grid-cols-2 bg-slate-800 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("LOGIN");
                  setLoginMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === "LOGIN"
                    ? "bg-slate-900 text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("REGISTER");
                  setLoginMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  authMode === "REGISTER"
                    ? "bg-slate-900 text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {authMode === "LOGIN" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Ví dụ: khachhang@gmail.com"
                    className="w-full rounded-xl border border-slate-700 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn..."
                    className="w-full rounded-xl border border-slate-700 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {loginMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
                >
                  {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("REGISTER");
                      setLoginMessage(null);
                    }}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-slate-700 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="email@gmail.com"
                      className="w-full rounded-xl border border-slate-700 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="09xxxxxxxx"
                      className="w-full rounded-xl border border-slate-700 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Địa chỉ nhận hàng
                  </label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                    className="w-full rounded-xl border border-slate-700 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full rounded-xl border border-slate-700 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {loginMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer"
                >
                  {loginLoading ? "Đang tạo tài khoản..." : "Hoàn tất đăng ký"}
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("LOGIN");
                      setLoginMessage(null);
                    }}
                    className="text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}