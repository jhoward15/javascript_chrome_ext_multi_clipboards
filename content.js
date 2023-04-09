clipboardNum = 1;
selectedText = window.getSelection().toString();
console.log("[content.js] selectedText:" + selectedText);
clipboardName = "clipboard" + clipboardNum;
chrome.storage.local.set({ clipboardName: selectedText });
//console.log("[content.js] selectedText:" + selectedText);
