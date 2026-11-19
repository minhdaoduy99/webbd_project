"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProductVariant {
  id?: number | string;
  size: string;
  color?: string;
  groundType?: string;
  stock: number;
}

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

const GROUND_LABELS: Record<string, string> = {
  TF: "TF (Cỏ nhân tạo)",
  FG: "FG (Cỏ tự nhiên)",
  IC: "IC (Futsal)",
  AG: "AG (Cỏ nhân tạo hạt cao su)",
  MG: "MG (Đa mặt sân)",
  PHU_KIEN: "Phụ kiện",
};

function ProductDetailContent() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id || "1";

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
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

        if (!data || !data.name) {
          const listRes = await fetch("http://localhost:8080/api/v1/public/products");
          if (listRes.ok) {
            const listRaw = await listRes.json();
            const list = Array.isArray(listRaw) ? listRaw : listRaw?.data || listRaw?.content || [];
            data = list.find((p: Record<string, unknown>) => String(p.id) === String(rawId)) || null;
          }
        }

        if (data) {
          let mappedVariants: ProductVariant[] = [];

          if (Array.isArray(data.variants) && data.variants.length > 0) {
            mappedVariants = data.variants.map((v: Record<string, unknown>) => ({
              id: v.id as number | string | undefined,
              size: String(v.size ?? "Tiêu chuẩn"),
              color: v.color ? String(v.color) : "",
              groundType: v.groundType ? String(v.groundType) : "",
              stock: Number(v.stock ?? v.stockQuantity ?? 0),
            }));
          } else {
            // Dự phòng từ DTO danh sách sản phẩm (availableSizes & outOfStockSizes)
            const avail = Array.isArray(data.availableSizes) ? data.availableSizes.map(String) : [];
            const out = Array.isArray(data.outOfStockSizes) ? data.outOfStockSizes.map(String) : [];
            const grounds = Array.isArray(data.groundTypes ?? data.grounds) ? (data.groundTypes ?? data.grounds).map(String) : [];
            const totalSt = Number(data.totalStock ?? data.stock ?? 0);
            const perSizeStock = avail.length > 0 ? Math.max(1, Math.floor(totalSt / avail.length)) : 0;

            mappedVariants = [
              ...avail.map((sz) => ({
                size: sz,
                groundType: grounds[0] || "",
                stock: perSizeStock,
              })),
              ...out.map((sz) => ({
                size: sz,
                groundType: grounds[0] || "",
                stock: 0,
              })),
            ];
          }

          const base = Number(data.basePrice ?? data.price ?? 0);
          const discount = Number(data.discountPercent ?? 0);
          const sale = Number(
            data.salePrice ?? (discount > 0 ? Math.round((base * (100 - discount)) / 100) : base)
          );

          setProduct({
            id: (data.id as number | string) ?? rawId,
            name: String(data.name ?? `Sản phẩm #${rawId}`),
            basePrice: base,
            salePrice: sale,
            discountPercent: discount,
            image: String(
              data.thumbnailUrl ??
                data.image ??
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80"
            ),
            brandName: String(data.brandName ?? "SoccerStore"),
            categoryName: String(data.categoryName ?? "Thể thao"),
            description: String(data.description ?? ""),
            variants: mappedVariants,
            totalStockOverride: typeof (data.totalStock ?? data.stock) === "number" ? Number(data.totalStock ?? data.stock) : undefined,
          });

          const firstInStock = mappedVariants.findIndex((v) => v.stock > 0);
          setSelectedIdx(firstInStock >= 0 ? firstInStock : 0);
          setQuantity(1);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [rawId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Đang tải thông tin sản phẩm từ kho...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 font-medium">Không tìm thấy sản phẩm #{rawId}</p>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← Quay lại Trang chủ
        </Link>
      </div>
    );
  }

  const hasVariants = product.variants.length > 0;
  const activeVariant = hasVariants ? product.variants[selectedIdx] || product.variants[0] : null;
  const totalStock =
    product.totalStockOverride ?? product.variants.reduce((sum, v) => sum + v.stock, 0);
  const currentStock = activeVariant ? activeVariant.stock : 0;
  const isOutOfStock = !hasVariants || currentStock <= 0;

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
          <div className="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            {product.discountPercent > 0 && (
              <span className="absolute top-3 right-3 z-10 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                - {product.discountPercent}%
              </span>
            )}
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

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-extrabold text-rose-600">
                  {product.salePrice.toLocaleString("vi-VN")} đ
                </span>
                {product.discountPercent > 0 && (
                  <span className="text-base text-gray-400 line-through">
                    {product.basePrice.toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-3">
                Thương hiệu: <strong className="text-gray-800">{product.brandName}</strong> • Danh mục:{" "}
                <strong className="text-gray-800">{product.categoryName}</strong>
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
                disabled={isOutOfStock}
                onClick={() => {
                  setAddedNotice(true);
                  setTimeout(() => setAddedNotice(false), 2500);
                }}
                className={`w-full font-bold py-3.5 rounded-xl transition ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-indigo-600 text-white cursor-pointer"
                }`}
              >
                {isOutOfStock
                  ? "Sản phẩm tạm hết hàng"
                  : `🛒 Thêm vào giỏ hàng (${activeVariant?.size} • SL: ${quantity})`}
              </button>

              {addedNotice && activeVariant && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
                  Đã thêm <strong>{quantity}</strong> × <strong>{product.name}</strong> (Size{" "}
                  <strong>{activeVariant.size}</strong>) vào giỏ hàng!
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
