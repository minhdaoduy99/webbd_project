"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface Category {
  id: number;
  name: string;
  children: Category[];
}

interface Brand {
  id: number;
  name: string;
}

interface VariantInput {
  size: string;
  color: string;
  groundType: string;
  stockQuantity: number;
}

const API_PUBLIC = "http://localhost:8080/api/v1/public";

export default function NewProductPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(3);
  const [basePrice, setBasePrice] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "40", color: "Tiêu chuẩn", groundType: "TF", stockQuantity: 10 },
    { size: "41", color: "Tiêu chuẩn", groundType: "TF", stockQuantity: 10 },
  ]);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState(10);

  useEffect(() => {
    Promise.all([
      fetch(`${API_PUBLIC}/brands`).then((r) => r.json()),
      fetch(`${API_PUBLIC}/categories`).then((r) => r.json()),
    ])
      .then(([brs, cats]) => {
        if (Array.isArray(brs) && brs.length > 0) {
          setBrands(brs);
          setBrandId(brs[0].id);
        }
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          const firstSub = cats[0].children?.[0] || cats[0];
          setCategoryId(firstSub.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setThumbnailUrl(data.url);
      } else {
        alert("Không tải được ảnh lên!");
      }
    } catch {
      alert("Lỗi khi tải ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const addSizeRow = () => {
    const trimmed = newSize.trim();
    if (!trimmed) return;
    setVariants([
      ...variants,
      { size: trimmed, color: "Tiêu chuẩn", groundType: "TF", stockQuantity: Math.max(0, Number(newStock)) },
    ]);
    setNewSize("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !basePrice) {
      alert("Vui lòng nhập đầy đủ Tên sản phẩm và Giá tiền!");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/v1/admin/products", {
        name: name.trim(),
        brandId: Number(brandId),
        categoryId: Number(categoryId),
        basePrice: Number(basePrice),
        thumbnailUrl,
        variants,
      });
      router.push("/admin/products");
    } catch {
      alert("Lưu sản phẩm thất bại! Vui lòng kiểm tra Backend hoặc đăng nhập lại Admin.");
    } finally {
      setSaving(false);
    }
  };

  const flatCategories = categories.flatMap((p) => (p.children?.length ? p.children : [p]));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h1 className="text-xl font-bold text-gray-900">Thêm Sản Phẩm Mới</h1>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-black">
            ← Quay lại danh sách
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nike Phantom 6 Pro Low Cut TF..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Thương hiệu (Hãng)</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              >
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Giá tiền (VNĐ) *</label>
            <input
              type="number"
              required
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="VD: 3190000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"
            />
            {uploading && <p className="text-xs text-amber-600 mt-1">Đang tải ảnh lên...</p>}
            {thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={thumbnailUrl}
                  alt="Xem trước"
                  className="w-24 h-24 object-contain border rounded-lg p-1 bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Danh sách Size ban đầu */}
          <div className="border-t pt-3">
            <label className="block font-medium text-gray-700 mb-2">Các Size & Số lượng ban đầu</label>
            <div className="space-y-2 mb-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...v, size: e.target.value };
                      setVariants(copy);
                    }}
                    className="w-20 border rounded-lg px-2.5 py-1.5 font-medium"
                    placeholder="Size"
                  />
                  <select
                    value={v.groundType}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...v, groundType: e.target.value };
                      setVariants(copy);
                    }}
                    className="border rounded-lg px-2.5 py-1.5 bg-white"
                  >
                    <option value="TF">TF (Cỏ nhân tạo)</option>
                    <option value="FG">FG (Cỏ tự nhiên)</option>
                    <option value="IC">IC (Futsal)</option>
                    <option value="PHU_KIEN">Phụ kiện</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={v.stockQuantity}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx] = { ...v, stockQuantity: Math.max(0, Number(e.target.value)) };
                      setVariants(copy);
                    }}
                    className="w-24 border rounded-lg px-2.5 py-1.5"
                    placeholder="Số lượng"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Thêm size (VD: 42)"
                className="w-36 border rounded-lg px-2.5 py-1.5"
              />
              <input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                placeholder="SL"
                className="w-20 border rounded-lg px-2.5 py-1.5"
              />
              <button
                type="button"
                onClick={addSizeRow}
                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
              >
                + Thêm size
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
