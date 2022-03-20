import express from "express";
import router from "./routes.js";

import dotenv from "dotenv"

dotenv.config();

const app = express();
const port = process.env.PORT || 3100;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use("/", router);

app.listen(port, () => {
  console.log("Listening on port " + port);
});
