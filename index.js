window.onload = async () => {
  const tabList = document.getElementById("tab-list");
  const tabs = await chrome.tabs.query({ currentWindow: true });

  tabs.forEach(tab => {
    if (tab.url.startsWith("http")) {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "tab";
      radio.value = tab.id;
      radio.id = `tab-${tab.id}`;

      const label = document.createElement("label");
      label.htmlFor = `tab-${tab.id}`;
      label.textContent = tab.title;
      label.prepend(radio);
      label.classList.add("tab-item");

      tabList.appendChild(label);
    }
  });

  const stored = await chrome.storage.local.get("scanResults");
  if (stored.scanResults) {
    window.currentResults = stored.scanResults;
    displayResults(window.currentResults);
  }
};
