// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT") {
    // Get selected text or text in active contenteditable element
    const text =
      document.getSelection().toString().trim() ||
      (document.activeElement && document.activeElement.isContentEditable
        ? document.activeElement.textContent.trim()
        : "");

    if (!text) {
      alert(
        "Click in a text area that contains text or select some text on the page"
      );
      return;
    }

    showLoadingCursor();

    // Send the text to the API endpoint
    fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (
          document.activeElement &&
          document.activeElement.isContentEditable
        ) {
          // Insert response
          document.activeElement.dispatchEvent(
            new InputEvent("textInput", {
              data: `\n\n${data.reply}`,
              bubbles: true,
            })
          );
        } else {
          // Alert reply since no active text area
          alert(`Reply from ChatGPT: ${data.reply}`);
        }

        restoreCursor();
      })
      .catch(() => {
        restoreCursor();
        alert(
          "Error. Make sure you're running a local ChatGPT server on port 3000."
        );
      });
  }
});

const showLoadingCursor = () => {
  const style = document.createElement("style");
  style.id = "corsor_wait";
  style.innerHTML = `* {cursor: wait;}`;
  document.head.insertBefore(style, null);
};

const restoreCursor = () => {
  document.getElementById("corsor_wait").remove();
};
