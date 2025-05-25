let lastResults = [];

function scanTab(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const regex = /https?:\/\/[a-zA-Z0-9_.\/\-?&=%#]+/g;
      const pageContent = document.documentElement.outerHTML;
      const matches = pageContent.match(regex) || [];

      const uniqueResults = [...new Set(matches)];
      uniqueResults.forEach((res) => {
        chrome.runtime.sendMessage({
          type: "realtime-result",
          data: res
        });
      });
    }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "scan-tab") {
    lastResults = []; // reset results for fresh scan
    scanTab(msg.tabId);
  } else if (msg.type === "realtime-result") {
    if (!lastResults.includes(msg.data)) {
      lastResults.push(msg.data);
      chrome.runtime.sendMessage({
        type: "results-updated",
        data: [msg.data]
      });
    }
  } else if (msg.type === "get-last-results") {
    sendResponse({ data: lastResults });
  }
});
