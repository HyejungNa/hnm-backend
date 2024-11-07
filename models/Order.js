const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User, required: true }, // 토큰값 사용
    status: {
      type: String,
      default: "preparing", // order받으면 우선 기본값 preparing으로 되도록 설정
    },
    totalPrice: { type: Number, required: true, default: 0 }, // payment페이지에서 받을정보
    shipTo: { type: Object, required: true }, // payment페이지에서 받을정보: address + city + zip
    contact: { type: Object, required: true }, // payment페이지에서 받을정보: last & first name + contact number
    orderNum: { type: String }, // 유저에게 보여주는 주문번호 (오더생성후 만들어진번호)
    items: [
      // 여러개의 아이템을 주문할수있기에 배열에받아주기
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
  // delete obj.createdAt; // *** 생성날짜를 제거한채로 프론트에보냈더니 my order페이지의 주문내역들이 화면에 렌더링되지않는 오류발생
  return obj; // 위의조건들을 모두 제거한후 object를 리턴함
};

// 카트 비워주기
orderSchema.post("save", async function () {
  // 오더가 save된후에는 카트를 비워주기
  const cart = await Cart.findOne({ userId: this.userId }); // 내 카트를 찾아준후
  cart.items = []; // 찾은 카트를 비워주고
  await cart.save(); // 저장해주기
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
