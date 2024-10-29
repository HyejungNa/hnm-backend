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

    // 유저가 발견되지않았을때를 먼저찾아 404응답을 보내고 즉시종료해서 이후코드가 실행되지않아 중복으로 요청하지않도록 변경
    if (!user) {
      throw new Error("can not find user");
    }
    // 유저가 발견된 경우에만 성공 응답을 보냄
    res.status(200).json({ status: "success", user });

    // if (user) {
    ///// 유저가 발견된 경우 성공 응답을 보냄
    //   res.status(200).json({ status: "success", user });
    // }
    ///// 유저가 발견되지 않은 경우에 대한 처리가 없음
    // throw new Error("invalid token"); // 여기서 에러가 발생
    // (* only one response is sent per request!)
  } catch (error) {
    // 에러 발생 시 400 응답을 보내는 처리
    res.status(400).json({ status: "error", error: error.message });
  }
};

module.exports = userController;
