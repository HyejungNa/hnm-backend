const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    status: {
      type: String,
      default: "preparing",
    },
    totalPrice: { type: Number, required: true, default: 0 },
    shipTo: { type: Object, required: true },
    contact: { type: Object, required: true },
    orderNum: { type: String },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        price: {
          type: Number,
          required: true,
        },
        qty: { type: Number, default: 1, required: true },
        size: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc; // _doc은 현재 mongoose 문서에서 모든 데이터를 담고있는 객체를 가리킴
  delete obj.__v;
  delete obj.updatedAt;
  delete obj.createdAt;
  return obj; // 위의조건들을 모두 제거한후 object를 리턴함
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
