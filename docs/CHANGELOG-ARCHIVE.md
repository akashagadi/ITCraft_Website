# ITCraft — custom website

A portable static website using HTML, CSS and JavaScript, with a locally hosted Three.js r180 product showcase. No WordPress, React or build service is required.

## Run

From this directory: `python -m http.server 8000 --directory dist`
Open http://localhost:8000. Use HTTP rather than opening files directly because JavaScript modules need an HTTP origin.

Deploy the contents of `dist/` to a static web host. Keep `vendor/` and its Three.js MIT licence. The private Sites manifest is not needed on other hosts.

## Structure

- `dist/index.html`: homepage, product showcase, approach, story, partner introduction, FAQs and contact.
- `dist/prismsuite.html`, `projectone.html`, `aegisone.html`, `phoenixodr.html`, `sovereign-cloud.html`: capabilities, challenges, deliverables, workflows and outcomes.
- `dist/about.html`, `partners.html`, `careers.html`, `contact.html`: company/team, partner programme, jobs and contact details.
- `dist/style.css`: shared responsive design.
- `dist/app.js`: homepage navigation, eased product selection and scroll-state updates.
- `dist/scene3d.js`: real WebGL product meshes, physically based materials, lighting and interaction.
- `dist/brand3d.js`: a smooth sculpted ITCraft-inspired shield, interlocking Partner forms and layered Story sculpture.
- `dist/navigation.js`: intent-based same-origin prefetch, with native CSS cross-document view transitions.
- `dist/fonts/`: locally hosted variable WOFF2 fonts and their OFL licences.
- `dist/page.js`: inner-page navigation and lazy 3D initialisation.
- `dist/assets/`: supplied logos optimised as WebP.
- `dist/vendor/`: pinned local Three.js 0.180.0 modules; no external JavaScript CDN dependency.
- `scripts/content.py` and `scripts/home-template.html`: editable content generator and original home template. Run `python scripts/content.py` from the project root to regenerate the ten HTML pages. Edit the generator, rather than generated pages, for persistent copy changes.

## 3D and motion

Products are original symbolic 3D displays using the supplied logo artwork as textures. They are not physical hardware specifications or fully sculpted 3D versions of the logos. Each product has a distinct surrounding form: prism, infrastructure layers, shield, recovery rings or cloud cluster.

One product renderer is used on each product page; detail pages construct only their selected product. The homepage also has a separate shield renderer which pauses offscreen. Story and Partner pages have one sculptural renderer each. Models are created from lightweight geometry; there are no GLB/GLTF, video or HDR downloads. Homepage Three.js loads near the showcase; rendering stops outside the viewport or while the tab is hidden. Pixel ratio is capped at 2 on mobile and desktop, with antialiasing and up to 8× anisotropic texture filtering. After consistently slow product rendering, animation frequency reduces to 30 fps rather than reducing image resolution. There are no real-time shadow maps or post-processing passes. A precomputed-style contact shadow provides grounding.

Reduced-motion preference uses the original logo-card fallback and manual product tabs. A motion control pauses automatic product animation. Desktop visitors can drag the product or reset its view. Touch scrolling stays native. Failed WebGL/module/image initialisation retains the visible logo fallback.

## Content and interactions

Content is adapted from itcraft.net.in as reviewed on 28 September 2026. It restores detailed product information, current leadership, mission, partner benefits, job summaries, FAQs and Mumbai contact details. Unsupported absolute guarantees, generic market statistics and the old legal enforcement-timeline wording were not repeated. Confirm commercial terms and recruitment availability before public launch.

Product and story navigation now stays within this site. Contact actions use email/phone apps. Career application links intentionally go to the existing ITCraft careers application flow; this site does not collect CVs or submit applications. The current domain and hosting have not been changed.

## Validation

Verified JavaScript syntax, local ESM imports, Three.js geometry/environment construction, HTML local links/anchors and supplied asset paths. The managed static-site environment does not provide browser visual QA, so device-level rendering, actual frame rate and touch interaction still need review on the deployed site. Smoothness varies with hardware; no universal frame-rate guarantee is claimed.

## Latest refinements

The hero shield uses analytic curves, rounded circuit strokes, true circular rings and layered enamel/metal surfaces. No enlarged bitmap or pixel-traced contour is used. A matching smooth SVG provides the static fallback. The original supplied artwork is retained under `artwork/`.

Partner visuals use interlocking polished forms; Story uses an offset layered shield sculpture. Both use studio reflections, slow movement, large editorial backdrop text and concise captions. The former node-and-line maps have been removed.

Discover actions and product tabs occupy separate layout rows. Native cross-document view transitions add a brief fade on supported browsers without artificial click delays. Narrow screens use normal-flow product cards and manual tabs. Rendering keeps pixel ratio up to 2 and antialiasing while adapting animation frequency on slower devices. Browser/device visual verification remains outstanding.

## Product showcase update

Large ceramic-and-metal emblems replace the small tablet frames. Original logo artwork is displayed on the emblem face; these are 3D mounts, not fully sculpted reproductions of each illustrated logo. Logo textures keep their original available resolution and use anisotropic filtering. The scene has no new model downloads or post-processing. Product texture loading begins near the section rather than preloading every logo at page start.

Desktop scroll reveals five chapters with eased lateral product changes and subtle rotation. Mobile uses five normal-flow text chapters under one shared sticky WebGL scene. Touch scrolling remains native; reduced-motion visitors retain the static artwork and manual tabs. Offscreen rendering pauses. Checks cover JavaScript syntax and local links; actual mobile GPU frame rate and visual sharpness have not been measured.

## Scroll-controlled ecosystem film

The homepage now maps desktop scroll progress to four complete turns across the five product chapters. One product is visible at a time; it changes on the back-facing part of the turn. Information and colour themes follow the rendered chapter. The scene is pinned during the desktop sequence, with large backdrop typography and separate product details. Mobile retains native scrolling with a shared sticky scene and all five readable information chapters. Product pages keep their independent detail-view interaction.

The emblems display the supplied logo artwork on sculpted mounts; they are not fully sculpted versions of the illustrated logos. No additional libraries, videos or downloaded models are required. Syntax and local-link checks passed; real-device visual quality and frame rates have not been measured.

## Hero and logo visibility correction

The homepage hero now uses a lightweight connected-core sculpture: reflective arcs, luminous edge strips and a faceted centre. The original brand shield remains the static fallback and is still used in the Story sculpture. ProjectOne and cloud platforms sit below and behind the emblem. Logo planes are fitted by their diagonal inside the circular face, preserving the full wordmark. Geometry validity, JavaScript syntax and local links pass; browser visual verification remains outstanding.

## Cinematic hero artwork

The homepage now displays a generated emerald-glass sculpture with a luminous core, replacing the ring sculpture. Subtle CSS float respects reduced motion, the pause control, viewport visibility and hidden tabs. The hero no longer creates a WebGL renderer. Existing product and editorial 3D scenes are preserved. Desktop and mobile WebP assets are under `dist/assets/`; the full generated original is `artwork/hero-glass-original.png`.

Created with built-in image generation. Prompt: premium cinematic CGI emerald-glass monolith with offset architectural layers, a luminous mint/cyan core, crisp blue reflections and a near-black forest-green background; no rings, shield, text, logos or interface.

## Artwork scale and cloud infrastructure

Product textures now use UV bounds around the supplied artwork so embedded white margins no longer make the logos small. The source pixels remain unchanged. Desktop allocates more width to the visual. Rotation now includes a front-facing reading interval and a smooth eased turn between products, with less following delay. Sovereign Cloud uses five metallic server fins and recessed violet light strips behind its emblem; the sphere cluster has been removed.

The reference https://huyml.co/ was reviewed for an artwork-led portfolio direction. This is an adaptation for ITCraft, not a reproduction. Existing native mobile scrolling and reduced-motion behaviour are preserved.

## Homepage network game

The hero now contains a playable circuit-routing puzzle. Visitors rotate seven tiles to connect three systems to the business source. A breadth-first connectivity traversal powers the circuit, validates each endpoint and detects completion. The game includes move count, hints, reset, a completion link to solutions, native keyboard buttons, touch targets and a polite status announcement. It has no external dependency, timer loop, tracking or backend. The previous generated hero art remains in the asset archive.

Checked disconnected initial state, a valid winning sequence, completion controls, reset and hint using the actual game script, plus site links and JavaScript syntax. Device/browser visual review remains unverified.

## Cyber-defence arcade replacement

The hero circuit puzzle has been replaced with a 20-second cyber-defence arcade game. Visitors tap red threats or block lanes with keys 1–3, while green business traffic should pass. Consecutive blocks earn bonuses; missed threats and blocked safe traffic reduce integrity. Includes pause/resume, replay, live score, timer, integrity and an end-of-round solutions link. The game pauses offscreen, on hidden tabs and via the page motion control. Only an active round runs an animation loop. No third-party game library or tracking is used.

Verified actual script start, scoring, clean defence, pause/resume, timer completion, replay and loop termination. Syntax and links pass. Browser/device visual performance remains unverified.

## Business network hero and loading improvements

Removed the hero game and its script/styles. The new optimised hero artwork depicts connected SME workstations, servers, security and backup infrastructure. Created using built-in image generation; prompt: premium photoreal isometric miniature SME infrastructure on a dark forest-green glass platform with mint pathways, server rack, laptops, firewall and backup storage; no text, logos or game elements. Original: `artwork/business-network-original.png`; responsive WebP versions: `dist/assets/business-network*.webp`.

The first-screen hero has no WebGL or animation loop. Product fallback images below the fold lazy-load. Desktop WebGL starts near the viewport after page load and an idle opportunity. Touch phones, data-saver/2G connections and devices reporting <=4 GB memory retain static artwork until View interactive 3D is pressed. This avoids loading the roughly 700 KB uncompressed Three.js modules automatically on those devices. Brand and detail scenes follow the same policy.

Static links, JavaScript syntax and progressive loading logic were checked. No end-to-end network timing or device GPU measurements were available; server/authentication latency is outside these front-end changes.


Homepage game update: red threats now split into two animated pieces on click, swipe or lane-key input, with a short slash trail and six sparks. Effects are capped at 60 elements, respect reduced motion, and clean up on pause or round end. Mobile 3D remains opt-in.
