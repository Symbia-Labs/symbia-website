(() => {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.marked && window.marked.setOptions) {
      window.marked.setOptions({ mangle: false, headerIds: false });
    }
    renderGuide();
  });

  async function renderGuide() {
    const bodyEl = document.getElementById("guide-body");
    const tocEl = document.getElementById("guide-toc");
    const updatedEl = document.getElementById("guide-updated");
    try {
      const res = await fetch(`content/symbia_seed_audit_bundle_reviewer_guide.md?ts=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const markdown = await res.text();
      const html = window.marked
        ? window.marked.parse(markdown)
        : `<pre>${escapeHtml(markdown)}</pre>`;
      if (bodyEl) bodyEl.innerHTML = html;
      buildToc(bodyEl, tocEl);
      if (updatedEl) updatedEl.textContent = "Living spec | sourced from repo content";
    } catch (err) {
      console.error("Failed to load audit guide", err);
      if (bodyEl) bodyEl.innerHTML = '<p class="muted">Could not load the guide. Use the download links above.</p>';
      if (tocEl) tocEl.innerHTML = '<li class="muted small">Outline unavailable.</li>';
    }
  }

  function buildToc(bodyEl, tocEl) {
    if (!bodyEl || !tocEl) return;
    const headings = bodyEl.querySelectorAll("h2, h3");
    if (!headings.length) {
      tocEl.innerHTML = '<li class="muted small">No sections detected.</li>';
      return;
    }

    const seen = new Map();
    const frag = document.createDocumentFragment();
    headings.forEach((heading) => {
      const text = heading.textContent.trim();
      if (!text) return;
      const base = slugify(text);
      const count = seen.get(base) || 0;
      const id = count ? `${base}-${count}` : base;
      seen.set(base, count + 1);
      if (!heading.id) heading.id = id;

      const li = document.createElement("li");
      if (heading.tagName === "H3") li.classList.add("toc-sub");
      const anchor = document.createElement("a");
      anchor.href = `#${heading.id}`;
      anchor.textContent = text;
      li.appendChild(anchor);
      frag.appendChild(li);
    });

    tocEl.innerHTML = "";
    tocEl.appendChild(frag);
  }

  function slugify(text) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "section"
    );
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
