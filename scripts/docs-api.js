(function () {
  const repoRaw = "https://raw.githubusercontent.com/Symbia-Labs/symbia-seed/main/";
  const repoWeb = "https://github.com/Symbia-Labs/symbia-seed/blob/main/";
  const docs = [
    { id: "quickstart", title: "Quickstart & Boot", path: "docs/architecture/quickstart.md", local: "assets/docs/quickstart.md" },
    { id: "cli", title: "CLI + Observer", path: "docs/architecture/seed/cli.md", local: "assets/docs/cli.md" },
    { id: "logging", title: "Logging Subsystem", path: "docs/architecture/logging-subsystem.md", local: "assets/docs/logging-subsystem.md" },
    { id: "security", title: "Security & Genesis Key", path: "docs/architecture/seed/security.md", local: "assets/docs/security.md" },
    { id: "premise", title: "Premise", path: "docs/concept/premise.md", local: "assets/docs/premise.md" },
  ];

  const listEl = document.getElementById("doc-list");
  const bodyEl = document.getElementById("doc-body");
  const pathEl = document.getElementById("doc-path");
  const ghBtn = document.getElementById("doc-open-gh");
  const statusEl = document.getElementById("doc-status");

  if (!listEl || !bodyEl || !pathEl) return;

  function setStatus(msg, tone = "muted") {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = `doc-status ${tone}`;
  }

  function renderMarkdown(md) {
    const container = document.createElement("div");
    container.className = "markdown";
    const lines = md.split(/\r?\n/);
    let list = null;
    let inCode = false;
    let codeLines = [];

    const flushList = () => {
      if (list) {
        container.appendChild(list);
        list = null;
      }
    };

    const flushCode = () => {
      if (codeLines.length) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = codeLines.join("\n");
        pre.appendChild(code);
        container.appendChild(pre);
        codeLines = [];
      }
    };

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        if (inCode) {
          flushCode();
          inCode = false;
        } else {
          flushList();
          inCode = true;
          codeLines = [];
        }
        return;
      }

      if (inCode) {
        codeLines.push(line);
        return;
      }

      if (line.startsWith("### ")) {
        flushList();
        const h = document.createElement("h4");
        h.textContent = line.replace(/^###\s*/, "").trim();
        container.appendChild(h);
        return;
      }

      if (line.startsWith("## ")) {
        flushList();
        const h = document.createElement("h3");
        h.textContent = line.replace(/^##\s*/, "").trim();
        container.appendChild(h);
        return;
      }

      if (line.startsWith("# ")) {
        flushList();
        const h = document.createElement("h2");
        h.textContent = line.replace(/^#\s*/, "").trim();
        container.appendChild(h);
        return;
      }

      if (/^\s*-\s+/.test(line)) {
        if (!list) list = document.createElement("ul");
        const li = document.createElement("li");
        li.textContent = line.replace(/^\s*-\s+/, "").trim();
        list.appendChild(li);
        return;
      }

      if (line.trim() === "") {
        flushList();
        return;
      }

      flushList();
      const p = document.createElement("p");
      p.textContent = line;
      container.appendChild(p);
    });

    flushList();
    flushCode();
    return container;
  }

  async function loadDoc(doc) {
    listEl.querySelectorAll(".doc-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.docId === doc.id);
    });
    pathEl.textContent = doc.path;
    if (ghBtn) {
      ghBtn.href = `${repoWeb}${doc.path}`;
    }
    bodyEl.innerHTML = "<p class=\"muted\">Loading…</p>";
    setStatus("");

    const sources = [];
    if (doc.local) sources.push(doc.local);
    sources.push(`${repoRaw}${doc.path}`);

    for (const url of sources) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        bodyEl.innerHTML = "";
        bodyEl.appendChild(renderMarkdown(text));
        setStatus(url.startsWith("assets/") ? "Loaded from bundled snapshot." : "Loaded from symbia-seed main.", "muted");
        return;
      } catch (err) {
        console.warn("Doc load attempt failed", url, err);
      }
    }

    bodyEl.innerHTML = "<p class=\"muted\">Failed to load document.</p>";
    setStatus(`Could not fetch ${doc.path} locally or from GitHub.`, "error");
  }

  function buildList() {
    listEl.innerHTML = "";
    docs.forEach((doc, i) => {
      const btn = document.createElement("button");
      btn.className = "doc-item";
      btn.textContent = doc.title;
      btn.dataset.docId = doc.id;
      btn.addEventListener("click", () => loadDoc(doc));
      listEl.appendChild(btn);
      if (i === 0) {
        loadDoc(doc);
      }
    });
  }

  buildList();
})();
