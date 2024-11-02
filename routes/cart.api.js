const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");

router.post("/", authController.authenticate, cartController.addItemToCart); // 토큰값으로 유저의 로그인여부를 확인후 -> 카트에 아이템 넣기
module.exports = router;
