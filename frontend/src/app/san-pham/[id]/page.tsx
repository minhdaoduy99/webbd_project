"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// 1. Định nghĩa kiểu dữ liệu sản phẩm
interface ProductDetail {
  id: number | string;
  name: string;
  price: number;
  image: string;
  description: string;
}

// Dữ liệu mẫu dự phòng (hiển thị ngay cả khi API của Bạn 2 chưa bật)
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

// Danh sách 4 size cố định theo đúng đề bài Nhiệm vụ 3
const AVAILABLE_SIZES = [39, 40, 41, 42];

function ProductDetailContent() {
  // 2. Lấy tham số [id] từ thanh địa chỉ URL (ví dụ /san-pham/2 -> rawId = "2")
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">
                {product.name}
              </h1>

              {/* HIỂN THỊ GIÁ TIỀN ĐỊNH DẠNG VNĐ */}
              <p className="text-3xl font-extrabold text-rose-600 mt-4">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>

              <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                {product.description}
              </p>

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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bọc trong <Suspense> để tương thích với chế độ Cache Components của Next.js 16.4.5
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}