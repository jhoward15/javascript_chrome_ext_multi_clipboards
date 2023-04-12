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
        console.log("Copied text to clipboard" + clipboardNum + ": '" + selectedText + "'");
      },
    });
  });
}

// Paste the text from the specified clipboard location
function pasteFromClipboard(clipboardNum) {
  console.log("Paste from clipboard: " + clipboardNum);
  chrome.storage.local.get(["clipboard" + clipboardNum], function (result) {
    if (result["clipboard" + clipboardNum]) {
      console.log("Paste text from clipboard" + clipboardNum + ": '" + result["clipboard" + clipboardNum] + "'");
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.scripting.executeScript({
          args: [result["clipboard" + clipboardNum]],
          target: { tabId: tabs[0].id },
          func: (pasteValue) => {
            console.log("Paste text to page: " + pasteValue);
            const input = document.activeElement;
            const cursorPosition = input.selectionStart;
            const currentValue = input.value;
            const newValue =
              currentValue.slice(0, cursorPosition) + pasteValue + currentValue.slice(input.selectionEnd);
            input.value = newValue;
            const newCursorPosition = cursorPosition + pasteValue.length;
            input.setSelectionRange(newCursorPosition, newCursorPosition);
            input.focus();
          },
        });
      });
    }
  });
}
