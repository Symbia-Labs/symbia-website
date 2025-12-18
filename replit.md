# Symbia Labs Website

## Overview
This is the Symbia Labs static website - a company focused on governed execution for agentic systems. The website features a multi-level content system that adjusts technical depth based on user familiarity.

## Project Structure
- **Root HTML pages**: `index.html`, `blog.html`, `products.html`, `research.html`, `services.html`, etc.
- **`/assets/`**: Images, logos, and documentation assets
- **`/content/`**: Blog posts, preprints, and markdown content
- **`/docs/`**: Technical documentation
- **`/scripts/`**: JavaScript files for content loading and interactivity
- **`styles.css`**: Main stylesheet

## Tech Stack
- Static HTML/CSS/JavaScript
- No build process required
- Uses `marked.js` for Markdown rendering (vendored in `/scripts/vendor/`)

## Running Locally
```bash
node server.js
```
Server runs on port 5000.

## Deployment
Configured as a static site deployment. The entire root directory is served as static files.
