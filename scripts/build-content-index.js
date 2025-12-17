#!/usr/bin/env node

/**
 * Build simple JSON indexes for markdown content so the site can render
 * research preprints and blog posts without manually editing HTML.
 *
 * Usage: node scripts/build-content-index.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const sections = [
  {
    key: "preprints",
    label: "Research preprints",
    dir: path.join(ROOT, "content", "preprints"),
    output: path.join(ROOT, "content", "preprints", "index.json"),
  },
  {
    key: "blog",
    label: "Blog posts",
    dir: path.join(ROOT, "content", "blog"),
    output: path.join(ROOT, "content", "blog", "index.json"),
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function toSlug(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseValue(raw, key) {
  if (raw === undefined || raw === null) return "";
  const trimmed = raw.trim();
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "");

  const wantsArray = ["tags", "tag", "authors", "author"].includes((key || "").toLowerCase());

  if (wantsArray && unquoted.startsWith("[") && unquoted.endsWith("]")) {
    return unquoted
      .slice(1, -1)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  if (wantsArray && unquoted.includes(",") && !unquoted.includes("http")) {
    return unquoted
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return unquoted;
}

function parseFrontMatter(raw) {
  if (!raw.startsWith("---")) {
    return { meta: {}, body: raw.trim() };
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { meta: {}, body: raw.trim() };
  }

  const header = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const meta = {};

  header.split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) return;
    meta[key.toLowerCase()] = parseValue(value, key);
  });

  return { meta, body };
}

function normalizeDate(dateValue, fallback) {
  if (dateValue) {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  if (fallback) {
    return fallback.toISOString().slice(0, 10);
  }
  return "";
}

function summarize(text, fallback) {
  if (Array.isArray(fallback)) return fallback.join(" ");
  if (fallback) return fallback;
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#[^\n]*$/gm, "")
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 240) + (cleaned.length > 240 ? "..." : "");
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function buildSection(section) {
  ensureDir(section.dir);
  const files = fs.readdirSync(section.dir).filter((f) => f.endsWith(".md"));

  const items = files
    .map((filename) => {
      const filePath = path.join(section.dir, filename);
      const raw = fs.readFileSync(filePath, "utf8");
      const { meta, body } = parseFrontMatter(raw);
      const stat = fs.statSync(filePath);

      const fallbackTitle = path.basename(filename, ".md").replace(/[-_]/g, " ");
      const slug = meta.slug ? toSlug(meta.slug) : toSlug(path.basename(filename, ".md"));
      const date = normalizeDate(meta.date, stat.mtime);
      const tags = parseArray(meta.tags);
      const authors = parseArray(meta.authors || meta.author);
      const summary = summarize(body, meta.summary);

      return {
        slug,
        title: meta.title || fallbackTitle,
        date,
        tags,
        authors,
        summary,
        status: meta.status || section.label,
        source: path
          .join("content", section.key === "preprints" ? "preprints" : "blog", `${path.basename(filename)}`)
          .replace(/\\/g, "/"),
        url: `content.html?type=${section.key}&slug=${slug}`,
        timestamp: new Date(date || stat.mtime).getTime(),
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  fs.writeFileSync(section.output, JSON.stringify({ updated: new Date().toISOString(), items }, null, 2));
  return items;
}

function writeCombinedIndex(map) {
  const output = {
    updated: new Date().toISOString(),
    sections: Object.keys(map),
    items: map,
  };
  fs.writeFileSync(path.join(ROOT, "content", "content-index.json"), JSON.stringify(output, null, 2));
}

function main() {
  const combined = {};
  sections.forEach((section) => {
    combined[section.key] = buildSection(section);
    console.log(`Indexed ${combined[section.key].length} ${section.key}`);
  });
  writeCombinedIndex(combined);
  console.log("Content indexes written to content/[section]/index.json");
}

main();
