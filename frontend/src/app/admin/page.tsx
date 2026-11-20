"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface ProductAlert {
  id: string | number;
  name: string;
  brandName?: string;
  category?: string;
  stock: number;
  outOfStockSizes?: string[];
  lowStockSizes?: string[];
  sizes?: string[];
}

interface OrderRecord {
  id: string | number;
  total?: number;
  status: string;
  createdAt?: string;
  orderDate?: string;
  createdDate?: string;
}

export default function AdminDashboardPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const [totalProducts, setTotalProducts] = useState<number | string>("...");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductAlert[]>([]);
  const [brandStats, setBrandStats] = useState<{ name: string; count: number; stock: number }[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/public/products")
      .then((res) => res.json())
      .then((data) => {
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];
        const total = Array.isArray(data)
          ? data.length
          : data?.totalElements ?? list.length;
        setTotalProducts(total);

        const alerts: ProductAlert[] = list
          .map((p) => ({
            id: p.id,
            name: p.name,
            brandName: p.brandName || "Khác",
            category: p.category || "",
            stock: p.totalStock ?? p.stock ?? 0,
            outOfStockSizes: Array.isArray(p.outOfStockSizes) ? p.outOfStockSizes : [],
            lowStockSizes: Array.isArray(p.lowStockSizes) ? p.lowStockSizes : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
          }))
          .filter((p) => p.stock <= 5 || (p.outOfStockSizes && p.outOfStockSizes.length > 0) || (p.lowStockSizes && p.lowStockSizes.length > 0))
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 8);
        setLowStockProducts(alerts);

        const map = new Map<string, { count: number; stock: number }>();
        list.forEach((p) => {
          const b = p.brandName || "Khác";
          const cur = map.get(b) || { count: 0, stock: 0 };
          map.set(b, {
            count: cur.count + 1,
            stock: cur.stock + (p.totalStock ?? p.stock ?? 0),
          });
        });
        const stats = Array.from(map.entries())
          .map(([name, val]) => ({ name, ...val }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setBrandStats(stats);
      })
      .catch(() => setTotalProducts(0));

    api
      .get("/api/v1/admin/orders")
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setOrders([]);
      });
  }, []);

  const { pendingOrders, monthRevenue, yearRevenue, monthlySeries } = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const series = Array.from({ length: 12 }, (_, idx) => ({
      month: idx + 1,
      revenue: 0,
      orderCount: 0,
    }));

    let yTotal = 0;

    orders.forEach((o) => {
      if (o.status !== "DELIVERED") return;
      const rawDate = o.createdAt || o.orderDate || o.createdDate;
      const d = rawDate ? new Date(rawDate) : new Date();
      const y = isNaN(d.getTime()) ? now.getFullYear() : d.getFullYear();
      const m = isNaN(d.getTime()) ? now.getMonth() + 1 : d.getMonth() + 1;

      if (y === selectedYear) {
        const amount = o.total || 0;
        yTotal += amount;
        if (m >= 1 && m <= 12) {
          series[m - 1].revenue += amount;
          series[m - 1].orderCount += 1;
        }
      }
    });

    const mRev = series[selectedMonth - 1]?.revenue ?? 0;

    return {
      pendingOrders: pending,
      monthRevenue: mRev,
      yearRevenue: yTotal,
      monthlySeries: series,
    };
  }, [orders, selectedYear, selectedMonth]);

  const maxMonthlyRev = Math.max(...monthlySeries.map((s) => s.revenue), 1);
  const maxBrandCount = Math.max(...brandStats.map((b) => b.count), 1);
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi doanh thu theo tháng/năm và cảnh báo tồn kho theo size
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border bg-white text-sm font-medium text-gray-700"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            + Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* 4 thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Tổng sản phẩm</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Đang kinh doanh trên hệ thống</p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Đơn chờ xử lý</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{pendingOrders}</p>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
            Xử lý đơn hàng →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">
            Doanh thu Tháng {selectedMonth}/{selectedYear}
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {monthRevenue.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {monthlySeries[selectedMonth - 1]?.orderCount || 0} đơn giao thành công
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">
            Tổng doanh thu Năm {selectedYear}
          </p>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {yearRevenue.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs text-gray-400 mt-1">Tính trên các đơn DELIVERED</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu 12 tháng trong năm */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Biểu đồ Doanh thu 12 Tháng — Năm {selectedYear}
            </h2>
            <p className="text-xs text-gray-500">
              Bấm vào từng cột tháng để xem chi tiết doanh thu tháng đó
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            Cả năm {selectedYear}: {yearRevenue.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-52 pt-6 px-2 border-b">
          {monthlySeries.map((item) => {
            const heightPct =
              item.revenue > 0 ? Math.max(Math.round((item.revenue / maxMonthlyRev) * 100), 8) : 4;
            const isSelected = item.month === selectedMonth;
            return (
              <button
                key={item.month}
                type="button"
                onClick={() => setSelectedMonth(item.month)}
                className="flex flex-col items-center justify-end h-full group focus:outline-none"
                title={`Tháng ${item.month}/${selectedYear}: ${item.revenue.toLocaleString("vi-VN")} đ (${item.orderCount} đơn)`}
              >
                <span className="text-[10px] font-semibold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {item.revenue > 0 ? `${(item.revenue / 1000000).toFixed(1)}tr` : "0"}
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[34px] rounded-t-md transition-all duration-300 ${
                    isSelected
                      ? "bg-green-600 ring-2 ring-green-300"
                      : item.revenue > 0
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-100"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-12 gap-2 sm:gap-3 px-2 text-center">
          {monthlySeries.map((item) => (
            <button
              key={item.month}
              type="button"
              onClick={() => setSelectedMonth(item.month)}
              className={`text-xs font-semibold py-1 rounded ${
                item.month === selectedMonth
                  ? "bg-green-100 text-green-800"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              T{item.month}
            </button>
          ))}
        </div>
      </div>

      {/* Biểu đồ phân bổ thương hiệu + Bảng cảnh báo tồn kho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Phân bổ mẫu mã theo Thương hiệu</h2>
            <p className="text-xs text-gray-500">Thống kê số lượng mẫu và tổng đôi tồn kho</p>
          </div>

          {brandStats.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Đang tải dữ liệu biểu đồ...</p>
          ) : (
            <div className="space-y-3 pt-2">
              {brandStats.map((b) => {
                const pct = Math.round((b.count / maxBrandCount) * 100);
                return (
                  <div key={b.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-800">{b.name}</span>
                      <span className="text-gray-500">
                        {b.count} mẫu ({b.stock} đôi)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Cảnh báo Sắp hết / Hết size
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {lowStockProducts.length} mẫu
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Các sản phẩm có tổng tồn kho ≤ 5 đôi hoặc đang bị đứt size
              </p>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-blue-600 hover:underline">
              Nhập thêm kho →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
              Tất cả sản phẩm đều đang còn đủ hàng trong kho.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b text-xs text-gray-500 uppercase">
                    <th className="py-2 pr-3">Sản phẩm</th>
                    <th className="py-2 px-2">Size hết / sắp hết</th>
                    <th className="py-2 pl-2 text-right">Tổng tồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStockProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.brandName}</p>
                      </td>
                      <td className="py-2.5 px-2">
                        {(item.outOfStockSizes && item.outOfStockSizes.length > 0) || (item.lowStockSizes && item.lowStockSizes.length > 0) ? (
                            <div className="flex flex-wrap gap-1">
                              {(item.outOfStockSizes || []).map((s) => (
                                <span
                                  key={`out-${s}`}
                                  className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-red-100 text-red-700"
                                >
                                  Size {s} (Hết)
                                </span>
                              ))}
                              {(item.lowStockSizes || []).map((s) => (
                                <span
                                  key={`low-${s}`}
                                  className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-800"
                                >
                                  Size {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Sắp hết toàn bộ</span>
                          )}
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                        {item.stock === 0 ? (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                            Hết hàng (0)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                            Còn {item.stock}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
