const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { GoogleAuth, OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // token
        const token = await user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("invalid email or password");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    // 4. 백엔드에서 로그인하기
    //   토큰값을 읽어와서 => 유저정보를 뽑아내고 (email)
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    // console.log("eee", email, name);

    // 유저 존재 구분
    //   a. 이미 로그인을 한적이 있는 유저 => 로그인 시키고 토큰값 주면완료
    //   b. 처음 로그인 시도를 한 유저 => 유저정보 먼저 새로 생성 => 토큰값 넘겨주기
    let user = await User.findOne({ email });
    if (!user) {
      // 유저가 없을시 => 유저를 새로 생성 (User스키마에서 필요했던값 그대로 필요)
      const randomPassword = "" + Math.floor(Math.random() * 100000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name: name,
        email: email,
        password: newPassword,
        // level은 customer로 이미 default설정되어있음
      });
      await user.save();
    }
    // 유저가 있을시 => 토큰발행 리턴
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "success", user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 토큰값으로 유저찾아내기, 중간에 사용되기에(미들웨어) next사용함
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("invalid token");
      req.userId = payload._id;
    });
    next(); // 미들웨어에서의 다음 함수(checkAdminPermission)로 넘어가게끔해줌 (user.api.js파일안 userController.getUser함수로 넘어가게됨)
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    // 토큰값으로 admin인지 구별가능
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") throw new Error("No permission");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
