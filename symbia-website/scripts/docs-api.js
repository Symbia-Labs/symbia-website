(function () {
  const fallbackDocs = [
    { id: "quickstart", title: "Quickstart & Boot", path: "docs/architecture/quickstart.md" },
    { id: "cli", title: "CLI + Observer", path: "docs/architecture/seed/cli.md" },
    { id: "logging", title: "Logging Subsystem", path: "docs/architecture/logging-subsystem.md" },
    { id: "security", title: "Security & Genesis Key", path: "docs/architecture/seed/security.md" },
    { id: "premise", title: "Premise", path: "docs/concept/premise.md" },
  ];

  const listEl = document.getElementById("doc-list");
  const bodyEl = document.getElementById("doc-body");
  const pathEl = document.getElementById("doc-path");
  const ghBtn = document.getElementById("doc-open-gh");
  const statusEl = document.getElementById("doc-status");
  const curatedPaths = new Set(fallbackDocs.map((d) => d.path));
  let docs = fallbackDocs.slice();
  let activeDoc = null;
  const sectionState = {};

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
    if (!doc) return;
    activeDoc = doc;
    const docId = doc.id || doc.path;
    listEl.querySelectorAll(".doc-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.docId === docId);
    });
    pathEl.textContent = doc.path;
    if (ghBtn) {
      ghBtn.href = `https://github.com/Symbia-Labs/symbia-website/blob/main/${doc.path}`;
    }
    bodyEl.innerHTML = "<p class=\"muted\">Loading…</p>";
    setStatus("");

    try {
      const res = await fetch(doc.path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      bodyEl.innerHTML = "";
      bodyEl.appendChild(renderMarkdown(text));
      setStatus("", "muted");
    } catch (err) {
      console.warn("Doc load error", doc.path, err);
      bodyEl.innerHTML = "<p class=\"muted\">Failed to load document.</p>";
      setStatus(`Could not fetch ${doc.path}.`, "error");
    }
  }

  function normalizeDocs(rawDocs) {
    const seen = new Set();
    return rawDocs
      .map((doc) => {
        const id = doc.id || doc.path;
        if (!id || !doc.path) return null;
        if (seen.has(id)) return null;
        seen.add(id);
        return { ...doc, id };
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async function fetchDocs() {
    try {
      const res = await fetch("docs/docs-index.json?v=1");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.docs)) return data.docs;
    } catch (err) {
      console.warn("Docs index fetch failed, using fallback", err);
    }
    return fallbackDocs;
  }

  function groupKey(doc) {
    const parts = doc.path.split("/");
    return parts.length > 1 ? parts[1] : "other";
  }

  function groupLabel(key) {
    if (!key) return "Other";
    return key
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function currentActiveId() {
    return activeDoc ? activeDoc.id || activeDoc.path : null;
  }

  function renderSections(query = "") {
    const q = (query || "").trim().toLowerCase();
    const sectionsRoot = listEl.querySelector(".doc-sections");
    if (!sectionsRoot) return;
    sectionsRoot.innerHTML = "";

    const filtered = docs.filter((doc) => {
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.path.toLowerCase().includes(q.replace(/\s+/g, "-"))
      );
    });

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No docs found.";
      sectionsRoot.appendChild(empty);
      return;
    }

    const featured = filtered.filter((doc) => curatedPaths.has(doc.path));
    const grouped = {};
    filtered.forEach((doc) => {
      if (curatedPaths.has(doc.path)) return;
      const key = groupKey(doc);
      grouped[key] = grouped[key] || [];
      grouped[key].push(doc);
    });

    const sections = [];
    if (featured.length) {
      sections.push({ key: "featured", title: "Featured", items: featured, defaultOpen: true });
    }
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        const items = grouped[key].sort((a, b) => a.title.localeCompare(b.title));
        sections.push({
          key,
          title: groupLabel(key),
          items,
          defaultOpen: key === "architecture" || q.length > 0,
        });
      });

    sections.forEach((section) => {
      const open = q ? true : sectionState[section.key] ?? section.defaultOpen ?? false;
      const wrapper = document.createElement("div");
      wrapper.className = `doc-section${open ? "" : " collapsed"}`;

      const header = document.createElement("button");
      header.className = "doc-section-header";
      header.type = "button";
      header.textContent = `${section.title} (${section.items.length})`;
      header.addEventListener("click", () => {
        const isOpen = !wrapper.classList.contains("collapsed");
        sectionState[section.key] = !isOpen;
        wrapper.classList.toggle("collapsed");
      });

      const list = document.createElement("div");
      list.className = "doc-sublist";
      section.items.forEach((doc) => {
        const btn = document.createElement("button");
        btn.className = "doc-item";
        btn.textContent = doc.title;
        btn.dataset.docId = doc.id;
        btn.addEventListener("click", () => loadDoc(doc));
        if (currentActiveId() === doc.id) {
          btn.classList.add("active");
        }
        list.appendChild(btn);
      });

      wrapper.appendChild(header);
      wrapper.appendChild(list);
      sectionsRoot.appendChild(wrapper);
    });
  }

  async function buildList() {
    docs = normalizeDocs(await fetchDocs());
    listEl.innerHTML = "";

    const controls = document.createElement("div");
    controls.className = "doc-controls";
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search docs...";
    search.className = "doc-search";
    search.addEventListener("input", (e) => renderSections(e.target.value));
    controls.appendChild(search);

    const sectionsRoot = document.createElement("div");
    sectionsRoot.className = "doc-sections";

    listEl.appendChild(controls);
    listEl.appendChild(sectionsRoot);
    renderSections();

    const first = docs.find((d) => curatedPaths.has(d.path)) || docs[0];
    if (first) {
      loadDoc(first);
    }
  }

  buildList();
})();
