// Listen for hotkey presses
chrome.commands.onCommand.addListener(function (command) {
  console.log("[background.js] onInstalled. Command received: " + command);
  if (command == "copy") {
    copyToClipboard(1);
    clipboardNum = 1;
    chrome.storage.local.get(["clipboard" + clipboardNum], function (result) {
      if (result["clipboard" + clipboardNum]) {
        console.log("[background.js] Stored text in clipboard 1: " + result["clipboard" + clipboardNum]);
      } else {
        console.log("[background.js] No text in clipboard 1");
      }
    });
  } else if (command == "paste") {
    pasteFromClipboard(1);
  }
});

// Copy the selected text to the specified clipboard location
function copyToClipboard(clipboardNum) {
  console.log("[background.js] copyToClipboard before query");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    console.log("[background.js] copyToClipboard URL: " + tabs[0].url);
    console.log("[background.js] copyToClipboard ID: " + tabs[0].id);

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id, allFrames: true },
      files: ["content.js"],
    });
  });
  console.log("[background.js] copyToClipboard after query");
}

// Paste the text from the specified clipboard location
function pasteFromClipboard(clipboardNum) {
  chrome.storage.local.get(["clipboard" + clipboardNum], function (result) {
    if (result["clipboard" + clipboardNum]) {
      chrome.tabs.executeScript({
        code: "document.activeElement.value += '" + result["clipboard" + clipboardNum] + "';",
      });
    }
  });
}
