/* <깃헙 리포복구> */
const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

// 남이아닌 본인만 주문할수있어야하기에 미들웨어로 authenticate 필요
router.post("/", authController.authenticate, orderController.createOrder);

// 개인유저가 주문한 내역 확인하는 my order
router.get("/me", authController.authenticate, orderController.getOrder);

// admin page에서 order list
router.get("/", authController.authenticate, orderController.getOrderList);

router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder,
  orderController.getOrderList
);

module.exports = router;
