import dotenv from "dotenv-safe";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ChatGPTAPIBrowser } from "chatgpt";
import { oraPromise } from "ora";
import config from "./config.js";

const app = express().use(cors()).use(bodyParser.json());

const gptApi = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL,
  password: process.env.OPENAI_PASSWORD,
})
await gptApi.init()

const Config = configure(config);

class Conversation {
  conversationID = null;
  parentMessageID = null;

  constructor() { }

  async sendMessage(msg) {
    const res = await gptApi.sendMessage(msg,
      (this.conversationID && this.parentMessageID) ? {
                                                        conversationId: this.conversationID,
                                                        parentMessageId: this.parentMessageID
                                                      } : {  });
    if (res.conversationID) {
      this.conversationID = res.conversationID;
    }
    if (res.parentMessageID) {
      this.parentMessageID = res.parentMessageID;
    }

    if (res.response) {
      return res.response
    }
    return res
  }
}

const conversation = new Conversation()

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

const EnsureAuth = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (gptApi.getIsAuthenticated())
      resolve();
    else
      reject();
  }, 300);
});


async function start() {
  await oraPromise(EnsureAuth, { text: "Connecting to ChatGPT" });
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
      ${rules.map(rule => `\n- ${rule}` )}
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
