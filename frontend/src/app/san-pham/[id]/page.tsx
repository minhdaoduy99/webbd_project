"use client";

<<<<<<< HEAD
import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// 1. Định nghĩa kiểu dữ liệu sản phẩm
=======
import React, { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProductVariant {
  id?: number | string;
  size: string | number;
  color?: string;
  groundType?: string;
  stock: number;
}

>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
interface ProductDetail {
  id: number | string;
  name: string;
  price: number;
<<<<<<< HEAD
  image: string;
  description: string;
}

// Dữ liệu mẫu dự phòng (hiển thị ngay cả khi API của Bạn 2 chưa bật)
=======
  basePrice?: number;
  salePrice?: number;
  discountPercent?: number;
  image: string;
  brandName?: string;
  categoryName?: string;
  description: string;
  variants: ProductVariant[];
  totalStock?: number;
}

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  size: number | string;
  color?: string;
  quantity: number;
}

const GROUND_LABELS: Record<string, string> = {
  TF: "Sân cỏ nhân tạo (TF)",
  FG: "Sân cỏ tự nhiên (FG)",
  AG: "Sân cỏ nhân tạo hạt cao su (AG)",
  IC: "Sân Futsal / Trong nhà (IC)",
  MG: "Đa mặt sân (MG)",
};

>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
const FALLBACK_PRODUCTS: Record<string, ProductDetail> = {
  "1": {
    id: 1,
    name: "Nike Air Force 1 '07 Trắng Cổ Điển",
    price: 2950000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
<<<<<<< HEAD
    description: "Mẫu sneaker huyền thoại với chất liệu da cao cấp, đệm Air êm ái phù hợp đi học, đi làm và dạo phố.",
=======
    brandName: "Nike",
    description: "Mẫu sneaker huyền thoại với chất liệu da cao cấp, đệm Air êm ái phù hợp đi học, đi làm và dạo phố.",
    variants: [
      { id: 101, size: 39, color: "Trắng", stock: 5 },
      { id: 102, size: 40, color: "Trắng", stock: 8 },
      { id: 103, size: 41, color: "Trắng", stock: 4 },
      { id: 104, size: 42, color: "Trắng", stock: 0 },
    ],
>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
  },
  "2": {
    id: 2,
    name: "Adidas Ultraboost Light Running",
    price: 3400000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80",
<<<<<<< HEAD
    description: "Đế Boost siêu nhẹ hoàn trả năng lượng vượt trội, thân giày Primeknit ôm chân thoáng khí.",
  },
  "3": {
    id: 3,
    name: "Jordan 1 Retro High OG Chicago",
    price: 4850000,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=900&q=80",
    description: "Phối màu Đỏ - Trắng - Đen kinh điển, form cổ cao cá tính và chất da bền bỉ theo thời gian.",
  },
  "4": {
    id: 4,
    name: "New Balance 550 White Green",
    price: 3100000,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=900&q=80",
    description: "Thiết kế retro bóng rổ thập niên 80, dễ phối đồ với form dáng gọn gàng, thanh lịch.",
  },
};

// Danh sách 4 size cố định theo đúng đề bài Nhiệm vụ 3
const AVAILABLE_SIZES = [39, 40, 41, 42];

function ProductDetailContent() {
  // 2. Lấy tham số [id] từ thanh địa chỉ URL (ví dụ /san-pham/2 -> rawId = "2")
=======
    brandName: "Adidas",
    description: "Đế Boost siêu nhẹ hoàn trả năng lượng vượt trội, thân giày Primeknit ôm chân thoáng khí.",
    variants: [
      { id: 201, size: 40, color: "Đen / Trắng", stock: 6 },
      { id: 202, size: 41, color: "Đen / Trắng", stock: 3 },
      { id: 203, size: 42, color: "Đen / Trắng", stock: 5 },
    ],
  },
};

function ProductDetailContent() {
>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id || "1";

  const [product, setProduct] = useState<ProductDetail>(
    FALLBACK_PRODUCTS[rawId] || {
      id: rawId,
<<<<<<< HEAD
      name: `Giày Sneaker WebBD #${rawId}`,
      price: 2950000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
      description: "Giày thể thao chính hãng phân phối bởi WebBD Sneaker.",
    }
  );

  // 3. State lưu size giày khách đang chọn (mặc định chọn sẵn size 40)
  const [selectedSize, setSelectedSize] = useState<number>(40);
  const [addedNotice, setAddedNotice] = useState(false);

  // 4. Gọi API chi tiết sản phẩm của Bạn 2 (nếu Backend đã có API này)
  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/products/${rawId}`);
        if (!res.ok) return;
        const item = await res.json();
        const data = item.data || item;
        if (data && (data.name || data.tenSanPham)) {
          setProduct({
            id: data.id ?? rawId,
            name: data.name || data.tenSanPham,
            price: Number(data.price ?? data.gia ?? 2950000),
            image:
              data.image ||
              data.imageUrl ||
              data.hinhAnh ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
            description:
              data.description ||
              data.moTa ||
              "Giày thể thao chính hãng phân phối bởi WebBD Sneaker.",
          });
        }
      } catch {
        // Giữ nguyên dữ liệu mẫu nếu Backend chưa mở API products/{id}
      }
    }
    fetchDetail();
  }, [rawId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6"
        >
          ← Quay lại Trang chủ
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* CỘT TRÁI: HIỂN THỊ ẢNH GIÀY */}
          <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>

          {/* CỘT PHẢI: TÊN, GIÁ TIỀN & BẢNG CHỌN SIZE (39, 40, 41, 42) */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Mã sản phẩm: #{product.id}
              </span>
=======
      name: `Sản phẩm #${rawId}`,
      price: 0,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
      description: "Đang tải thông tin chi tiết sản phẩm...",
      variants: [],
    }
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/v1/public/products/${rawId}`);
        if (res.ok) {
          const raw = await res.json();
          const d = raw?.data ?? raw;
          if (d && active) {
            const rawVariants: any[] = Array.isArray(d.variants) ? d.variants : [];
            const mappedVariants: ProductVariant[] = rawVariants.map((v, i) => ({
              id: v.id ?? i,
              size: v.size ?? 40,
              color: v.color || "Tiêu chuẩn",
              groundType: v.groundType || d.groundType || "",
              stock: Number(v.stock ?? v.quantity ?? 0),
            }));

            const basePrice = Number(d.basePrice ?? d.price ?? 0);
            const discountPercent = Number(d.discountPercent ?? 0);
            const salePrice =
              d.salePrice != null
                ? Number(d.salePrice)
                : discountPercent > 0
                ? Math.round(basePrice * (1 - discountPercent / 100))
                : basePrice;

            const sumVariantStock = mappedVariants.reduce((s, v) => s + v.stock, 0);
            const totalStock =
              mappedVariants.length > 0
                ? sumVariantStock
                : Number(d.totalStock ?? d.stock ?? 0);

            setProduct({
              id: d.id ?? rawId,
              name: d.name || `Sản phẩm #${rawId}`,
              price: salePrice,
              basePrice,
              salePrice,
              discountPercent,
              image: (() => {
                const rawImg =
                  d.thumbnailUrl ||
                  d.thumbnail ||
                  d.imageUrl ||
                  d.image_url ||
                  d.image ||
                  d.img ||
                  (Array.isArray(d.images) && d.images.length > 0
                    ? typeof d.images[0] === "string"
                      ? d.images[0]
                      : d.images[0]?.url || d.images[0]?.imageUrl
                    : "") ||
                  "";
                if (!rawImg) return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80";
                return rawImg;
              })(),
              brandName: d.brandName || d.brand?.name || "",
              categoryName: d.categoryName || d.category?.name || "",
              description:
                d.description || "Sản phẩm chính hãng phân phối tại SoccerStore.",
              variants: mappedVariants,
              totalStock,
            });

            const firstAvailableIdx = mappedVariants.findIndex((v) => v.stock > 0);
            setSelectedIdx(firstAvailableIdx >= 0 ? firstAvailableIdx : 0);
            setQuantity(1);
          }
        }
      } catch {
        // Giữ fallback nếu backend chưa bật
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      active = false;
    };
  }, [rawId]);

  const hasVariants = product.variants && product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedIdx] || product.variants[0] : null;
  const totalStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : product.totalStock ?? 0;
  const currentStock = activeVariant ? activeVariant.stock : totalStock;
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    try {
      const saved = localStorage.getItem("cart");
      const existing: CartItem[] = saved ? JSON.parse(saved) : [];
      const chosenSize = activeVariant ? activeVariant.size : 40;
      const chosenColor = activeVariant?.color;

      const idx = existing.findIndex(
        (item) =>
          String(item.id) === String(product.id) &&
          String(item.size) === String(chosenSize)
      );

      if (idx > -1) {
        existing[idx].quantity = Math.min(
          existing[idx].quantity + quantity,
          Math.max(currentStock, 1)
        );
      } else {
        existing.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: chosenSize,
          color: chosenColor,
          quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(existing));
      window.dispatchEvent(new Event("storage"));
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3500);
    } catch (err) {
      console.error("Lỗi lưu giỏ hàng:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Quay lại Trang chủ
          </Link>
          <Link
            href="/gio-hang"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-indigo-500 transition"
          >
            🛒 Xem giỏ hàng
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative p-4">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.retried && product.image.startsWith("/")) {
                  target.dataset.retried = "1";
                  target.src = `http://localhost:8080${product.image}`;
                } else {
                  target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80";
                }
              }}
              className="w-full h-80 md:h-96 object-contain"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">
                -{product.discountPercent}%
              </span>
            ) : null}
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Mã sản phẩm: #{product.id}
                </span>
                {product.brandName && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {product.brandName}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    totalStock > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {loading
                    ? "Đang kiểm tra kho..."
                    : totalStock > 0
                    ? `Tổng kho: ${totalStock} sản phẩm`
                    : "Tạm hết hàng"}
                </span>
              </div>

>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">
                {product.name}
              </h1>

<<<<<<< HEAD
              {/* HIỂN THỊ GIÁ TIỀN ĐỊNH DẠNG VNĐ */}
              <p className="text-3xl font-extrabold text-rose-600 mt-4">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>
=======
              <div className="flex items-baseline gap-3 mt-4">
                <p className="text-3xl font-extrabold text-rose-600">
                  {product.price.toLocaleString("vi-VN")} đ
                </p>
                {product.basePrice && product.basePrice > product.price && (
                  <p className="text-base text-gray-400 line-through">
                    {product.basePrice.toLocaleString("vi-VN")} đ
                  </p>
                )}
              </div>
>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e

              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {product.description}
              </p>

<<<<<<< HEAD
              {/* BẢNG CHỌN SIZE 39, 40, 41, 42 */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Chọn kích cỡ (Size EU):
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    Đang chọn: Size {selectedSize}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-bold text-sm border transition ${
                        selectedSize === size
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* NÚT THÊM VÀO GIỎ HÀNG */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setAddedNotice(true);
                  setTimeout(() => setAddedNotice(false), 2500);
                }}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition"
              >
                🛒 Thêm vào giỏ hàng (Size {selectedSize})
              </button>

              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
                  Đã chọn <strong>{product.name}</strong> - <strong>Size {selectedSize}</strong>!
=======
              {/* Chọn phân loại / Size */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Chọn phân loại / Size:
                  </span>
                  {activeVariant && (
                    <span className="text-xs font-semibold text-indigo-600">
                      Đang chọn: {activeVariant.size}
                      {activeVariant.color && activeVariant.color !== "Tiêu chuẩn"
                        ? ` - ${activeVariant.color}`
                        : ""}{" "}
                      ({currentStock > 0 ? `Còn ${currentStock}` : "Hết hàng"})
                    </span>
                  )}
                </div>

                {hasVariants ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {product.variants.map((v, idx) => {
                      const out = v.stock <= 0;
                      const isSelected = idx === selectedIdx;
                      return (
                        <button
                          key={v.id ?? `${v.size}-${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedIdx(idx);
                            setQuantity(1);
                          }}
                          className={`py-2.5 px-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : out
                              ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
                              : "bg-white text-gray-800 border-gray-300 hover:border-indigo-500"
                          }`}
                        >
                          <span className="text-sm font-bold">{v.size}</span>
                          <span
                            className={`text-[11px] mt-0.5 ${
                              isSelected
                                ? "text-indigo-100"
                                : out
                                ? "text-rose-400"
                                : "text-gray-500"
                            }`}
                          >
                            {out ? "Hết hàng" : `Còn ${v.stock}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    Sản phẩm này chưa được cập nhật phân loại size trong kho.
                  </div>
                )}

                {activeVariant && (activeVariant.color || activeVariant.groundType) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    {activeVariant.color && (
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                        Màu: <strong>{activeVariant.color}</strong>
                      </span>
                    )}
                    {activeVariant.groundType && (
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md">
                        Loại:{" "}
                        <strong>
                          {GROUND_LABELS[activeVariant.groundType] ||
                            activeVariant.groundType}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Chọn số lượng */}
              {!isOutOfStock && (
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-800">Số lượng:</span>
                  <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(Math.max(currentStock, 1), q + 1))
                      }
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    (Tối đa {currentStock} sản phẩm có sẵn)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-full font-bold py-3.5 rounded-xl transition ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-indigo-600 text-white cursor-pointer"
                }`}
              >
                {isOutOfStock
                  ? "Sản phẩm tạm hết hàng"
                  : `🛒 Thêm vào giỏ hàng (${activeVariant?.size ?? 40} • SL: ${quantity})`}
              </button>

              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center justify-between">
                  <span>
                    Đã thêm <strong>{product.name}</strong> (Size{" "}
                    {activeVariant?.size ?? 40})!
                  </span>
                  <Link
                    href="/gio-hang"
                    className="underline font-bold text-emerald-800 ml-2"
                  >
                    Mở giỏ hàng →
                  </Link>
>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
// Bọc trong <Suspense> để tương thích với chế độ Cache Components của Next.js 16.4.5
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
=======
export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Đang tải chi tiết sản phẩm...</div>}
    >
      <ProductDetailContent />
    </Suspense>
  );
}
>>>>>>> 6090b6bf5f7a1de978b72bccbb2f8380052dfd9e
