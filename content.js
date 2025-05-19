(() => {
  const urls = new Set();

  document.querySelectorAll("link, script, img, iframe, source").forEach(el => {
    const url = el.src || el.href;
    if (url) urls.add(url);
  });

  performance.getEntriesByType("resource").forEach(entry => {
    if (entry.name) urls.add(entry.name);
  });

  urls.add(window.location.href);

  const structuredResources = Array.from(urls).map(urlString => {
    try {
      const url = new URL(urlString, window.location.origin);
      const pathname = url.pathname;
      const segments = pathname.split('/').filter(Boolean);
      const queryParams = [...url.searchParams.keys()];
      const wildcardQuery = queryParams.length
        ? `?${queryParams.map(k => `${k}=*`).join('&')}`
        : '';

      return {
        full: url.href,
        path: pathname,
        endpoint: segments.length > 0 ? `/${segments[0]}` : '/',
        query: Object.fromEntries(url.searchParams.entries()),
        normalized: pathname + wildcardQuery
      };
    } catch (e) {
      return { full: urlString, path: "", endpoint: "", query: {}, normalized: urlString };
    }
  });

  chrome.runtime.sendMessage({
    type: "resourceList",
    data: {
      url: window.location.href,
      resources: structuredResources
    }
  });
})();
