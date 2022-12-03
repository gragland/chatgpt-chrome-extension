import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGPTAPI } from "chatgpt";

const app = express().use(cors()).use(bodyParser.json());
const gptApi = new ChatGPTAPI();

app.post("/", async (req, res) => {
  try {
    console.log(req.body.message);
    const reply = await gptApi.sendMessage(req.body.message);
    console.log(reply);
    res.json({ reply });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

gptApi.init({ auth: "blocking" }).then(() => {
  app.listen(3000, () => console.log(`Listening on port 3000`));
});
