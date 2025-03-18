document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('go-back').addEventListener('click', function() {
    chrome.tabs.update({ url: "chrome://newtab/" });
  });
});
