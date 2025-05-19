function updateResult(path, fullUrl) {
  const resultsDiv = document.getElementById("results");

  const wrapper = document.createElement("div");
  wrapper.className = "result-item";

  const span = document.createElement("span");
  span.textContent = path;

  const btn = document.createElement("button");
  btn.textContent = "Copy URL";
  btn.onclick = () => navigator.clipboard.writeText(fullUrl);

  wrapper.appendChild(span);
  wrapper.appendChild(btn);
  resultsDiv.appendChild(wrapper);
}

function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  document.getElementById("scanned-url").textContent = `Scanned: ${data.url}`;
  resultsDiv.innerHTML = "";

  data.paths.forEach(path => {
    const fullUrl = data.url + path;
    updateResult(path, fullUrl);
  });

  const input = document.getElementById("filter-input");
  const retroBtn = document.getElementById("retro-btn");
  const clearBtn = document.getElementById("clear-filter");

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    Array.from(resultsDiv.children).forEach(div => {
      div.style.display = div.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });

  clearBtn.onclick = () => {
    input.value = "";
    Array.from(resultsDiv.children).forEach(div => div.style.display = "");
  };

  retroBtn.onclick = () => {
    resultsDiv.innerHTML = "";
    const retro = ["/robots.txt", "/sitemap.xml", "/.env", "/phpinfo.php", "/.htaccess"];
    retro.forEach(p => {
      updateResult(p, data.url + p);
    });
  };
}
