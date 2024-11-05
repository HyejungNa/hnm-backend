const randomStringGenerator = () => {
  const randomString = Array.from(Array(10), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
  return randomString;
}; // 주문 완료후 orderNum만들때 씀

module.exports = { randomStringGenerator };

// 하나의 함수만 export할때는 {} 사용하지않아도됨
// module.exports = randomStringGenerator;
// const randomStringGenerator = require("../utils/randomStringGenerator");
