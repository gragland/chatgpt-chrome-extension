import dotenv from "dotenv-safe";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGPTAPI } from "chatgpt";
import { oraPromise } from "ora";

import config from "./config.js";

const app = express().use(cors()).use(bodyParser.json());
const gptApi = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN,
});

const Config = configure(config);
const conversation = gptApi.getConversation();

app.post("/", async (req, res) => {
  try {
    const rawReply = await oraPromise(
      conversation.sendMessage(req.body.message),
      {
        text: req.body.message,
      }
    );
    const reply = await Config.parse(rawReply);
    console.log(`----------\n${reply}\n----------`);
    res.json({ reply });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

async function start() {
  await oraPromise(gptApi.ensureAuth(), { text: "Connecting to ChatGPT" });
  await oraPromise(Config.train(), {
    text: `Training ChatGPT (${Config.rules.length} plugin rules)`,
  });
  await oraPromise(
    new Promise((resolve) => app.listen(3000, () => resolve())),
    {
      text: `You may now use the extension`,
    }
  );
}

function configure({ plugins, ...opts }) {
  let rules = [];
  let parsers = [];

  // Collect rules and parsers from all plugins
  for (const plugin of plugins) {
    if (plugin.rules) {
      rules = rules.concat(plugin.rules);
    }
    if (plugin.parse) {
      parsers.push(plugin.parse);
    }
  }

  // Send ChatGPT a training message that includes all plugin rules
  const train = () => {
    if (!rules.length) return;

    const message = `
      Please follow these rules when replying to me:
      ${rules.map((rule) => {
        return `\n- ${rule}`;
      })}
    `;

    return conversation.sendMessage(message);
  };

  // Run the ChatGPT response through all plugin parsers
  const parse = async (reply) => {
    for (const parser of parsers) {
      reply = await parser(reply);
    }
    return reply;
  };

  return { train, parse, rules, ...opts };
}

start();
