# ChatGPT Chrome Extension 🤖 ✨

A Chrome extension that adds [ChatGPT](https://chat.openai.com) to every text box on the internet! Use it to write tweets, revise emails, fix coding bugs, or whatever else you need, all without leaving the site you're on. Includes a plugin system for greater control over ChatGPT behavior and ability to interact with 3rd party APIs.

![](https://i.imgur.com/CPMOyG7.gif)

## Install

First clone this repo on your local machine

Then install dependencies

```bash
npm install
```

Copy `.env-example` into a new file named `.env` and add your ChatGPT email and password.

Run the server so the extension can communicate with ChatGPT.

```bash
node server.js
```

This will automate interaction with ChatGPT through a headless Chrome browser, thanks to the [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api) library. You will see the browser pop up after running your server. It should automatically log you in, but you may need to manually solve a captcha to complete the process.

Add the extension

1. Go to chrome://extensions in your Google Chrome browser
2. Check the Developer mode checkbox in the top right-hand corner
3. Click "Load Unpacked" to see a file-selection dialog
4. Select your local `chatgpt-chrome-extension/extension` directory

You'll now see "Ask ChatGPT" if you right click in any text input or content editable area.

## Troubleshooting

If ChatGPT is taking a very long time to respond or not responding at all then it could mean that their servers are currently overloaded. You can confirm this by going to [chat.openai.com/chat](https://chat.openai.com/chat) and seeing whether their website works directly.

## Plugins

Plugins have the ability to inform ChatGPT of specific conversation rules and parse replies from ChatGPT before they are sent to the browser.

[Default](/plugins/Default.js) - Sets some default conversation rules 🧑‍🏫

[Image](/plugins/Image.js) - Tells ChatGPT to describe things visually when asked for an image and then replaces the description with a matching AI generated image from [Lexica](http://lexica.art) 📸

Your really cool plugin - Go make a plugin, do a pull-request and I'll add it the list 🤝

## Related

Huge thanks to <a href="https://twitter.com/transitive_bs">Travis Fischer</a> for creating [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api)

## License

MIT © Gabe Ragland (follow me on <a href="https://twitter.com/gabe_ragland">Twitter</a>)
