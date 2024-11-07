/* <깃헙 리포 복구> */
const orderController = {};
const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 데이터 보낸거 받아오기 userId,totalPrice,shopTo,contact,orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    // 재고확인 & 재고 업데이트 (order전에 필요함)
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    // 재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        // (total, item) => (total += item.message),
        (total, item) => (total += item.message + "\n"),
        ""
      );
      throw new Error(errorMessage);
    }

    // 재고가 충분할경우 order만들기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(), // 랜덤한 오더넘버 만들어주는 함수
    });

    // 새 오더 save해주기
    await newOrder.save();
    // save후에 카트를 비워주기

    // 주문 완료후 생성된 오더넘버 넘겨주기
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: { path: "productId", model: "Product" },
    });
    res.status(200).json({ status: "success", data: orderList });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;

// *<my order페이지는 보이지만 주문리스트를 받아오지 못하고있음>*
// const orderController = {};
// const Order = require("../models/Order");
// const productController = require("./product.controller");
// const { randomStringGenerator } = require("../utils/randomStringGenerator");

// orderController.createOrder = async (req, res) => {
//   try {
//     // 프론트엔드에서 데이터 보낸거 받아오기 userId,totalPrice,shopTo,contact,orderList
//     const { userId } = req;
//     const { shipTo, contact, totalPrice, orderList } = req.body;

//     // 재고확인 & 재고 업데이트 (order전에 필요함)
//     const insufficientStockItems = await productController.checkItemListStock(
//       orderList
//     );

//     // 재고가 충분하지 않는 아이템이 있었다 => 에러(재고 감소 없이 종료)
//     if (insufficientStockItems.length > 0) {
//       const errorMessage = insufficientStockItems.reduce(
//         // (total, item) => (total += item.message),
//         (total, item) => (total += item.message + "\n"),
//         ""
//       );
//       throw new Error(errorMessage);
//     }

//     // 재고가 충분할경우 order만들기
//     const newOrder = new Order({
//       userId,
//       totalPrice,
//       shipTo,
//       contact,
//       items: orderList,
//       orderNum: randomStringGenerator(), // 랜덤한 오더넘버 만들어주는 함수
//     });

//     // 새 오더 save해주기
//     await newOrder.save();
//     // save후에 카트를 비워주기

//     // 주문 완료후 생성된 오더넘버 넘겨주기
//     res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
//   } catch (error) {
//     return res.status(400).json({ status: "fail", error: error.message });
//   }
// };

// // My order page
// orderController.getOrder = async (req, res, next) => {
//   try {
//     const { userId } = req;

//     const orderList = await Order.find({ userId: userId }).populate({
//       path: "items",
//       populate: {
//         path: "productId",
//         model: "Product",
//         select: "image name",
//       },
//     });
//     // const totalItemNum = await Order.find({ userId: userId }).count();
//     const totalItemNum = await Order.find({ userId: userId }).countDocuments();

//     const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
//     res.status(200).json({ status: "success", data: orderList, totalPageNum });
//   } catch (error) {
//     return res.status(400).json({ status: "fail", error: error.message });
//   }
// };

// orderController.getOrderList = async (req, res, next) => {
//   try {
//     const { page, ordernum } = req.query;

//     let cond = {};
//     if (ordernum) {
//       cond = {
//         orderNum: { $regex: ordernum, $options: "i" },
//       };
//     }

//     const orderList = await Order.find(cond)
//       .populate("userId")
//       .populate({
//         path: "items",
//         populate: {
//           path: "productId",
//           model: "Product",
//           select: "image name",
//         },
//       })
//       .skip((page - 1) * PAGE_SIZE)
//       .limit(PAGE_SIZE);
//     // const totalItemNum = await Order.find(cond).count();
//     const totalItemNum = await Order.find(cond).countDocuments();

//     const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
//     res.status(200).json({ status: "success", data: orderList, totalPageNum });
//   } catch (error) {
//     return res.status(400).json({ status: "fail", error: error.message });
//   }
// };

// orderController.updateOrder = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const order = await Order.findByIdAndUpdate(
//       id,
//       { status: status },
//       { new: true }
//     );
//     if (!order) throw new Error("Can't find order");

//     res.status(200).json({ status: "success", data: order });
//   } catch (error) {
//     return res.status(400).json({ status: "fail", error: error.message });
//   }
// };

// module.exports = orderController;
