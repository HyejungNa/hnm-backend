const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

// 회원가입
router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser); // 토큰이 valid한 토큰인지(1.expire,2.유저찾기가능한지), 이 token값을 가지고 유저를 찾아서 리턴 (미들웨어 구조)

module.exports = router;
