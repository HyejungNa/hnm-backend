const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");

// 토큰값으로 유저의 로그인여부를 확인후 -> 카트에 아이템 넣기
router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getCart);

// 카트 아이템 삭제하기
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);

// 카트 아이템 수정하기
router.put("/:id", authController.authenticate, cartController.updateQty);

// 카트의 전체아이템 총 갯수 가져오기
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
