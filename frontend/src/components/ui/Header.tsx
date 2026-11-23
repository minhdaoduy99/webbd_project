"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

const MENU_ITEMS = [
  {
    title: "Sản Phẩm",
    href: "/san-pham",
    subItems: [
      { name: "Tất cả sản phẩm", href: "/san-pham" },
      { name: "Hàng mới về", href: "/san-pham/moi-ve" },
      { name: "Bán chạy nhất", href: "/san-pham/ban-chay" },
    ],
  },
  {
    title: "Giày Bóng Đá",
    href: "/giay-bong-da",
    subItems: [
      { name: "Giày Cỏ Nhân Tạo (TF)", href: "/giay-bong-da/co-nhan-tao" },
      { name: "Giày Cỏ Tự Nhiên (FG/AG)", href: "/giay-bong-da/co-tu-nhien" },
      { name: "Giày Futsal (IC)", href: "/giay-bong-da/futsal" },
    ],
  },
  {
    title: "Thương Hiệu",
    href: "/thuong-hieu",
    subItems: [
      { name: "Nike", href: "/thuong-hieu/nike" },
      { name: "Adidas", href: "/thuong-hieu/adidas" },
      { name: "Puma", href: "/thuong-hieu/puma" },
      { name: "Mizuno", href: "/thuong-hieu/mizuno" },
      { name: "Jordan", href: "/thuong-hieu/jordan" },
    ],
  },
  {
    title: "Phụ Kiện",
    href: "/phu-kien",
    subItems: [
      { name: "Tất chống trượt", href: "/phu-kien/tat" },
      { name: "Bọc ống đồng", href: "/phu-kien/boc-ong-dong" },
      { name: "Bóng thi đấu", href: "/phu-kien/bong" },
      { name: "Túi đựng giày", href: "/phu-kien/tui-giay" },
    ],
  },
  {
    title: "Dịch vụ",
    href: "/dich-vu",
    subItems: [
      { name: "In tên & số áo", href: "/dich-vu/in-an" },
      { name: "Vệ sinh & khâu đế giày", href: "/dich-vu/sua-chua" },
    ],
  },
  {
    title: "Clear Stock",
    href: "/clear-stock",
    isHighlight: true,
  },
  {
    title: "Hướng dẫn",
    href: "/huong-dan",
    subItems: [
      { name: "Bảng quy đổi size giày", href: "/huong-dan/chon-size" },
      { name: "Chính sách đổi trả miễn phí", href: "/huong-dan/doi-tra" },
      { name: "Hướng dẫn mua hàng", href: "/huong-dan/mua-hang" },
    ],
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="w-full shadow-sm">
      {/* Thanh Danh Mục Sản Phẩm nền tối */}
      <nav className="hidden md:block bg-[#18191c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-8 h-12 text-sm font-medium">
            {MENU_ITEMS.map((item, index) => (
              <li key={index} className="relative group h-full flex items-center">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 transition-colors ${
                    item.isHighlight
                      ? "text-[#ef4444] font-semibold hover:text-red-400"
                      : "text-gray-100 hover:text-indigo-400"
                  }`}
                >
                  <span>{item.title}</span>
                  {item.subItems && (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                  )}
                </Link>

                {item.subItems && (
                  <div className="absolute left-0 top-full w-56 bg-white text-gray-800 rounded-b-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <ul className="py-2">
                      {item.subItems.map((sub, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            href={sub.href}
                            className="block px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Nút & Menu Mobile */}
      <div className="md:hidden bg-[#18191c] text-white px-4 py-2 flex justify-between items-center">
        <span className="text-sm font-medium">Danh mục sản phẩm</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#18191c] text-white px-4 pt-2 pb-4 space-y-2 border-t border-gray-800">
          {MENU_ITEMS.map((item, idx) => (
            <div key={idx} className="py-1">
              <Link
                href={item.href}
                className={`block font-medium py-1 ${
                  item.isHighlight ? "text-red-500" : "text-white"
                }`}
              >
                {item.title}
              </Link>
              {item.subItems && (
                <div className="pl-4 space-y-1 mt-1 border-l border-gray-700">
                  {item.subItems.map((sub, sIdx) => (
                    <Link
                      key={sIdx}
                      href={sub.href}
                      className="block text-xs text-gray-300 py-1 hover:text-white"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}