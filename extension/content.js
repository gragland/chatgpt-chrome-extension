// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT") {
    let originalActiveElement;
    let text;

    // If there's an active text input
    if (document.activeElement && document.activeElement.isContentEditable) {
      // Set as original for later
      originalActiveElement = document.activeElement;
      // Use selected text or all text in the input
      text =
        document.getSelection().toString().trim() ||
        document.activeElement.textContent.trim();
    } else {
      // If no active text input use any selected text on page
      text = document.getSelection().toString().trim();
    }

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
        // Use original text element and fallback to current active text element
        const element =
          originalActiveElement ||
          (document.activeElement.isContentEditable && document.activeElement);

        if (element) {
          const replyNode = document.createTextNode(`\n\n${data.reply}`);

          const selection = window.getSelection();

          if (selection.rangeCount === 0) {
            selection.addRange(document.createRange());
            selection.getRangeAt(0).collapse(element, 1);
          }

          const range = selection.getRangeAt(0);
          range.collapse(false);

          // Insert reply
          range.insertNode(replyNode);

          // Move the cursor to the end
          selection.collapse(replyNode, replyNode.length);
        } else {
          // Alert reply since no active text area
          alert(`ChatGPT says: ${data.reply}`);
        }

        restoreCursor();
      })
      .catch((error) => {
        restoreCursor();
        alert(
          "Error. Make sure you're running the server by following the instructions on https://github.com/gragland/chatgpt-everywhere. Also make sure you don't have an adblocker preventing requests to localhost:3000."
        );
        throw new Error(error);
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
