(function(){
  const scripts = document.getElementsByTagName("script");
  const regex = /(?<=(\"|\%27|\`))\/[a-zA-Z0-9_?&=\/\-#\.]*?(?=(\"|\'|\%60))/g;
  const results = new Set();

  for (let i = 0; i < scripts.length; i++) {
    const src = scripts[i].src;
    if (src) {
      fetch(src)
        .then(res => res.text())
        .then(txt => {
          const matches = txt.matchAll(regex);
          for (let match of matches) results.add(match[0]);
        })
        .catch(err => console.log("Script fetch error:", err));
    }
  }

  const pageContent = document.documentElement.outerHTML;
  const matches = pageContent.matchAll(regex);
  for (const match of matches) results.add(match[0]);

  function writeResults() {
    const style = "padding:5px;margin:5px;font-family:monospace;";
    const box = document.createElement("div");
    box.style = "position:fixed;top:10px;left:10px;max-height:90vh;width:300px;overflow:auto;background:#fff;color:#000;border:1px solid #000;z-index:9999999;" + style;

    let html = "<h3>Detected API Paths:</h3>";
    results.forEach(res => {
      html += `<div>${res}</div>`;
    });

    box.innerHTML = html;
    document.body.appendChild(box);
  }

  setTimeout(writeResults, 3000);
})();