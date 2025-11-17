const Product = require("../models/Product");
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 강의 코드 <실행시 에러>
// productController.getProducts = async (req, res) => {
//   try {
//     const { page, name } = req.query;
//     const cond = name ? { name: { $regex: name, $options: "i" } } : {};
//     let response = { status: "success" };
//     let query = Product.find(cond);

//     // 페이지네이션 로직
//     if (page) {
//       query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
//       // 최종 몇개 페이지 (데이터 총 개수 / PAGE_SIZE)
//       const totalItemNum = await Product.find(cond).count();
//       const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
//       response.totalPageNum = totalPageNum;
//     }
//     const productList = await query.exec(); // 위에서만든 쿼리를 따로실행시키기
//     response.data = productList;
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(400).json({ status: "fail", error: error.message });
//   }
// };

// url 쿼리를 통해 데이터를 가져오는 함수
productController.getProducts = async (req, res) => {
  try {
    const PAGE_SIZE = 8;
    const { page, name, category } = req.query;

    // 검색 기본 조건 : 삭제되지 않은 상품만
    const cond = { isDeleted: false };

    if (name) {
      cond.name = { $regex: name, $options: "i" };
    }

    if (category) {
      cond.category = { $in: [new RegExp(category, "i")] };
    }

    let response = { status: "success" };
    let query = Product.find(cond);

    // Pagination logic
    if (page) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res
          .status(400)
          .json({ status: "fail", error: "Invalid page number" });
      }
      query.skip((pageNum - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      // Get total item count
      const totalItemNum = await Product.countDocuments(cond);
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    // 상픔 조회
    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (error) {
    // console.error(error); // Log the error
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // product.api에서 이미 id값을 받아오고있음
    const {
      sku,
      name,
      size,
      image,
      price,
      description,
      category,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { sku, name, size, image, price, description, category, stock, status },
      { new: true } // 업데이트한 후 새로운값을 반환해줌
    );
    if (!product) throw new Error("item doesn't exist");
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    // findByIdAndUpdate 대신 db에서도 실제로 삭제되도록 메소드 변경
    const product = await Product.findByIdAndDelete(
      { _id: productId },
      { isDeleted: true }
    );
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success" });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 상품 상세페이지
productController.getProductDetail = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productDetail = await Product.findById({ _id: productId });
    if (!productDetail) {
      const error = new Error("No item found.");
      error.status = 400;
      return next(error);
    }

    res.status(200).json({ status: "success", data: productDetail });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

// < 주문완료시 재고처리에 오류 >
// // 오더하기전 아이템 하나씩 가져와서 재고 체크
// productController.checkStock = async (item) => {
//   // 내가 사려는 아이템 재고 정보 들고오기
//   const product = await Product.findById(item.productId);
//   // 내가 사려는 아이템 qty, 재고 비교
//   if (product.stock[item.size] < item.qty) {
//     // 재고가 불충분하면 불충분 메시지와 함께 데이터 반환
//     return {
//       isVerify: false,
//       // message: `${product.name}의 ${item.size}재고가 부족합니다`,
//       message: `The stock of '${product.name}' in size '${item.size}' is insufficient.`,
//     };
//   }

//   // 아이템의 재고가 충분하다면 실행
//   const newStock = { ...product.stock };
//   newStock[item.size] -= item.qty;
//   product.stock = newStock;

//   await product.save();
//   // 충분하다면, 재고에서 qty를 빼고 성공결과를 보내기
//   return { isVerify: true };
// };

// 오더하기전 전체 아이템 리스트 체크하기
// productController.checkItemListStock = async (itemList) => {
//   const insufficientStockItems = []; // 재고가 불충분한 아이템을 저장할 예정

//   // 재고 확인 로직
//   await Promise.all(
//     itemList.map(async (item) => {
//       const stockCheck = await productController.checkStock(item);
//       if (!stockCheck.isVerify) {
//         insufficientStockItems.push({ item, message: stockCheck.message });
//       }
//       return stockCheck;
//     })
//   ); // 비동기(await)를 여러개 사용시 한번에 처리하고싶을때 Promise.all사용

//   return insufficientStockItems;
// };

//////////////////////////////////////////////////////////////////////////////////

// < 주문완료시 재고처리 오류나는거 해결 >
// => 여러아이템에대해 재고를 한번에 업데이트할때 재고차감을 최종적으로 한번에 처리하게 변경 (위 오류나는코드에서는 checkStock에서 재고확인후 바로 차감을 했지만, 여기에선 checkStock으로 재고를 확인만 한후, 모든 아이템이 확인된후에 reduceStock에서 한번에 재고차감함)

// 오더하기전 유저의 전체 주문 아이템(아이템리스트)의 재고를 checkStock을 호출하여 한 번에 확인 (위의 checkStock함수가 비동기적으로 실행됨으로, promise.all사용해 모든아이템을 체크)
productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = []; // 재고가 불충분한 아이템을 저장할 예정

  // itemList의 모든 아이템에 대해 비동기적으로 재고 확인을 진행
  await Promise.all(
    // 여러 개의 비동기async 작업을 병렬로 처리하기 위해 Promise.all 사용
    itemList.map(async (item) => {
      // checkStock 함수를 호출하여, 각 아이템의 재고를 확인
      const stockCheck = await productController.checkStock(item);

      // itemList에 있는 각 item에 대해 개별적으로 재고를 확인후, 재고가 부족한 item을 insufficientStockItems배열에 추가(수집)하기위해 필요
      // 재고가 부족한 경우
      if (!stockCheck.isVerify) {
        // 부족한 아이템과 메시지를 insufficientStockItems 배열에 저장하고, 차감하지는 않음
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
    })
  );

  // 모든 item에 대한 전체 재고확인후, 부족한 재고가 있는지 최종적으로 판단하기위해 필요 (재고가 부족한 아이템이 있으면 부족한 아이템 목록을 반환)
  if (insufficientStockItems.length > 0) {
    return insufficientStockItems; // 재고가 부족한 아이템리스트를 즉시 반환
  }

  // 모든 아이템의 재고가 충분하면, reduceStock을 호출하여 itemList의 각 아이템에 대해 재고 차감을 진행
  await productController.reduceStock(itemList);
  return []; // 재고 차감이 성공하면 빈 배열 반환
};

// 개별 아이템의 재고가 충분한지 하나씩 확인(재고가 충분할경우 바로 재고를 차감하지않고 단지 확인만 함)
productController.checkStock = async (item) => {
  // 내가 사려는 아이템 재고 정보를 Product모델에서 찾음
  const product = await Product.findById(item.productId);
  // 내가 사려는 아이템의 각 사이즈별로 재고(qty)가 충분한지 체크해야함
  if (product.stock[item.size] < item.qty) {
    // 재고가 부족하면, 부족하다는 메시지반환
    return {
      isVerify: false,
      // message: `${product.name}의 ${item.size}재고가 부족합니다`,
      message: `The stock of '${product.name}' in size '${item.size}' is insufficient.`,
    };
  }

  // 재고가 충분하다면, 여기서 재고(qty)차감은 하지않고 성공결과를 보냄
  return { isVerify: true };
};

// 모든 아이템의 재고가 충분한지 확인후 실행 : 한번에 모든 상품의 재고를 차감함 (각 상품을 찾고, 해당 상품의 재고 정보를 가져온 후, 구매 수량만큼 차감하여 상품 정보를 갱신하고 저장)
productController.reduceStock = async (itemList) => {
  // itemList 배열을 순회하면서 각 아이템의 재고를 차감
  for (const item of itemList) {
    const product = await Product.findById(item.productId); // 해당 아이템의 상품을 찾아옴
    const newStock = { ...product.stock }; // 현재 상품의 재고 정보를 복사
    newStock[item.size] -= item.qty; // 선택한 사이즈에대해 구매한 수량(qty)만큼 재고에서 차감
    product.stock = newStock; // 상품에 새로 차감된 재고를 업데이트
    await product.save(); // 상품의 새로운 재고를 저장
  }
};

module.exports = productController;
