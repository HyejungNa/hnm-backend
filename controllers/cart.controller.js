const Cart = require("../models/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId: userId });
    // 유저가 만든 카트가 없으면 => 만들어주기
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가있는 아이템이냐? ->  productId, size 2개를 다 체크해야함
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    // 그렇다면 에러메시지 ("이미 아이템이 카트에 있습니다")
    if (existItem) {
      throw new Error("The item is already in the cart.");
    }
    // 새로운 아이템이면 카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 카트 아이템 가져오기
cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      // populate사용시 외래키를통해 추가정보를 같이들고올수있음
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 카트 아이템 삭제하기
cartController.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));

    await cart.save();
    res.status(200).json({ status: 200, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 카트 아이템 수정하기
cartController.updateQty = async (req, res, next) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });

    if (!cart) {
      const error = new Error("There is no cart for this user.");
      error.status = 400;
      return next(error);
    }

    const index = cart.items.findIndex((item) => item._id.equals(id));

    if (index === -1) {
      const error = new Error("Can not find item.");
      error.status = 400;
      return next(error);
    }
    cart.items[index].qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

// 카트의 전체아이템 총 갯수 가져오기
cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new Error("There is no cart!");
    res.status(200).json({ status: 200, qty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
