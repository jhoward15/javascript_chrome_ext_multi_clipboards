// Listen for hotkey presses
chrome.commands.onCommand.addListener(function (command) {
  console.log("[background.js] onInstalled. Command received: " + command);
  // if command contains "copy" then get the number from the end of the string
  // and use that number to store the text in the clipboard
  if (command.includes("copy")) {
    clipboardNum = command.substring(command.length - 1);
    copyToClipboard(clipboardNum);
  } else if (command.includes("paste")) {
    clipboardNum = command.substring(command.length - 1);
    pasteFromClipboard(clipboardNum);
  }
});

// Copy the selected text to the specified clipboard location
function copyToClipboard(clipboardNum) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      args: [clipboardNum],
      target: { tabId: tabs[0].id },
      func: (clipboardNum) => {
        selectedText = window.getSelection().toString();
        chrome.storage.local.set({ ["clipboard" + clipboardNum]: [selectedText] });
      },
    });
  });
}

// Paste the text from the specified clipboard location
function pasteFromClipboard(clipboardNum) {
  console.log("Paste from clipboard: " + clipboardNum);
  chrome.storage.local.get(["clipboard" + clipboardNum], function (result) {
    if (result["clipboard" + clipboardNum]) {
      console.log("Paste text from clipboard: " + result["clipboard" + clipboardNum]);
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.scripting.executeScript({
          args: [result["clipboard" + clipboardNum]],
          target: { tabId: tabs[0].id },
          func: (pasteValue) => {
            console.log("Paste text to page: " + pasteValue);
            var input = document.activeElement;
            var textToInsert = "hello world";
            var cursorPosition = input.selectionStart;
            var currentValue = input.value;
            var newValue = currentValue.slice(0, cursorPosition) + textToInsert + currentValue.slice(cursorPosition);
            input.value = newValue;
            var newCursorPosition = cursorPosition + textToInsert.length;
            input.setSelectionRange(newCursorPosition, newCursorPosition);
            input.focus();
          },
        });
      });
    }
  });
}
