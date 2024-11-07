/* <깃헙 리포복구> */
const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

// 남이아닌 본인만 주문할수있어야하기에 미들웨어로 authenticate 필요
router.post("/", authController.authenticate, orderController.createOrder);

router.get("/me", authController.authenticate, orderController.getOrder);

// router.get("/", authController.authenticate, orderController.getOrderList);
// router.put(
//   "/:id",
//   authController.authenticate,
//   authController.checkAdminPermission,
//   orderController.updateOrder,
//   orderController.getOrderList
// );

module.exports = router;
