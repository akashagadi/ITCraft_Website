# ITCraft website — team source

Complete portable source for the ITCraft website, exported from published version 13, commit `b0d72e78eb2245f055aa833a2717d6583b0b3ebb`, on 7 October 2026. Developer commands and handoff documentation were added for this export. The website HTML, CSS, JavaScript and assets match that version.

## Quick start

Install Python 3.10+ (Windows: enable Add Python to PATH). From the extracted project folder:

```sh
python manage.py dev
```

Open http://127.0.0.1:8000. On Windows, `py` can replace `python`; on macOS/Linux use `python3` if needed. Stop with Ctrl+C. Do not double-click index.html: JavaScript modules need HTTP. The development server is local only, not a production server.

No npm install, pip install, WordPress, API keys, ChatGPT account or proprietary build tool is needed to run this export. Node.js 22+ is needed only for the JavaScript syntax checks. Dependencies used by the browser are included locally.

## Commands

| Command | Purpose |
| --- | --- |
| `python manage.py dev` | Serve `dist/` locally |
| `python manage.py dev --port 8080` | Use another local port |
| `python manage.py build` | Regenerate all 10 HTML pages from editable templates |
| `python manage.py check` | Check local links, anchors, assets and application JS syntax |
| `python manage.py package` | Build, check and create a complete source ZIP under `releases/` |

## Where to edit

| File/folder | Responsibility |
| --- | --- |
| `scripts/content.py` | Product/detail/company content, shared navigation and footer, page generator |
| `scripts/home-template.html` | Homepage layout and initial ecosystem copy |
| `scripts/game-hero.html` | Current homepage game markup and instructions |
| `dist/style.css` | Shared desktop/mobile styling and game effects |
| `dist/app.js` | Homepage interaction, product copy, scroll chapter changes |
| `dist/network-game.js` | 20-second game, scores, red-threat slicing, touch and keyboard input |
| `dist/scene3d.js` | Product emblems, procedural 3D geometry, materials and rotation |
| `dist/brand3d.js` | Story and Partner 3D visuals and retained hero model code |
| `dist/progressive3d.js` | Lazy initialization, mobile/data-saver opt-in and fallback logic |
| `dist/page.js` | Inner-page navigation and 3D initialization |
| `dist/navigation.js` | Navigation prefetch and page transition support |
| `dist/assets/` | Optimized logos, images and SVG artwork |
| `dist/fonts/` | Local fonts and font licenses |
| `dist/vendor/` | Pinned Three.js 0.180.0 and helper modules, with MIT license |
| `artwork/` | Available original artwork, including previous hero images |
| `scripts/check-site.py` | Static link, anchor and asset checks |
| `.github/workflows/check.yml` | GitHub push/PR checks and generated-page consistency check |

`dist/` is both the ready-to-host site and the location of hand-authored JS/CSS/assets; it is intentionally committed. **Do not delete it before building.** The build regenerates HTML only. Edit generated HTML through its templates, or a later build will overwrite those edits. Product teaser copy also lives in `dist/app.js` and the initial homepage template; keep these consistent with detail content.

## Team workflow

1. Create a branch for each change.
2. Edit the relevant source file above.
3. Run `python manage.py build` then `python manage.py check`.
4. Review desktop and mobile in the browser, including game click/swipe, page navigation and the product showcase.
5. Commit templates and regenerated HTML together; open a pull request.

The included GitHub check fails if regeneration changes committed HTML. It does not measure rendering performance or replace real-device review.

## Upload to GitHub

Create an empty repository in your team's GitHub organization, extract the ZIP, and open a terminal inside `ITCraft-Website`:

```sh
git init
git add .
git commit -m "Import ITCraft website source"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL supplied by GitHub. GitHub authentication is handled by your own Git installation. The archive does not include the original repository history, credentials or hosting account settings.

## Hosting

Publish the contents of `dist/` with any static web host. No server-side application or database is required. Keep all subdirectories and relative paths. GitHub repository hosting and website hosting are separate: pushing the repo alone does not publish a website. If using GitHub Pages, configure a deployment that uploads `dist/`; the included workflow only checks code and does not deploy.

Contact actions open email/phone apps; careers links lead to the existing ITCraft website. There is no contact-form backend or game leaderboard. Hosting authentication/access restrictions from the original Site are not included in this static export; configure those separately on your chosen host if needed.

## Current behavior and limitations

- Homepage has the cyber-defence game with red threats splitting on click/swipe and keyboard lane controls. It pauses offscreen or when the tab is hidden. Reduced motion suppresses slicing particles.
- Product showcase uses one procedural Three.js scene, locally hosted textures and five solution chapters. No GLB/GLTF, video or HDR files are required or missing.
- On phones, slow connections or low-memory devices, static artwork appears first and 3D is opt-in. Desktop 3D is deferred until near view.
- Product emblems use supplied logo artwork on 3D mounts; the logos themselves are not fully sculpted models.
- The styles retain earlier iteration rules. Later rules override earlier ones; inspect the cascade when editing.
- Existing business content and commercial terms need the team's review. Automated checks are static checks, not browser, accessibility or mobile performance certification.

## Assets and licenses

Third-party licenses are retained in `dist/vendor/` and `dist/fonts/`. Branding belongs to its respective owner. No open-source license has been assigned to ITCraft's custom content/code by this export. Decide repository visibility and licensing within your team.

`docs/CHANGELOG-ARCHIVE.md` retains historical implementation notes. It describes previous iterations; this README describes the current release. `SHA256SUMS.txt` in the release archive inventories every packaged source file.
