function displayClipboardContents() {
  var clipboard = "";
  const clipboardsList = document.getElementById("clipboards-list");
  for (let i = 1; i <= 10; i++) {
    chrome.storage.local.get(["10_Clips_clipboard_" + i], function (result) {
      if (result["10_Clips_clipboard_" + i]) {
        var clipboardValue = result["10_Clips_clipboard_" + i].toString();
        // Using Bootstrap to truncate the text, so don't need to do it here
        // var clipboardValue =
        //   result["10_Clips_clipboard_" + i].toString().length > 50
        //     ? result["10_Clips_clipboard_" + i].toString().substring(0, 50) + "..."
        //     : result["10_Clips_clipboard_" + i].toString();
        clipboard = `<span style="color:lightgrey;">${String(i).padStart(
          2,
          "0"
        )}</span>&nbsp;&nbsp;&nbsp;${clipboardValue}`;
      } else {
        clipboard = `<span style="color:lightgrey;">${String(i).padStart(2, "0")}</span>`;
      }
      console.log(`[10 Clips] Clipboard ${i}: ${result["10_Clips_clipboard_" + i]}`);
      const clipboardItem = document.createElement("li");
      clipboardItem.classList.add("list-group-item");
      clipboardItem.classList.add("text-truncate");
      clipboardItem.innerHTML = clipboard;
      clipboardsList.appendChild(clipboardItem);
    });
  }
}

// Clear all clipboards
function clearAllClipboards() {
  console.log("[10 Clips] Clearing all 10 clipboards");
  // Clear clipboards 1-10
  for (let i = 1; i <= 10; i++) {
    chrome.storage.local.set({ ["10_Clips_clipboard_" + i]: "" });
  }
}

// Initial population of the clipboard contents
displayClipboardContents();

// Get a reference to the "Close" button
const closeButton = document.getElementById("close-button");

// Add an event listener to the button
closeButton.addEventListener("click", function () {
  // Close the window
  window.close();
});

// Get a reference to the "Clear All" button
const clearAllButton = document.getElementById("clear-all-button");

// Add an event listener to the button
clearAllButton.addEventListener("click", function () {
  // Clear all clipboards
  clearAllClipboards();
  window.location.reload();
});
