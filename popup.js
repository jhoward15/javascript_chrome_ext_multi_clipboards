var clipboard = "";
const clipboardsList = document.getElementById("clipboards-list");
for (let i = 1; i <= 10; i++) {
  chrome.storage.local.get(["10_Clips_clipboard_" + i], function (result) {
    if (result["10_Clips_clipboard_" + i]) {
      var clipboardValue =
        result["10_Clips_clipboard_" + i].toString().length > 30
          ? result["10_Clips_clipboard_" + i].toString().substring(0, 30) + "..."
          : result["10_Clips_clipboard_" + i].toString();
      clipboard = `${String(i).padStart(2, "0")}: ${clipboardValue}`;
    } else {
      clipboard = `${String(i).padStart(2, "0")}:`;
    }
    console.log(`[10 Clips] Clipboard ${i}: ${result["10_Clips_clipboard_" + i]}`);
    const clipboardItem = document.createElement("li");
    clipboardItem.classList.add("list-group-item");
    clipboardItem.innerText = clipboard;
    clipboardsList.appendChild(clipboardItem);
  });
}
