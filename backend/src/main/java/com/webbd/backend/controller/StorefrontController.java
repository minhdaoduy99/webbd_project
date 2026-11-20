package com.webbd.backend.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webbd.backend.dto.storefront.CategoryTreeDTO;
import com.webbd.backend.dto.storefront.ProductCardDTO;
import com.webbd.backend.entity.Brand;
import com.webbd.backend.entity.Category;
import com.webbd.backend.entity.Product;
import com.webbd.backend.entity.ProductImage;
import com.webbd.backend.entity.ProductVariant;
import com.webbd.backend.repository.BrandRepository;
import com.webbd.backend.repository.CategoryRepository;
import com.webbd.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class StorefrontController {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @GetMapping("/categories")
    public List<CategoryTreeDTO> getCategoryTree() {
        List<Category> all = categoryRepository.findAllByOrderByIdAsc();
        Map<Long, CategoryTreeDTO> map = new LinkedHashMap<>();
        for (Category c : all) {
            if (c.getParentId() == null) {
                map.put(c.getId(), new CategoryTreeDTO(c.getId(), c.getName(), c.getSlug(), new ArrayList<>()));
            }
        }
        for (Category c : all) {
            if (c.getParentId() != null && map.containsKey(c.getParentId())) {
                map.get(c.getParentId()).getChildren().add(
                        new CategoryTreeDTO(c.getId(), c.getName(), c.getSlug(), new ArrayList<>())
                );
            }
        }
        return new ArrayList<>(map.values());
    }

    @GetMapping("/brands")
    public List<Brand> getBrands() {
        return brandRepository.findAllByOrderByIdAsc();
    }

    @GetMapping("/products")
    public List<ProductCardDTO> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String groundType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        List<Product> products;
        if (categoryId != null) {
            List<Long> catIds = new ArrayList<>();
            catIds.add(categoryId);
            List<Category> children = categoryRepository.findByParentId(categoryId);
            for (Category child : children) {
                catIds.add(child.getId());
            }
            products = productRepository.findByCategoriesAndFilters(catIds, brandId, size, groundType, minPrice, maxPrice, keyword);
        } else {
            products = productRepository.findAllByFilters(brandId, size, groundType, minPrice, maxPrice, keyword);
        }

        if ("price_asc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getBasePrice));
        } else if ("price_desc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getBasePrice).reversed());
        } else {
            products.sort(Comparator.comparing(Product::getId).reversed());
        }

        return products.stream().map(this::toCardDTO).collect(Collectors.toList());
    }

    private ProductCardDTO toCardDTO(Product p) {
        String thumb = p.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> p.getImages().isEmpty() ? "" : p.getImages().get(0).getImageUrl());

        List<String> availableSizes = p.getVariants().stream()
                .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0)
                .map(ProductVariant::getSize)
                .distinct()
                .collect(Collectors.toList());

        List<String> outOfStockSizes = p.getVariants().stream()
                .filter(v -> v.getStockQuantity() == null || v.getStockQuantity() <= 0)
                .map(ProductVariant::getSize)
                .filter(sz -> !availableSizes.contains(sz))
                .distinct()
                .collect(Collectors.toList());

        List<String> lowStockSizes = p.getVariants().stream()
                .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0 && v.getStockQuantity() <= 5)
                .map(v -> v.getSize() + " (còn " + v.getStockQuantity() + ")")
                .distinct()
                .collect(Collectors.toList());

        List<String> grounds = p.getVariants().stream()
                .map(ProductVariant::getGroundType)
                .distinct()
                .collect(Collectors.toList());

        int stock = p.getVariants().stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();

        int disc = p.getDiscountPercent() != null ? p.getDiscountPercent() : 0;
        BigDecimal sale = p.getBasePrice().multiply(BigDecimal.valueOf(100 - disc)).divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP);
        return new ProductCardDTO(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getBrand().getName(),
                p.getBrand().getId(),
                p.getCategory().getName(),
                p.getCategory().getId(),
                p.getBasePrice(),
                disc,
                sale,
                thumb,
                availableSizes,
                outOfStockSizes,
                lowStockSizes,
                grounds,
                stock
        );
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/products/{id}")
    public org.springframework.http.ResponseEntity<?> getPublicProductDetail(@PathVariable("id") Long id) {
        try {
            Product p = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));

            String thumb = "";
            if (p.getImages() != null && !p.getImages().isEmpty()) {
                thumb = p.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(p.getImages().get(0).getImageUrl());
            }

            int discount = p.getDiscountPercent() != null ? p.getDiscountPercent() : 0;
            BigDecimal base = p.getBasePrice() != null ? p.getBasePrice() : BigDecimal.ZERO;
            BigDecimal sale = discount > 0
                    ? base.multiply(BigDecimal.valueOf(100 - discount)).divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP)
                    : base;

            List<Map<String, Object>> variants = new ArrayList<>();
            if (p.getVariants() != null) {
                for (ProductVariant v : p.getVariants()) {
                    Map<String, Object> vm = new LinkedHashMap<>();
                    vm.put("id", v.getId());
                    vm.put("sku", v.getSku());
                    vm.put("color", v.getColor());
                    vm.put("size", v.getSize());
                    vm.put("groundType", v.getGroundType());
                    vm.put("price", v.getPrice());
                    vm.put("stock", v.getStockQuantity() != null ? v.getStockQuantity() : 0);
                    variants.add(vm);
                }
            }

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("id", p.getId());
            res.put("name", p.getName());
            res.put("brandName", p.getBrand() != null ? p.getBrand().getName() : "SoccerStore");
            res.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : "Thể thao");
            res.put("basePrice", base);
            res.put("salePrice", sale);
            res.put("discountPercent", discount);
            res.put("thumbnailUrl", thumb);
            res.put("variants", variants);

            return org.springframework.http.ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500).body(Map.of("error", e.toString()));
        }
    }
}
