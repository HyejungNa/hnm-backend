const express = require("express");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const router = express.Router();

// 미들웨어
router.post(
  "/",
  authController.authenticate, // 토큰값 받기
  authController.checkAdminPermission, // 토큰값으로 admin 여부 확인
  productController.createProduct
);

module.exports = router;
