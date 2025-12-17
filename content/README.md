# Content publishing (preprints and blog)

The site now renders markdown stored in-repo for two public sections:

- `content/preprints` -> working papers and research notes (shown on preprints.html)
- `content/blog` -> personal/team posts (shown on blog.html)

## Adding a new post
1) Drop a `.md` file into the right folder.
2) Include light front matter so listings have metadata:
   ```
   ---
   title: My post title
   date: 2025-01-05
   authors: Alice Example, Bob Example
   tags: governed execution, observers
   status: Preprint
   summary: One-line description for the card listing.
   ---

   # Heading
   Body text in markdown...
   ```
3) From the repo root run `node scripts/build-content-index.js` to rebuild `content/[section]/index.json` and `content/content-index.json`.
4) Commit the markdown and the refreshed JSON, then push.

The detail view is at `content.html?type=preprints|blog&slug=your-slug` and is linked automatically from the listings.
