// Listen for hotkey presses
chrome.commands.onCommand.addListener(function (command) {
  console.log("[10 Clips] Command received: " + command);
  // if command contains "copy" then get the number from the end of the string
  // and use that number to store the text in the clipboard
  if (command.includes("copy")) {
    clipboardNum = command.substring(command.length - 1);
    copyToClipboard(clipboardNum);
  } else if (command.includes("paste")) {
    clipboardNum = command.substring(command.length - 1);
    pasteFromClipboard(clipboardNum);
  } else if (command == "clearall") {
    clearAllClipboards();
  } else if (command == "displayall") {
    displayClipboards();
  }
});

// Clear all clipboards. Primarily done this way so we can prompt the user that it has been done
function clearAllClipboards() {
  console.log("[10 Clips] Clearing all 10 clipboards");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      args: [],
      target: { tabId: tabs[0].id },
      func: () => {
        // Clear clipboards 1-10
        for (let i = 1; i <= 10; i++) {
          chrome.storage.local.set({ ["10_Clips_clipboard_" + i]: "" });
        }
        alert("[10 Clips] All clipboards cleared");
      },
    });
  });
}

// Copy the selected text to the specified clipboard location
function copyToClipboard(clipboardNum) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    // The allFrames:true option is required to access the content of iframes
    chrome.scripting.executeScript({
      args: [clipboardNum, tabs[0].id],
      target: { tabId: tabs[0].id },
      func: (clipboardNum, tabId) => {
        selectedText = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
        if (selectedText) {
          console.log(`[10 Clips] Copied text to clipboard ${clipboardNum}: '${selectedText}'`);
          chrome.storage.local.set({ ["10_Clips_clipboard_" + clipboardNum]: [selectedText] });
          chrome.runtime.sendMessage({ action: "updateBadge", status: "copySuccess", tab: tabId });
        } else {
          console.log(`[10 Clips] No selected text to copy to clipboard ${clipboardNum}`);
          chrome.runtime.sendMessage({ action: "updateBadge", status: "copyFail", tab: tabId });
        }
      },
    });
  });
}

// Paste the text from the specified clipboard location
function pasteFromClipboard(clipboardNum) {
  console.log("[10 Clips] Pasting from clipboard: " + clipboardNum);
  chrome.storage.local.get(["10_Clips_clipboard_" + clipboardNum], function (result) {
    if (result["10_Clips_clipboard_" + clipboardNum]) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.scripting.executeScript({
          args: [result["10_Clips_clipboard_" + clipboardNum].toString(), tabs[0].id],
          target: { tabId: tabs[0].id },
          func: (pasteValue, tabId) => {
            console.log(`[10 Clips] Paste text to page: '${pasteValue}' [length: ${pasteValue.length}]`);
            const input = document.activeElement;
            const cursorPosition = input.selectionStart;
            if (cursorPosition === undefined) {
              console.log(`[10 Clips] Error getting cursor position for element: ${input}`);
              chrome.runtime.sendMessage({ action: "updateBadge", status: "pasteFail", tab: tabId });
              return;
            }

            const currentValue = input.value;
            const newValue =
              currentValue.slice(0, cursorPosition) + pasteValue + currentValue.slice(input.selectionEnd);
            input.value = newValue;
            const newCursorPosition = cursorPosition + pasteValue.length;
            input.setSelectionRange(newCursorPosition, newCursorPosition);
            input.focus();
            chrome.runtime.sendMessage({ action: "updateBadge", status: "pasteSuccess", tab: tabId });
          },
        });
      });
    }
  });
}

// Update the badge text when a message is received
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[10 Clips] Message received: " + message.status);
  if (message.action === "updateBadge") {
    if (message.status === "copySuccess") {
      chrome.action.setBadgeBackgroundColor({ color: "#3471FF", tabId: message.tab });
      chrome.action.setBadgeText({ text: "Copy", tabId: message.tab });
    } else if (message.status === "copyFail") {
      chrome.action.setBadgeBackgroundColor({ color: "#FE0000", tabId: message.tab });
      chrome.action.setBadgeText({ text: "Fail", tabId: message.tab });
    } else if (message.status === "pasteSuccess") {
      chrome.action.setBadgeBackgroundColor({ color: "#3471FF", tabId: message.tab });
      chrome.action.setBadgeText({ text: "Paste", tabId: message.tab });
    } else if (message.status === "pasteFail") {
      chrome.action.setBadgeBackgroundColor({ color: "#FE0000", tabId: message.tab });
      chrome.action.setBadgeText({ text: "Fail", tabId: message.tab });
    }

    // Clear the badge text after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "", tabId: message.tab });
    }, 3000);
  }
});
