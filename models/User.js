const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: String, default: "customer" }, // 2types: customer, admin
  },
  { timestamps: true }
);
userSchema.methods.toJSON = function () {
  const obj = this._doc; // _doc은 현재 mongoose 문서에서 모든 데이터를 담고있는 객체를 가리킴
  delete obj.password; // 백엔드에서 프론토엔드로 갈때 패스워드 항상 제외
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj; // 위의조건들을 모두 제거한후 object를 리턴함
};

const User = mongoose.model("User", userSchema);
module.exports = User;
