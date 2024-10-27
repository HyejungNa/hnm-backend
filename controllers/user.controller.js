const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    // 회원가입시 이메일 중복 확인
    const user = await User.findOne({ email: email });
    if (user) {
      throw new Error("User already exist");
    }

    // 비밀번호 암호화
    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    return res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    // 유저가 찾아지지않을때조건을 먼저찾아 더이상 요청하지않도록 변경
    if (!user) {
      throw new Error("can not find user");
    }
    res.status(200).json({ status: "success", user });

    // 계속 중복 요청을해서 ERR_HTTP_HEADERS_SENT에러발생시킴 (* only one response is sent per request!)
    // if (user) {
    //   res.status(200).json({ status: "success", user });
    // }
    // throw new Error("invalid token");
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
};

module.exports = userController;
