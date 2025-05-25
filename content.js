(function () {
  const results = new Set();
  const regex = /https?:\/\/[^\s"'`]+/g;

  // Scan page content
  const matches = document.documentElement.outerHTML.matchAll(regex);
  for (const match of matches) {
    const url = match[0];
    if (!results.has(url)) {
      results.add(url);
      chrome.runtime.sendMessage({
        type: "realtime-result",
        data: url
      });
    }
  }

  // Notify scan completion (optional)
  chrome.runtime.sendMessage({
    type: "scan-complete"
  });
})();
