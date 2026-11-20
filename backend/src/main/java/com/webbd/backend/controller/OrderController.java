package com.webbd.backend.controller;

import com.webbd.backend.entity.Order;
import com.webbd.backend.entity.OrderItem;
import com.webbd.backend.entity.ProductVariant;
import com.webbd.backend.repository.OrderItemRepository;
import com.webbd.backend.repository.OrderRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;

    @PersistenceContext
    private EntityManager em;

    @PostMapping("/api/v1/public/orders")
    @Transactional
    public ResponseEntity create(@RequestBody Map b) {
        Order o = new Order();
        o.setOrderCode("ORD-" + System.currentTimeMillis());
        o.setCustomerName(String.valueOf(b.get("customerName")));
        o.setCustomerPhone(String.valueOf(b.get("customerPhone")));
        o.setShippingAddress(String.valueOf(b.get("shippingAddress")));
        o.setOrderStatus("PENDING");
        o.setPaymentStatus("PENDING");
        o.setPaymentMethod("COD");
        o.setCreatedAt(LocalDateTime.now());
        o.setTotalAmount(BigDecimal.ZERO);
        o = orderRepo.save(o);

        BigDecimal total = BigDecimal.ZERO;
        List items = (List) b.get("items");
        if (items != null) {
            for (Object obj : items) {
                Map it = (Map) obj;
                Long pid = Long.valueOf(String.valueOf(it.get("id")));
                int qty = Integer.parseInt(String.valueOf(it.get("quantity")));
                BigDecimal price = new BigDecimal(String.valueOf(it.get("price")));
                String size = String.valueOf(it.get("size"));

                List vs = em.createQuery("SELECT v FROM ProductVariant v WHERE v.product.id = :p AND v.size = :s")
                    .setParameter("p", pid)
                    .setParameter("s", size)
                    .getResultList();

                if (vs.isEmpty()) {
                    vs = em.createQuery("SELECT v FROM ProductVariant v WHERE v.product.id = :p")
                        .setParameter("p", pid)
                        .getResultList();
                }

                if (!vs.isEmpty()) {
                    ProductVariant v = (ProductVariant) vs.get(0);
                    int cur = v.getStockQuantity() != null ? v.getStockQuantity() : 0;
                    v.setStockQuantity(Math.max(0, cur - qty));
                    em.merge(v);

                    OrderItem oi = new OrderItem();
                    oi.setOrder(o);
                    oi.setVariant(v);
                    oi.setQuantity(qty);
                    oi.setUnitPrice(price);
                    itemRepo.save(oi);
                }
                total = total.add(price.multiply(BigDecimal.valueOf(qty)));
            }
        }

        o.setTotalAmount(total);
        orderRepo.save(o);
        return ResponseEntity.ok(Map.of("id", o.getId(), "orderCode", o.getOrderCode()));
    }

    @GetMapping("/api/v1/admin/orders")
    @Transactional(readOnly = true)
    public List list() {
        List res = new ArrayList();
        for (Order o : orderRepo.findAllByOrderByCreatedAtDesc()) {
            List oiList = em.createQuery("SELECT oi FROM OrderItem oi WHERE oi.order.id = :oid")
                .setParameter("oid", o.getId())
                .getResultList();

            List detailItems = new ArrayList();
            int totalQty = 0;

            for (Object obj : oiList) {
                OrderItem oi = (OrderItem) obj;
                int q = oi.getQuantity() != null ? oi.getQuantity() : 1;
                totalQty += q;
                String pName = "Giày bóng đá chính hãng";
                String pSize = "";
                if (oi.getVariant() != null) {
                    pSize = oi.getVariant().getSize() != null ? oi.getVariant().getSize() : "";
                    if (oi.getVariant().getProduct() != null && oi.getVariant().getProduct().getName() != null) {
                        pName = oi.getVariant().getProduct().getName();
                    }
                }
                BigDecimal uPrice = oi.getUnitPrice() != null ? oi.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal lTotal = uPrice.multiply(BigDecimal.valueOf(q));

                Map itemMap = new LinkedHashMap();
                itemMap.put("name", pName + (pSize.isEmpty() ? "" : " (Size " + pSize + ")"));
                itemMap.put("unit", pName.toLowerCase().contains("lót") || pName.toLowerCase().contains("giày") || pName.toLowerCase().contains("tất") ? "Đôi" : "Cái");
                itemMap.put("quantity", q);
                itemMap.put("unitPrice", uPrice);
                itemMap.put("lineTotal", lTotal);
                itemMap.put("note", "");
                detailItems.add(itemMap);
            }

            if (detailItems.isEmpty()) {
                Map fallback = new LinkedHashMap();
                fallback.put("name", "Giày bóng đá chính hãng");
                fallback.put("unit", "Đôi");
                fallback.put("quantity", 1);
                fallback.put("unitPrice", o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);
                fallback.put("lineTotal", o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);
                fallback.put("note", "");
                detailItems.add(fallback);
            }

            Map m = new LinkedHashMap();
            m.put("id", String.valueOf(o.getId()));
            m.put("orderCode", o.getOrderCode());
            m.put("customerName", o.getCustomerName());
            m.put("customerPhone", o.getCustomerPhone());
            m.put("shippingAddress", o.getShippingAddress());
            m.put("total", o.getTotalAmount());
            m.put("status", o.getOrderStatus());
            m.put("createdAt", String.valueOf(o.getCreatedAt()));
            m.put("totalQty", totalQty > 0 ? totalQty : 1);
            m.put("items", detailItems);
            res.add(m);
        }
        return res;
    }

    @PatchMapping("/api/v1/admin/orders/{id}")
    public ResponseEntity patch(@PathVariable Long id, @RequestBody Map b) {
        Order o = orderRepo.findById(id).orElseThrow();
        o.setOrderStatus(String.valueOf(b.get("status")));
        orderRepo.save(o);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
