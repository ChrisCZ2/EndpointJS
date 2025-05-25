const tabSelector = document.getElementById("tabSelector");
const scanBtn = document.getElementById("scanBtn");
const resultsDiv = document.getElementById("results");
const themeToggle = document.getElementById("themeToggle");
const filterInput = document.getElementById("filter");

let allResults = [];

function showResults(results) {
  resultsDiv.innerHTML = "";

  const keyword = filterInput.value.toLowerCase();
  const filtered = results.filter(r => r.toLowerCase().includes(keyword));

  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<em>No matching results.</em>";
    return;
  }

  filtered.forEach((res) => {
    const div = document.createElement("div");
    div.textContent = res;
    resultsDiv.appendChild(div);
  });
}

// Load all tabs
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    const option = document.createElement("option");
    option.value = tab.id;
    option.textContent = tab.title || tab.url;
    tabSelector.appendChild(option);
  });
});

// Scan selected tab
scanBtn.addEventListener("click", () => {
  const tabId = parseInt(tabSelector.value);
  chrome.runtime.sendMessage({ type: "scan-tab", tabId });
  resultsDiv.innerHTML = "<em>Scanning...</em>";
});

// Keyword filtering in real time
filterInput.addEventListener("input", () => {
  showResults(allResults);
});

// Show results
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "results-updated") {
    allResults.push(...msg.data);
    allResults = [...new Set(allResults)];
    showResults(allResults);
  }
});

// Load previous results
chrome.runtime.sendMessage({ type: "get-last-results" }, (response) => {
  if (response?.data?.length) {
    allResults = response.data;
    showResults(allResults);
  } else {
    resultsDiv.innerHTML = "<em>No results yet.</em>";
  }
});

// Dark mode toggle
themeToggle.addEventListener("change", () => {
  const dark = themeToggle.checked;
  document.body.className = dark ? "dark" : "light";
  localStorage.setItem("darkMode", dark);
});

// Apply saved theme
document.addEventListener("DOMContentLoaded", () => {
  const dark = localStorage.getItem("darkMode") === "true";
  themeToggle.checked = dark;
  document.body.className = dark ? "dark" : "light";
});
