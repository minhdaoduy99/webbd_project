"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboardPage() {
  const [totalProducts, setTotalProducts] = useState<number | string>("...");
  const [pendingOrders, setPendingOrders] = useState<number | string>("...");
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>("...");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/public/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTotalProducts(data.length);
        else if (Array.isArray(data?.content)) setTotalProducts(data.totalElements ?? data.content.length);
        else setTotalProducts(0);
      })
      .catch(() => setTotalProducts(0));

    api.get("/api/v1/admin/orders")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const pending = list.filter((o: { status: string }) => o.status === "PENDING").length;
        const rev = list
          .filter((o: { status: string }) => o.status === "DELIVERED")
          .reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0);
        setPendingOrders(pending);
        setMonthlyRevenue(rev.toLocaleString("vi-VN") + " đ");
      })
      .catch(() => {
        setPendingOrders(0);
        setMonthlyRevenue("0 đ");
      });
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tổng Quan Hệ Thống</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Tổng sản phẩm</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Đơn hàng chờ xử lý</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-gray-500">Doanh thu tháng</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{monthlyRevenue}</p>
        </div>
      </div>
    </div>
  );
}
