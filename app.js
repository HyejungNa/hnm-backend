const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config(); // 환경변수 가져오기

app.use(cors()); // CORS 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //req.body를 객체로 인식하게해줌

app.use("/api", indexRouter);
const mongoURI = process.env.LOCAL_DB_ADDRESS; // 백엔드 DB 주소
mongoose
  .connect(mongoURI) // { useNewUrlParser } : mongodb최신버전에서 기본값으로 설정되어있어 더이상 사용하지않음
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log("DB connection fail"));

app.listen(process.env.PORT || 5000, () => {
  console.log("server on");
});
