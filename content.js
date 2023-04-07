const clipboardNum = 1;
var selectedText = window.getSelection().toString(); 
chrome.storage.local.set({ 'clipboard" + clipboardNum "': selectedText });

var selectedText = window.getSelection().toString(); chrome.storage.local.set({ 'clipboard" +
      clipboardNum +
      "': selectedText });