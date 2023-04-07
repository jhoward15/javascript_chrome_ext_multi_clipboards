// Listen for hotkey presses
chrome.commands.onCommand.addListener(function (command) {
  console.log("onInstalled " + command);
  if (command == "copy") {
    copyToClipboard(1);
    clipboardNum = 1;
    chrome.storage.local.get(["clipboard" + clipboardNum], function (result) {
      if (result["clipboard" + clipboardNum]) {
        console.log('Stored text in clipboard 1: " + result["clipboard" + clipboardNum]');
      } else {
        console.log("No text in clipboard 1");
      }
    });
  } else if (command == "paste") {
    pasteFromClipboard(1);
  }
});

// Copy the selected text to the specified clipboard location
function copyToClipboard(clipboardNum) {
  console.log("copyToClipboard");
  chrome.tabs.executeScript({
    code: "",
  });
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
