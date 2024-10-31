const Product = require("../models/Product");
const productController = {};
const PAGE_SIZE = 5;

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

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
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

    // Execute the query
    const productList = await query.exec();
    response.data = productList;

    res.status(200).json(response);
  } catch (error) {
    console.error(error); // Log the error
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = productController;
