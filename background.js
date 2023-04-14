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

// Display all clipboards with their values in a popup
function displayClipboards() {
  console.log("[10 Clips] Displaying clipboards");

  console.log("[10 Clips] Clearing all 10 clipboards");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    // The allFrames:true option is required to access the content of iframes
    chrome.scripting.executeScript({
      args: [],
      target: { tabId: tabs[0].id, allFrames: true },
      func: () => {
        function displayClipboardsPopup() {
          let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`;

          open("/", "test", params);

          var popup = window.open("", "ClipboardsPopup", "width=400,height=500,menubar=no,toolbar=no");
          popup.onload = function () {
            popup.document.write(`
              <html>
                <head>
                  <title>Clipboards</title>
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
                </head>
                <body>
                  <div class="container">
                    <h1 class="my-3">Clipboards</h1>
                    ${clipboards}
                  </div>
                </body>
              </html>
            `);
          };
        }

        var clipboards = "";
        for (let i = 1; i <= 10; i++) {
          chrome.storage.local.get(["10_Clips_clipboard_" + i], function (result) {
            if (result["10_Clips_clipboard_" + i]) {
              console.log(`[10 Clips] Clipboard ${i}: ${result["10_Clips_clipboard_" + i]}`);
              clipboards += `Clipboard ${String(i).padStart(2, "0")}: ${result["10_Clips_clipboard_" + i]}<br>`;
            } else {
              clipboards += `Clipboard ${String(i).padStart(2, "0")}: <br>`;
            }
          });
          if (i == 10) {
            displayClipboardsPopup();
          }
        }
      },
    });
  });
}

// Clear all clipboards. Primarily done this way so we can prompt the user that it has been done
function clearAllClipboards() {
  console.log("[10 Clips] Clearing all 10 clipboards");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    // The allFrames:true option is required to access the content of iframes
    chrome.scripting.executeScript({
      args: [],
      target: { tabId: tabs[0].id, allFrames: true },
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
      args: [clipboardNum],
      target: { tabId: tabs[0].id, allFrames: true },
      func: (clipboardNum) => {
        selectedText = window.getSelection ? window.getSelection().toString() : document.selection.createRange().text;
        console.log(`[10 Clips] Copied text to clipboard ${clipboardNum}: '${selectedText}'`);
        chrome.storage.local.set({ ["10_Clips_clipboard_" + clipboardNum]: [selectedText] });
      },
    });
  });
}

// Paste the text from the specified clipboard location
function pasteFromClipboard(clipboardNum) {
  console.log("[10 Clips] Paste from clipboard: " + clipboardNum);
  chrome.storage.local.get(["10_Clips_clipboard_" + clipboardNum], function (result) {
    if (result["10_Clips_clipboard_" + clipboardNum]) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.scripting.executeScript({
          args: [result["10_Clips_clipboard_" + clipboardNum].toString()],
          target: { tabId: tabs[0].id, allFrames: true },
          func: (pasteValue) => {
            console.log(`[10 Clips] Paste text to page: '${pasteValue}' [length: ${pasteValue.length}]`);
            const input = document.activeElement;
            const cursorPosition = input.selectionStart;
            if (cursorPosition === undefined) {
              console.log(`[10 Clips] Error getting cursor position for element: ${input}`);
              return;
            }

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
