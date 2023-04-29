import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config({ path: "./.env" });
const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());

const paymasterRoute = require("./src/routes/paymasterRoutes");
app.use("/api", paymasterRoute);

app.listen(PORT, () => {
  console.log(`app is listening http://127.0.0.1:${PORT}`);
});
