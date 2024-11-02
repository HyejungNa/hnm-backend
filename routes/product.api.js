const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

// 상품 생성하기 (미들웨어사용 - 상품생성전 admin체크 필수)
router.post(
  "/",
  authController.authenticate, // 토큰값 받기
  authController.checkAdminPermission, // 토큰값으로 admin 여부 확인
  productController.createProduct
);

// 상품 보여주기
router.get("/", productController.getProducts);

// 상품 수정하기 (상품 수정전 admin 체크필수)
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

// 상품 삭제하기
router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

// 상품 상세페이지
router.get("/:id", productController.getProductDetail);

module.exports = router;
