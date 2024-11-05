const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");
const router = express.Router();

// 남이아닌 본인만 주문할수있어야하기에 미들웨어로 authenticate 필요
router.post("/", authController.authenticate, orderController.createOrder);

module.exports = router;
