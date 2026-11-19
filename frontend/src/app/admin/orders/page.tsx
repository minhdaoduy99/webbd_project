"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt?: string;
  total: number;
  status: "PENDING" | "SHIPPING" | "DELIVERED";
}

const STATUS_META: Record<Order["status"], { label: string; badge: string }> = {
  PENDING: { label: "Chờ xử lý", badge: "bg-amber-100 text-amber-800" },
  SHIPPING: { label: "Đang giao hàng", badge: "bg-blue-100 text-blue-800" },
  DELIVERED: { label: "Đã giao thành công", badge: "bg-green-100 text-green-800" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  useEffect(() => {
    api
      .get("/api/v1/admin/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
    );
    try {
      await api.patch(`/api/v1/admin/orders/${orderId}`, { status: newStatus });
    } catch {}
  };

  const filteredOrders =
    filterStatus === "ALL" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh Sách Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cập nhật trạng thái vận chuyển và xuất phiếu giao hàng cho đơn vị ship
          </p>
        </div>

        {/* Bộ lọc nhanh theo trạng thái */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "ALL", label: `Tất cả (${orders.length})` },
            { key: "PENDING", label: "Chờ xử lý" },
            { key: "SHIPPING", label: "Đang giao" },
            { key: "DELIVERED", label: "Đã giao" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                filterStatus === tab.key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Phiếu giao hàng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                  Chưa có đơn hàng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold text-gray-900">#{order.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {order.total.toLocaleString("vi-VN")} đ
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(val) => val && handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">PENDING (Chờ xử lý)</SelectItem>
                        <SelectItem value="SHIPPING">SHIPPING (Đang giao)</SelectItem>
                        <SelectItem value="DELIVERED">DELIVERED (Đã giao)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800"
                    >
                      In phiếu giao
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Phiếu Giao Hàng chuẩn in PDF */}
      {printOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="border-b pb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  SOCCERSTORE VIETNAM
                </p>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  PHIẾU GIAO HÀNG #{printOrder.id}
                </h2>
                <p className="text-xs text-gray-500">
                  Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  STATUS_META[printOrder.status]?.badge || "bg-gray-100"
                }`}
              >
                {STATUS_META[printOrder.status]?.label || printOrder.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Người nhận:</span>
                <span className="font-semibold text-gray-900">{printOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số điện thoại:</span>
                <span className="font-medium text-gray-800">
                  {printOrder.customerPhone || "Theo thông tin tài khoản"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 shrink-0">Địa chỉ giao:</span>
                <span className="font-medium text-gray-800 text-right">
                  {printOrder.shippingAddress || "Giao tận nơi (COD)"}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tổng tiền thu hộ (COD):</span>
              <span className="text-xl font-bold text-red-600">
                {printOrder.total.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPrintOrder(null)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Xuất PDF / In phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
