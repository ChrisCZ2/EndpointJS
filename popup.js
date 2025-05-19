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

  const stored = await chrome.storage.local.get("groupResults");
  if (stored.groupResults) {
    renderGroups(stored.groupResults);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const tabListDiv = document.getElementById("tab-list");
  const scanSel = document.getElementById("scan-selected");
  const scanAll = document.getElementById("scan-all");
  const resultsDiv = document.getElementById("results");
  const filterInput = document.getElementById("filter-input");
  const summary = document.getElementById("scanned-summary");

  async function scanTabs(tabIds) {
    chrome.storage.local.set({ groupResults: {} });
    resultsDiv.innerHTML = "<em>Scanning…</em>";
    summary.textContent = `Scanning ${tabIds.length} tab(s)…`;
    for (const id of tabIds) {
      await chrome.scripting.executeScript({
        target: { tabId: parseInt(id) },
        files: ["content.js"]
      });
    }
  }

  scanSel.onclick = () => {
    const sel = document.querySelector('input[name="tab"]:checked');
    if (!sel) return alert("Select a tab first.");
    scanTabs([sel.value]);
  };

  scanAll.onclick = () => {
    const all = Array.from(document.querySelectorAll('input[name="tab"]')).map(i => i.value);
    if (all.length) scanTabs(all);
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.groupResults) {
      renderGroups(changes.groupResults.newValue, filterInput.value.toLowerCase());
    }
  });

  filterInput.addEventListener("input", () => {
    chrome.storage.local.get("groupResults", ({ groupResults = {} }) => {
      renderGroups(groupResults, filterInput.value.toLowerCase());
    });
  });

  function renderGroups(groups, filter = "") {
    resultsDiv.innerHTML = "";
    let total = 0;
    for (const [tabId, data] of Object.entries(groups)) {
      const seen = new Set();
      const section = document.createElement("div");
      section.className = "section";
      const h4 = document.createElement("h4");
      h4.textContent = data.title;
      section.append(h4);
      data.resources
        .filter(r => !filter || r.full.toLowerCase().includes(filter))
        .forEach(r => {
          if (seen.has(r.normalized)) return;
          seen.add(r.normalized);

          const row = document.createElement("div");
          row.className = "result";

          const info = document.createElement("div");
          info.style.flex = "1";
          info.innerHTML = `
            <strong>URL:</strong> ${r.full}<br/>
            <strong>Normalized:</strong> ${r.normalized}<br/>
            <strong>Endpoint:</strong> ${r.endpoint}<br/>
            ${Object.keys(r.query).length ? `<strong>Query:</strong> ${JSON.stringify(r.query)}` : ""}
          `;

          const btn = document.createElement("button");
          btn.textContent = "Copy URL";
          btn.onclick = () => navigator.clipboard.writeText(r.full);

          row.append(info, btn);
          section.append(row);
          total++;
        });
      resultsDiv.append(section);
    }
    summary.textContent = `Results (${total})`;
  }
});
