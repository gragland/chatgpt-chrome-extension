import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGPTAPI } from "chatgpt";

import config from "./config.js";

const app = express().use(cors()).use(bodyParser.json());
const gptApi = new ChatGPTAPI();

const Config = configure(config);

app.post("/", async (req, res) => {
  try {
    const rawReply = await gptApi.sendMessage(req.body.message);
    const reply = await Config.parse(rawReply);
    res.json({ reply });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

async function start() {
  console.log(`Starting up ...`);
  await gptApi.init({ auth: "blocking" });
  await Config.train();
  app.listen(3000, () => console.log(`Listening on port 3000`));
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

    console.log(
      `Training ChatGPT with ${Config.rules.length} plugin rules ...`
    );

    const message = `
      Please follow these rules when replying to me:
      ${rules.map((rule) => {
        return `\n- ${rule}`;
      })}
    `;

    return gptApi.sendMessage(message);
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
