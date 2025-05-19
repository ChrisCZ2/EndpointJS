chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "resourceList" && sender.tab) {
    const tabId = sender.tab.id;
    const title = sender.tab.title;
    chrome.storage.local.get("groupResults", ({ groupResults = {} }) => {
      groupResults[tabId] = {
        title,
        url: message.data.url,
        resources: message.data.resources
      };
      chrome.storage.local.set({ groupResults });
    });
  }
});
