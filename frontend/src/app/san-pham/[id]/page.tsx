"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ProductDetail {
  id: number | string;
  name: string;
  price: number;
  image: string;
  description: string;
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
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Mã sản phẩm: #{product.id}
              </span>
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

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition"
              >
                🛒 Thêm vào giỏ hàng (Size {selectedSize})
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