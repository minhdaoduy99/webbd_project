"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProductDetail {
  id: number | string;
  name: string;
  basePrice: number;
  salePrice: number;
  discountPercent: number;
  image: string;
  brandName: string;
  categoryName: string;
  description: string;
  variants: ProductVariant[];
  totalStockOverride?: number;
}

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  size: number;
  quantity: number;
}

const FALLBACK_PRODUCTS: Record<string, ProductDetail> = {
  "1": {
    id: 1,
    name: "Nike Air Force 1 '07 Trắng Cổ Điển",
    price: 2950000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
    description: "Mẫu sneaker huyền thoại với chất liệu da cao cấp, đệm Air êm ái phù hợp đi học, đi làm và dạo phố.",
  },
  "2": {
    id: 2,
    name: "Adidas Ultraboost Light Running",
    price: 3400000,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80",
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

const AVAILABLE_SIZES = [39, 40, 41, 42];

function ProductDetailContent() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id || "1";

  const [product, setProduct] = useState<ProductDetail>(
    FALLBACK_PRODUCTS[rawId] || {
      id: rawId,
      name: `Giày Sneaker WebBD #${rawId}`,
      price: 2950000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
      description: "Giày thể thao chính hãng phân phối bởi WebBD Sneaker.",
    }
  );
  const [selectedSize, setSelectedSize] = useState<number>(40);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        let data: Record<string, unknown> | null = null;

        const detailRes = await fetch(`http://localhost:8080/api/v1/public/products/${rawId}`);
        if (detailRes.ok) {
          const detailRaw = await detailRes.json();
          data = detailRaw?.data ?? detailRaw;
        }
      } catch {
        // Dùng dữ liệu mẫu khi API chưa bật
      }
    }

    fetchDetail();
  }, [rawId]);

  const handleAddToCart = () => {
    try {
      const saved = localStorage.getItem("cart");
      const existing: CartItem[] = saved ? JSON.parse(saved) : [];
      const idx = existing.findIndex(
        (item) => String(item.id) === String(product.id) && item.size === selectedSize
      );

      if (idx > -1) {
        existing[idx].quantity += 1;
      } else {
        existing.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          size: selectedSize,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(existing));
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
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
          <div className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Mã sản phẩm: #{product.id}
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    totalStock > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {totalStock > 0 ? `Tổng kho: ${totalStock} sản phẩm` : "Tạm hết hàng"}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">
                {product.name}
              </h1>
              <p className="text-3xl font-extrabold text-rose-600 mt-4">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {product.description}
              </p>

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
                          {GROUND_LABELS[activeVariant.groundType] || activeVariant.groundType}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

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
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
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
                onClick={handleAddToCart}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition"
              >
                {isOutOfStock
                  ? "Sản phẩm tạm hết hàng"
                  : `🛒 Thêm vào giỏ hàng (${activeVariant?.size} • SL: ${quantity})`}
              </button>

              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center justify-between">
                  <span>
                    Đã thêm <strong>{product.name}</strong> (Size {selectedSize})!
                  </span>
                  <Link href="/gio-hang" className="underline font-bold text-emerald-800 ml-2">
                    Mở giỏ hàng →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
