"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderDetailItem {
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

interface Order {
  id: string;
  orderCode?: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt?: string;
  total: number;
  status: "PENDING" | "SHIPPING" | "DELIVERED";
  totalQty?: number;
  items?: OrderDetailItem[];
}

function readThreeDigits(num: number, showZeroHundred: boolean): string {
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const hundred = Math.floor(num / 100);
  const ten = Math.floor((num % 100) / 10);
  const unit = num % 10;
  let str = "";

  if (hundred > 0 || showZeroHundred) {
    str += digits[hundred] + " trăm ";
    if (ten === 0 && unit > 0) str += "lẻ ";
  }

  if (ten > 1) {
    str += digits[ten] + " mươi ";
    if (unit === 1) str += "mốt";
    else if (unit === 5) str += "lăm";
    else if (unit > 0) str += digits[unit];
  } else if (ten === 1) {
    str += "mười ";
    if (unit === 5) str += "lăm";
    else if (unit > 0) str += digits[unit];
  } else if (ten === 0 && unit > 0) {
    str += digits[unit];
  }

  return str.trim();
}

function numberToVietnameseWords(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  if (n === 0) return "Không đồng";
  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let temp = n;
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      const prefix = readThreeDigits(groups[i], i < groups.length - 1);
      parts.push((prefix + " " + units[i]).trim());
    }
  }

  const sentence = parts.join(" ").replace(/\s+/g, " ").trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + " đồng";
}

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

  const printDate = printOrder?.createdAt && !Number.isNaN(Date.parse(printOrder.createdAt))
    ? new Date(printOrder.createdAt)
    : new Date();

  const tableItems: OrderDetailItem[] =
    printOrder?.items && printOrder.items.length > 0
      ? printOrder.items
      : [
          {
            name: "Giày bóng đá chính hãng",
            unit: "Đôi",
            quantity: printOrder?.totalQty || 1,
            unitPrice: Number(printOrder?.total || 0),
            lineTotal: Number(printOrder?.total || 0),
            note: "",
          },
        ];

  const totalQuantity = tableItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body * {
            visibility: hidden !important;
          }
          #shipping-label-sheet,
          #shipping-label-sheet * {
            visibility: visible !important;
          }
          #shipping-label-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh Sách Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cập nhật trạng thái vận chuyển và xuất phiếu giao hàng cho đơn vị ship
          </p>
        </div>

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
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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
                  <TableCell className="font-semibold text-gray-900">
                    {order.orderCode || `#${order.id}`}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-gray-500">{order.customerPhone}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">
                    {Number(order.total || 0).toLocaleString("vi-VN")} đ
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
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800 cursor-pointer"
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

      {/* Modal Phiếu Giao Hàng chuẩn mẫu bảng biểu */}
      {printOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-auto">
            <div
              id="shipping-label-sheet"
              className="bg-white text-black font-serif text-[13.5px] leading-relaxed p-4 border border-gray-300"
            >
              {/* Header công ty & Số Serial / Hóa đơn */}
              <div className="flex justify-between items-start gap-4 border-b border-gray-400 pb-3">
                <div className="space-y-0.5">
                  <p className="font-bold uppercase text-[14px]">
                    CÔNG TY TNHH SOCCERSTORE VIỆT NAM
                  </p>
                  <p>
                    <span className="font-bold">Địa chỉ:</span> Ngõ 93 Hoàng Quốc Việt, Phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội
                  </p>
                  <p>
                    <span className="font-bold">Điện thoại:</span> 0988.666.888 &nbsp;&nbsp;-&nbsp;&nbsp;
                    <span className="font-bold">Website:</span> soccerstore.vn
                  </p>
                </div>

                <div className="text-left shrink-0 border-l border-gray-400 pl-4 space-y-1 text-[13px]">
                  <p>
                    <span className="font-bold">Số Serial:</span> SS-2026/GH
                  </p>
                  <p>
                    <span className="font-bold">Số hóa đơn:</span>{" "}
                    {printOrder.orderCode || `#${printOrder.id}`}
                  </p>
                </div>
              </div>

              {/* Tiêu đề phiếu */}
              <div className="text-center my-4">
                <h2 className="text-2xl font-bold uppercase tracking-wide">
                  PHIẾU GIAO HÀNG
                </h2>
                <p className="italic text-[13px] mt-0.5">
                  Ngày {String(printDate.getDate()).padStart(2, "0")} tháng{" "}
                  {String(printDate.getMonth() + 1).padStart(2, "0")} năm{" "}
                  {printDate.getFullYear()}
                </p>
              </div>

              {/* Thông tin khách hàng */}
              <div className="space-y-1.5 mb-4 text-[13.5px]">
                <div className="grid grid-cols-[145px_1fr]">
                  <span className="font-bold">Khách hàng:</span>
                  <span className="border-b border-dotted border-gray-500 font-semibold">
                    {printOrder.customerName}
                  </span>
                </div>
                <div className="grid grid-cols-[145px_1fr]">
                  <span className="font-bold">Địa chỉ:</span>
                  <span className="border-b border-dotted border-gray-500">
                    {printOrder.shippingAddress || "Giao tận nơi"}
                  </span>
                </div>
                <div className="grid grid-cols-[145px_1fr]">
                  <span className="font-bold">Người nhận hàng:</span>
                  <div className="flex flex-wrap gap-x-6 border-b border-dotted border-gray-500">
                    <span>{printOrder.customerName}</span>
                    <span>
                      <strong className="font-bold">Số điện thoại:</strong>{" "}
                      {printOrder.customerPhone || "0900000000"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[145px_1fr]">
                  <span className="font-bold">Hình thức thanh toán:</span>
                  <span className="border-b border-dotted border-gray-500">
                    Thanh toán tiền mặt khi nhận hàng (COD)
                  </span>
                </div>
              </div>

              {/* Bảng chi tiết hàng hóa 7 cột */}
              <table className="w-full border-collapse border border-black text-[13px]">
                <thead>
                  <tr className="bg-[#dce6f1] text-black font-bold text-center">
                    <th className="border border-black py-1.5 px-2 w-10">Stt</th>
                    <th className="border border-black py-1.5 px-2">Tên mặt hàng</th>
                    <th className="border border-black py-1.5 px-2 w-14">Đvt</th>
                    <th className="border border-black py-1.5 px-2 w-20">Số lượng</th>
                    <th className="border border-black py-1.5 px-2 w-28">Đơn giá</th>
                    <th className="border border-black py-1.5 px-2 w-28">Thành tiền</th>
                    <th className="border border-black py-1.5 px-2 w-28">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {tableItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black py-1.5 px-2 text-center">{idx + 1}</td>
                      <td className="border border-black py-1.5 px-2 font-medium">{item.name}</td>
                      <td className="border border-black py-1.5 px-2 text-center">{item.unit}</td>
                      <td className="border border-black py-1.5 px-2 text-center">{item.quantity}</td>
                      <td className="border border-black py-1.5 px-2 text-right">
                        {Number(item.unitPrice || 0).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="border border-black py-1.5 px-2 text-right font-semibold">
                        {Number(item.lineTotal || 0).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="border border-black py-1.5 px-2 text-center">
                        {item.note || ""}
                      </td>
                    </tr>
                  ))}

                  {/* Dòng trống phụ cho cân đối mẫu phiếu nếu ít mặt hàng */}
                  {tableItems.length < 3 &&
                    Array.from({ length: 3 - tableItems.length }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="border border-black py-2 px-2 text-center text-gray-400">
                          {tableItems.length + i + 1}
                        </td>
                        <td className="border border-black py-2 px-2"></td>
                        <td className="border border-black py-2 px-2"></td>
                        <td className="border border-black py-2 px-2"></td>
                        <td className="border border-black py-2 px-2"></td>
                        <td className="border border-black py-2 px-2"></td>
                        <td className="border border-black py-2 px-2"></td>
                      </tr>
                    ))}

                  {/* Dòng Cộng */}
                  <tr className="bg-[#b8cce4] font-bold">
                    <td className="border border-black py-1.5 px-2"></td>
                    <td className="border border-black py-1.5 px-2 text-center">Cộng</td>
                    <td className="border border-black py-1.5 px-2"></td>
                    <td className="border border-black py-1.5 px-2 text-center">{totalQuantity}</td>
                    <td className="border border-black py-1.5 px-2"></td>
                    <td className="border border-black py-1.5 px-2 text-right">
                      {Number(printOrder.total || 0).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="border border-black py-1.5 px-2"></td>
                  </tr>
                </tbody>
              </table>

              {/* Thành tiền viết bằng chữ */}
              <div className="mt-3 text-[13.5px]">
                <span className="font-bold">Thành tiền (viết bằng chữ):</span>{" "}
                <span className="italic border-b border-dotted border-gray-500">
                  {numberToVietnameseWords(printOrder.total)}
                </span>
              </div>

              {/* 3 cột chữ ký */}
              <div className="grid grid-cols-3 text-center mt-5 pb-12 text-[13.5px]">
                <div>
                  <p className="font-bold">Người nhận hàng</p>
                  <p className="italic text-[12px]">(Ký và ghi họ tên)</p>
                </div>
                <div>
                  <p className="font-bold">Người giao hàng</p>
                  <p className="italic text-[12px]">(Ký và ghi họ tên)</p>
                </div>
                <div>
                  <p className="font-bold">Người lập phiếu</p>
                  <p className="italic text-[12px]">(Ký và ghi họ tên)</p>
                </div>
              </div>
            </div>

            <div className="no-print flex gap-3 justify-end">
              <button
                onClick={() => setPrintOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 cursor-pointer"
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
