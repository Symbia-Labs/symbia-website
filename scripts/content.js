(() => {
  const LIST_PAGES = ["preprints", "blog"];

  document.addEventListener("DOMContentLoaded", () => {
    if (window.marked && window.marked.setOptions) {
      window.marked.setOptions({ mangle: false, headerIds: false });
    }

    const page = document.body.dataset.page;
    if (LIST_PAGES.includes(page)) {
      const container = document.querySelector("[data-content-list]");
      const emptyState = document.querySelector("[data-empty-state]");
      const updated = document.querySelector("[data-content-updated]");
      renderList(page, container, emptyState, updated);
    }

    if (page === "content") {
      renderArticle();
    }

    const latestLists = document.querySelectorAll("[data-latest]");
    if (latestLists.length) {
      renderLatest(latestLists);
    }
  });

  async function fetchIndex(type) {
    try {
      const res = await fetch(`content/${type}/index.json?ts=${Date.now()}`);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      console.error("Failed to load content index", err);
      return null;
    }
  }

  function formatDate(input) {
    if (!input) return "";
    const date = new Date(input);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function buildTagPill(text) {
    const span = document.createElement("span");
    span.className = "chip ghost";
    span.textContent = text;
    return span;
  }

  function createCard(item) {
    const card = document.createElement("article");
    card.className = "content-card";

    const anchor = document.createElement("a");
    anchor.href = item.url;
    anchor.className = "card-link";

    const meta = document.createElement("div");
    meta.className = "meta-row";
    const status = document.createElement("span");
    status.className = "chip subtle";
    status.textContent = item.status || "Update";
    const date = document.createElement("time");
    date.className = "muted";
    date.dateTime = item.date || "";
    date.textContent = formatDate(item.date);
    meta.append(status, date);

    const title = document.createElement("h3");
    title.textContent = item.title;

    const summary = document.createElement("p");
    summary.className = "muted";
    summary.textContent = item.summary;

    const footer = document.createElement("div");
    footer.className = "content-card-footer";

    if (item.authors && item.authors.length) {
      const authors = document.createElement("p");
      authors.className = "muted small";
      authors.textContent = item.authors.join(" | ");
      footer.appendChild(authors);
    }

    if (item.tags && item.tags.length) {
      const tags = document.createElement("div");
      tags.className = "tag-row";
      item.tags.slice(0, 4).forEach((tag) => tags.appendChild(buildTagPill(tag)));
      footer.appendChild(tags);
    }

    anchor.append(meta, title, summary, footer);
    card.append(anchor);
    return card;
  }

  async function renderList(type, container, emptyState, updatedEl) {
    if (!container) return;
    const index = await fetchIndex(type);
    if (!index || !index.items || !index.items.length) {
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    index.items.forEach((item) => {
      container.appendChild(createCard(item));
    });

    if (updatedEl && index.updated) {
      updatedEl.textContent = `Updated ${formatDate(index.updated)}`;
    }
  }

  async function renderLatest(nodeList) {
    for (const el of nodeList) {
      const type = el.dataset.latest === "blog" ? "blog" : "preprints";
      const limit = parseInt(el.dataset.limit || "3", 10);
      const index = await fetchIndex(type);

      if (!index || !index.items || !index.items.length) {
        el.innerHTML = '<li class="muted small">No entries yet.</li>';
        continue;
      }

      const frag = document.createDocumentFragment();
      index.items.slice(0, limit).forEach((item) => {
        const li = document.createElement("li");
        li.className = "mini-list-item";
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = item.title;
        const meta = document.createElement("span");
        meta.className = "muted small";
        meta.textContent = formatDate(item.date);
        li.append(link, meta);
        frag.appendChild(li);
      });

      el.appendChild(frag);
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stripFrontMatter(markdown) {
    if (!markdown.startsWith("---")) return markdown;
    const end = markdown.indexOf("\n---", 3);
    if (end === -1) return markdown;
    return markdown.slice(end + 4).trimStart();
  }

  async function renderArticle() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") === "blog" ? "blog" : "preprints";
    const slug = params.get("slug");
    const bodyEl = document.getElementById("article-body");
    const summaryEl = document.getElementById("article-summary");
    const titleEl = document.getElementById("article-title");
    const dateEl = document.getElementById("article-date");
    const authorsEl = document.getElementById("article-authors");
    const statusEl = document.getElementById("article-status");
    const tagsEl = document.getElementById("article-tags");
    const backLink = document.getElementById("article-back");
    const typeEl = document.getElementById("article-type");
    const downloadLink = document.getElementById("article-download");

    if (backLink) {
      backLink.href = type === "blog" ? "blog.html" : "preprints.html";
      backLink.textContent = type === "blog" ? "Back to Blog" : "Back to Preprints";
    }
    if (typeEl) {
      typeEl.textContent = type === "blog" ? "Blog" : "Research preprint";
    }

    if (!slug) {
      if (bodyEl) bodyEl.innerHTML = "<p class=\"muted\">No article specified.</p>";
      return;
    }

    const index = await fetchIndex(type);
    if (!index || !index.items) {
      if (bodyEl) bodyEl.innerHTML = "<p class=\"muted\">Unable to load content.</p>";
      return;
    }

    const item = index.items.find((entry) => entry.slug === slug);
    if (!item) {
      if (bodyEl) bodyEl.innerHTML = "<p class=\"muted\">Content not found.</p>";
      return;
    }

    if (titleEl) titleEl.textContent = item.title;
    if (summaryEl) summaryEl.textContent = item.summary;
    if (dateEl) dateEl.textContent = formatDate(item.date);
    if (statusEl) statusEl.textContent = item.status || "Update";
    if (authorsEl) authorsEl.textContent = item.authors ? item.authors.join(" | ") : "";
    if (tagsEl && item.tags && item.tags.length) {
      item.tags.forEach((tag) => tagsEl.appendChild(buildTagPill(tag)));
    }
    if (downloadLink) {
      downloadLink.href = item.source;
      downloadLink.download = "";
    }
    document.title = `Symbia Labs | ${item.title}`;

    try {
      const res = await fetch(`${item.source}?ts=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Failed to load source ${item.source}: ${res.status}`);
      }
      const markdown = stripFrontMatter(await res.text());
      const html = window.marked
        ? window.marked.parse(markdown)
        : `<pre>${escapeHtml(markdown)}</pre>`;
      if (bodyEl) bodyEl.innerHTML = html;
    } catch (err) {
      console.error("Failed to load markdown", err);
      if (bodyEl) bodyEl.innerHTML = "<p class=\"muted\">Could not render this content.</p>";
    }
  }
})();
