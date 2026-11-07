import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "content", "site-content.mjs");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function renderLinkAttributes(href) {
  if (!isExternalUrl(href)) {
    return `href="${escapeHtml(href)}"`;
  }

  return `href="${escapeHtml(href)}" target="_blank" rel="noreferrer"`;
}

function pdfNote(href, label) {
  return /\.pdf(?:[?#]|$)/i.test(String(href)) && !/pdf/i.test(String(label)) ? " (PDF)" : "";
}

function newTabNote(href) {
  return isExternalUrl(href) ? '<span class="visually-hidden"> (opens in a new tab)</span>' : "";
}

// A centered block that starts with a link is a call to action: render that link as a button.
function promoteLeadingLink(text) {
  return String(text || "").replace(/^\s*\[link ([^\]]+)\]([\s\S]*?)\[\/link\]/i, "[button $1]$2[/button]");
}

function applyInlineMarkup(input) {
  let output = escapeHtml(String(input || ""));

  const replacements = [
    {
      pattern: /\[b\]([\s\S]*?)\[\/b\]/gi,
      replacement: (_match, inner) => `<strong>${inner}</strong>`,
    },
    {
      pattern: /\[i\]([\s\S]*?)\[\/i\]/gi,
      replacement: (_match, inner) => `<em>${inner}</em>`,
    },
    {
      pattern: /\[code\]([\s\S]*?)\[\/code\]/gi,
      replacement: (_match, inner) => `<code>${inner}</code>`,
    },
    {
      pattern: /\[button ([^\]]+)\]([\s\S]*?)\[\/button\]/gi,
      replacement: (_match, href, inner) =>
        `<a class="button" ${renderLinkAttributes(href)}>${inner}${newTabNote(href)}</a>`,
    },
    {
      pattern: /\[link ([^\]]+)\]([\s\S]*?)\[\/link\]/gi,
      replacement: (_match, href, inner) => `<a ${renderLinkAttributes(href)}>${inner}${pdfNote(href, inner)}${newTabNote(href)}</a>`,
    },
  ];

  for (let index = 0; index < 8; index += 1) {
    const previous = output;
    replacements.forEach(({ pattern, replacement }) => {
      output = output.replace(pattern, replacement);
    });
    if (previous === output) {
      break;
    }
  }

  return output.replace(/\[br\]/gi, "<br />");
}

function parseSingleLinkText(text) {
  const match = String(text || "").trim().match(/^\[link ([^\]]+)\]([\s\S]*?)\[\/link\]$/i);
  if (!match) {
    return null;
  }

  return {
    href: String(match[1] || "").trim(),
    label: String(match[2] || "").trim(),
  };
}

function isCtaImageTextBlock(block) {
  const classes = Array.isArray(block.extraClasses) ? block.extraClasses : [];
  return (
    String(block.type || "") === "text" &&
    Boolean(block.imageSrc) &&
    Boolean(block.imageAlt) &&
    classes.includes("text-center") &&
    Boolean(parseSingleLinkText(block.text))
  );
}

// Paragraphs that are really lists of short lines (e.g. nickname lists) get a compact list style.
function lineListClass(block) {
  const parts = block.trim().split(/\[br\]|\n/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 5) {
    return "";
  }
  const isShort = parts.every((part) => part.replace(/\[[^\]]*\]/g, "").length <= 60);
  return isShort ? ' class="line-list"' : ' class="line-block"';
}

function renderMarkup(text, options = {}) {
  const value = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!value) {
    return "";
  }

  const listClass = options.listClass || "subtitle-list";
  const blocks = value.split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trimEnd());
      const nonEmpty = lines.map((line) => line.trim()).filter(Boolean);

      if (nonEmpty.length > 0 && nonEmpty.every((line) => line.startsWith("- "))) {
        const items = nonEmpty
          .map((line) => `          <li>${applyInlineMarkup(line.slice(2))}</li>`)
          .join("\n");
        return `        <ul class="${listClass}">\n${items}\n        </ul>`;
      }

      const centered = block.trim().match(/^\[center\]([\s\S]*?)\[\/center\]$/i);
      if (centered) {
        const isCta = /^\s*\[link /i.test(centered[1]);
        return `        <p class="text-center${isCta ? " cta" : ""}">${applyInlineMarkup(promoteLeadingLink(centered[1]))}</p>`;
      }

      const paragraph = lines.map((line) => applyInlineMarkup(line.trim())).join("<br />");
      return `        <p${lineListClass(block)}>${paragraph}</p>`;
    })
    .join("\n");
}

function sortByImportance(items) {
  return [...items].sort((left, right) => {
    if (right.importance !== left.importance) {
      return right.importance - left.importance;
    }
    return left.title.localeCompare(right.title);
  });
}

function normalizeImportance(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(100, Math.max(1, parsed));
}

function normalizeBlocks(blocks) {
  return Array.isArray(blocks)
    ? blocks.map((block) => ({
        type: String(block.type || "text"),
        delay: String(block.delay || ""),
        heading: String(block.heading || ""),
        text: String(block.text || ""),
        textAfterImage: String(block.textAfterImage || ""),
        caption: String(block.caption || ""),
        imageSrc: String(block.imageSrc || ""),
        imageAlt: String(block.imageAlt || ""),
        imageStyle: String(block.imageStyle || "full"),
        imageLink: String(block.imageLink || ""),
        imagePosition: String(block.imagePosition || "before"),
        extraClasses: Array.isArray(block.extraClasses) ? block.extraClasses : [],
        headerLinkLabel: String(block.headerLinkLabel || ""),
        headerLinkHref: String(block.headerLinkHref || ""),
        embedSrc: String(block.embedSrc || ""),
        embedTitle: String(block.embedTitle || ""),
        embedHeight: String(block.embedHeight || ""),
        pdfSrc: String(block.pdfSrc || ""),
        pdfTitle: String(block.pdfTitle || ""),
        tableHeaders: Array.isArray(block.tableHeaders) ? block.tableHeaders : [],
        tableRows: Array.isArray(block.tableRows) ? block.tableRows : [],
        linkItems: Array.isArray(block.linkItems) ? block.linkItems : [],
      }))
    : [];
}

function normalizeItems(items, kind) {
  return Array.isArray(items)
    ? items.map((item) => ({
        kind,
        title: String(item.title || "").trim(),
        slug: String(item.slug || "").trim(),
        importance: normalizeImportance(item.importance),
        hiddenFromListings: Boolean(item.hiddenFromListings),
        metaDescription: String(item.metaDescription || "").trim(),
        ...(item.shareImage ? { shareImage: item.shareImage } : {}),
        ...(item.homeTag ? { homeTag: String(item.homeTag).trim() } : {}),
        ...(item.cardImage ? { cardImage: String(item.cardImage).trim() } : {}),
        homeCardText: String(item.homeCardText || ""),
        archiveCardText: String(item.archiveCardText || ""),
        archiveCardClass: String(item.archiveCardClass || "").trim(),
        pageIntroText: String(item.pageIntroText || ""),
        detailPageEnabled: kind === "writing" ? item.detailPageEnabled !== false : Boolean(item.detailPageEnabled),
        homeHref: String(item.homeHref || (kind === "writing" ? `./${item.slug}.html` : "")),
        archiveHref: String(item.archiveHref || (kind === "writing" ? `./${item.slug}.html` : "")),
        blocks: normalizeBlocks(item.blocks),
      }))
    : [];
}

function normalizeSiteContent(content) {
  return {
    writing: normalizeItems(content?.writing, "writing"),
    projects: normalizeItems(content?.projects, "projects"),
  };
}

export async function loadSiteContent() {
  const moduleUrl = pathToFileURL(sourcePath);
  moduleUrl.searchParams.set("t", Date.now().toString());
  const imported = await import(moduleUrl.href);
  return normalizeSiteContent(imported.default || {});
}

export function validateSiteContent(content) {
  const normalized = normalizeSiteContent(content);

  ["writing", "projects"].forEach((kind) => {
    const seen = new Set();
    normalized[kind].forEach((item) => {
      if (!item.title) {
        throw new Error(`A ${kind} entry is missing a title.`);
      }
      if (!item.slug) {
        throw new Error(`"${item.title}" is missing a slug.`);
      }
      if (!/^[a-z0-9_]+$/.test(item.slug)) {
        throw new Error(`"${item.title}" has an invalid slug.`);
      }
      if (seen.has(item.slug)) {
        throw new Error(`Duplicate ${kind} slug "${item.slug}".`);
      }
      if (!Number.isInteger(item.importance) || item.importance < 1 || item.importance > 100) {
        throw new Error(`"${item.title}" must have an importance between 1 and 100.`);
      }
      seen.add(item.slug);
    });
  });

  return normalized;
}

export async function saveSiteContent(content) {
  const normalized = validateSiteContent(content);
  const body = `const siteContent = ${JSON.stringify(normalized, null, 2)};\n\nexport default siteContent;\n`;
  await fs.writeFile(sourcePath, body, "utf8");
}

const SITE_NAME = "Entangled Particles";
const ASSET_VERSION = "5";
const DEFAULT_SHARE_IMAGE = {
  url: "https://entangledparticles.xyz/assets/entangledParticlesLogo.jpg",
  type: "image/jpeg",
  width: 1408,
  height: 768,
  alt: "Entangled Particles logo in black lettering on white",
};

function renderHead(pageTitle, metaDescription, shareUrl, shareImage = DEFAULT_SHARE_IMAGE, shareType = "website", noindex = false) {
  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta
      name="description"
      content="${escapeHtml(metaDescription)}"
    />
    <meta name="theme-color" content="#b30000" />
${noindex ? '    <meta name="robots" content="noindex" />\n' : ""}${shareUrl ? `    <link rel="canonical" href="${escapeHtml(shareUrl)}" />
    <meta property="og:type" content="${escapeHtml(shareType)}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:url" content="${escapeHtml(shareUrl)}" />
    <meta property="og:image" content="${escapeHtml(shareImage.url)}" />
    <meta property="og:image:type" content="${escapeHtml(shareImage.type)}" />
    <meta property="og:image:width" content="${escapeHtml(shareImage.width)}" />
    <meta property="og:image:height" content="${escapeHtml(shareImage.height)}" />
    <meta property="og:image:alt" content="${escapeHtml(shareImage.alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(shareImage.url)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(shareImage.alt)}" />
` : ""}    <link rel="icon" type="image/png" href="./nano.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,600;0,6..12,700;1,6..12,400&family=Quicksand:wght@500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css?v=${ASSET_VERSION}" />
  </head>`;
}

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/millxing?tab=repositories",
    paths: ['<path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>'],
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/robschoen/",
    paths: ['<path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zM4.943 13.5V6.169H2.542V13.5h2.4zM3.743 5.168c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zM13.458 13.5V9.359c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.694 0 7.331 0 7.331h2.4v-4.094c0-.219.016-.438.08-.594.175-.438.574-.891 1.245-.891.878 0 1.23.672 1.23 1.656V13.5h2.4z"/>'],
  },
  {
    label: "Email",
    href: "mailto:robschoen.robschoen@gmail.com",
    paths: ['<path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-.5a.5.5 0 0 0-.5.5v.217l6.5 3.9 6.5-3.9V4a.5.5 0 0 0-.5-.5H2zm12.5 2.458-4.796 2.878 4.796 3.264V5.958zM14.204 12.5 8.68 8.74 8 9.147l-.681-.408L1.796 12.5h12.408zM1.5 12.1l4.796-3.264L1.5 5.958V12.1z"/>'],
  },
  {
    label: "Resume",
    href: "https://www.dropbox.com/scl/fi/demzlgct5g7ve15c9kz8j/resume_Rob-Schoen.docx?rlkey=ylomjukk1df5zfzfx1qbh2jus&dl=0",
    paths: [
      '<path d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5z"/>',
      '<path d="M5 7.5h6v1H5v-1zm0 2h6v1H5v-1zm0 2h4v1H5v-1z"/>',
    ],
  },
];

const SECTION_LINKS = [
  { key: "projects", label: "Projects", href: "./projects.html", path: '<path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z"/>' },
  { key: "interests", label: "Interests", href: "./writing.html", path: '<path d="M8 0a5.5 5.5 0 0 0-3.2 9.97c.43.31.7.8.7 1.33V12h5v-.7c0-.53.27-1.02.7-1.33A5.5 5.5 0 0 0 8 0zM5.5 13h5v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1z"/>' },
];

function renderHeader(current = "") {
  const sections = SECTION_LINKS.map(
    (link) => `          <a class="site-link site-link--section" href="${link.href}"${link.key === current ? ' aria-current="page"' : ""}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${link.path}</svg>
            <span>${link.label}</span>
          </a>`,
  ).join("\n");
  const links = SOCIAL_LINKS.map(
    (link) => `          <a class="site-link" ${renderLinkAttributes(link.href)}${isExternalUrl(link.href) ? ` aria-label="${escapeHtml(link.label)} (opens in a new tab)"` : ""}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">${link.paths.join("")}</svg>
            <span>${escapeHtml(link.label)}</span>
          </a>`,
  ).join("\n");

  return `    <header class="site-header">
      <div class="site-header__inner">
        <a href="./index.html" class="site-title" aria-label="${SITE_NAME}: home">
          <img src="./assets/entangledParticlesLogo_transparent_white.png" class="site-title-logo" alt="" width="2172" height="724" />
        </a>
        <nav class="site-links" aria-label="Site">
${sections}
          <span class="site-links__divider" aria-hidden="true"></span>
${links}
        </nav>
      </div>
    </header>`;
}

function renderFooter({ showArchive = true } = {}) {
  return `    <footer class="site-footer">
      <p>Contact: <a href="mailto:robschoen.robschoen@gmail.com">robschoen.robschoen@gmail.com</a><br />Content licensed under <a ${renderLinkAttributes("https://creativecommons.org/licenses/by/4.0/")}>CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a> unless otherwise stated.</p>${showArchive ? `
      <nav class="footer-links" aria-label="Archives">
        <a href="./index.html">All posts</a>
        <a href="./projects.html">Project archive</a>
        <a href="./writing.html">Interest archive</a>
      </nav>` : ""}
    </footer>`;
}

function renderBackgroundScripts() {
  return `    <script>
      window.floatingBackgroundConfig = {
        density: 18, shape: "square", size: { min: 100, max: 260 }, speed: { min: 30, max: 65 },
      };
    </script>
    <script src="./background.js?v=${ASSET_VERSION}"></script>
    <script src="./site.js?v=${ASSET_VERSION}" defer></script>`;
}

function renderPage({ title, description, shareUrl, shareImage, shareType, bodyClass, main, footer, current = "", noindex = false }) {
  return `<!DOCTYPE html>
<html lang="en">
${renderHead(title, description, shareUrl, shareImage, shareType, noindex)}
  <body class="${bodyClass}">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="floating-squares" aria-hidden="true"></div>
    <div class="site-shell">
${renderHeader(current)}
${main}
${footer ?? renderFooter()}
    </div>
${renderBackgroundScripts()}
  </body>
</html>
`;
}

function renderPanelHeader(heading, linkLabel, linkHref) {
  if (!heading && !linkLabel) {
    return "";
  }

  const headingMarkup = heading ? `\n          <h2>${escapeHtml(heading)}</h2>` : "";
  const linkMarkup = linkLabel ? `\n          <a ${renderLinkAttributes(linkHref)}>${escapeHtml(linkLabel)}${newTabNote(linkHref)}</a>` : "";

  return `        <div class="panel-header">${headingMarkup}${linkMarkup}\n        </div>\n`;
}

function sectionClasses(block, extra = []) {
  return ["panel", ...block.extraClasses, ...extra].join(" ");
}

function mediaClass(style) {
  const known = ["full", "large-center", "medium-center", "small-center", "full-white"];
  return `media media--${known.includes(style) ? style : "full"}`;
}

// GIFs that have an MP4 conversion next to them are served as lightweight looping video.
function videoSourceFor(src) {
  const value = String(src || "");
  if (!/\.gif$/i.test(value) || !value.startsWith("./")) {
    return null;
  }
  const mp4 = value.replace(/\.gif$/i, ".mp4");
  const poster = value.replace(/\.gif$/i, "-poster.jpg");
  const exists = (relative) => existsSync(path.join(rootDir, relative));
  return exists(mp4) && exists(poster) ? { mp4, poster } : null;
}

function renderMediaElement(src, alt, { controls = false, indent = "          " } = {}) {
  const video = videoSourceFor(src);
  if (video) {
    return `${indent}<video class="loop-video" src="${escapeHtml(video.mp4)}" poster="${escapeHtml(video.poster)}" aria-label="${escapeHtml(alt)}" muted loop playsinline preload="metadata" data-autoplay${controls ? " controls" : ""}></video>`;
  }
  return `${indent}<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />`;
}

function renderFigure({ src, alt, style, href, caption }) {
  const media = renderMediaElement(src, alt, { indent: href ? "            " : "          " });
  const external = isExternalUrl(href);
  const badge = external ? `Visit ${escapeHtml(displayDomain(href))} ↗` : "Open →";
  const body = href
    ? `          <a class="media-link" ${renderLinkAttributes(href)}>
${media}
            <span class="media-link__badge" aria-hidden="true">${badge}</span>${external ? '\n            <span class="visually-hidden"> (opens in a new tab)</span>' : ""}
          </a>`
    : media;
  const captionMarkup = caption ? `\n          <figcaption>${caption}</figcaption>` : "";
  return `        <figure class="${mediaClass(style)}">
${body}${captionMarkup}
        </figure>`;
}

function renderTextBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);

  if (isCtaImageTextBlock(block)) {
    const link = parseSingleLinkText(block.text);
    const imageHref = String(block.imageLink || link?.href || "").trim();
    const figure = renderFigure({ src: block.imageSrc, alt: block.imageAlt, style: block.imageStyle, href: imageHref });
    return `      <section class="${sectionClasses(block, ["panel--cta"])}">
${header}        <p class="cta"><a class="button" ${renderLinkAttributes(link.href)}>${escapeHtml(link.label)}${newTabNote(link.href)}</a></p>
${figure}
      </section>`;
  }

  const isAfter = String(block.imagePosition || "").trim().toLowerCase() === "after";
  const figure = block.imageSrc
    ? renderFigure({ src: block.imageSrc, alt: block.imageAlt, style: block.imageStyle, href: String(block.imageLink || "").trim() })
    : "";
  const bodyMarkup = renderMarkup(block.text);
  const parts = isAfter ? [bodyMarkup, figure] : [figure, bodyMarkup];
  if (block.textAfterImage) {
    parts.push(renderMarkup(block.textAfterImage));
  }

  return `      <section class="${sectionClasses(block)}">
${header}${parts.filter(Boolean).join("\n")}
      </section>`;
}

function renderImageBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const captionLines = String(block.caption || "")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => applyInlineMarkup(line));
  // An image that links to an outside reference stays enlargeable; the link moves into the caption.
  const linkToCaption = isExternalUrl(block.imageLink);
  if (linkToCaption) {
    captionLines.push(`<a ${renderLinkAttributes(block.imageLink)}>View at ${escapeHtml(displayDomain(block.imageLink))}${newTabNote(block.imageLink)}</a>`);
  }
  const figure = renderFigure({
    src: block.imageSrc,
    alt: block.imageAlt,
    style: block.imageStyle,
    href: linkToCaption ? "" : block.imageLink,
    caption: captionLines.join("<br />"),
  });

  return `      <section class="${sectionClasses(block, ["panel--media"])}">
${header}${figure}
      </section>`;
}

function renderTableBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const intro = renderMarkup(block.text);
  const headerMarkup = block.tableHeaders.length > 0
    ? `          <thead>
            <tr>
${block.tableHeaders.map((cell) => `              <th scope="col">${applyInlineMarkup(cell)}</th>`).join("\n")}
            </tr>
          </thead>\n`
    : "";
  const bodyRows = block.tableRows
    .map((row) => `            <tr>
${row.map((cell) => `              <td>${applyInlineMarkup(cell)}</td>`).join("\n")}
            </tr>`)
    .join("\n");
  const twoColumn = block.tableRows.every((row) => row.length === 2);

  return `      <section class="${sectionClasses(block)}">
${header}${intro ? `${intro}\n` : ""}        <div class="table-wrap">
        <table class="data-table${twoColumn ? " data-table--split" : ""}">
${headerMarkup}          <tbody>
${bodyRows}
          </tbody>
        </table>
        </div>
      </section>`;
}

function renderLinksBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const items = block.linkItems
    .map((item) => `          <li><a ${renderLinkAttributes(item.href)}>${escapeHtml(item.label)}${newTabNote(item.href)}</a></li>`)
    .join("\n");

  return `      <section class="${sectionClasses(block)}">
${header}        <ul class="link-list">
${items}
        </ul>
      </section>`;
}

function isSpotifyEmbed(src) {
  return /^https:\/\/open\.spotify\.com\/embed\//i.test(String(src || ""));
}

function isYouTubeEmbed(src) {
  return /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\//i.test(String(src || ""));
}

function normalizePixelValue(value, fallback) {
  const match = String(value || fallback).trim().match(/^(\d+)(?:px)?$/i);
  return match ? match[1] : String(fallback);
}

function renderEmbedBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const caption = renderMarkup(block.text);
  const intro = caption ? `${caption}\n` : "";

  if (/\.mp4(?:[?#]|$)/i.test(block.embedSrc)) {
    return `      <section class="${sectionClasses(block)}">
${header}${intro}        <video class="embed-video" src="${escapeHtml(block.embedSrc)}" aria-label="${escapeHtml(block.embedTitle)}" muted loop playsinline controls preload="metadata" data-autoplay></video>
      </section>`;
  }

  const spotify = isSpotifyEmbed(block.embedSrc);
  const youtube = isYouTubeEmbed(block.embedSrc);
  const frameClass = spotify ? "embed-frame embed-frame--audio" : youtube ? "embed-frame embed-frame--video" : "embed-frame embed-frame--app";
  const height = spotify ? `${normalizePixelValue(block.embedHeight, "352")}px` : (block.embedHeight || "72vh");
  const style = spotify || youtube ? "" : ` style="--embed-height: ${escapeHtml(height)}"`;
  const allow = spotify
    ? ' allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"'
    : youtube
      ? ' allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"'
      : ' allow="accelerometer; gyroscope; fullscreen"';
  const fallback = !spotify && !youtube && !block.headerLinkHref
    ? `\n        <p class="embed-fallback"><a ${renderLinkAttributes(block.embedSrc)}>Open ${escapeHtml(block.embedTitle || "this embed")} in a new tab</a></p>`
    : "";

  const title = escapeHtml(block.embedTitle || block.heading || "Embedded content");
  const iframe = `<iframe src="${escapeHtml(block.embedSrc)}" title="${title}" loading="lazy"${allow} allowfullscreen></iframe>`;
  if (!spotify && !youtube) {
    // Interactive apps load on request so they don't reserve a large blank area while loading.
    return `      <section class="${sectionClasses(block)}">
${header}${intro}        <div class="${frameClass} embed-frame--deferred"${style} data-embed="${escapeHtml(iframe)}">
          <button type="button" class="button embed-load">Load the interactive sketch</button>
          <noscript>${iframe}</noscript>
        </div>${fallback}
      </section>`;
  }

  return `      <section class="${sectionClasses(block)}">
${header}${intro}        <div class="${frameClass}"${style}>
          ${iframe}
        </div>${fallback}
      </section>`;
}

function renderPdfBlock(block) {
  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  return `      <section class="${sectionClasses(block)}">
${header}        <div class="embed-frame embed-frame--pdf">
          <iframe src="${escapeHtml(block.pdfSrc)}" title="${escapeHtml(block.pdfTitle || "PDF document")}" loading="lazy"></iframe>
        </div>
        <p class="embed-fallback"><a ${renderLinkAttributes(block.pdfSrc)}>Open the PDF${block.pdfTitle ? `: ${escapeHtml(block.pdfTitle)}` : ""}</a></p>
      </section>`;
}

function renderImageGridBlock(block) {
  const items = block.linkItems.map((item) => {
    if (videoSourceFor(item.href)) {
      return `          <figure class="grid-item">
${renderMediaElement(item.href, item.label, { controls: true, indent: "            " })}
          </figure>`;
    }
    return `          <figure class="grid-item">
            <img src="${escapeHtml(item.href)}" alt="${escapeHtml(item.label)}" width="640" height="360" loading="lazy" decoding="async" />
          </figure>`;
  }).join("\n");

  return `      <section class="${sectionClasses(block)}">
${renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref)}        <div class="image-grid">
${items}
        </div>
${renderMarkup(block.textAfterImage)}
      </section>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "image-grid":
      return renderImageGridBlock(block);
    case "image":
      return renderImageBlock(block);
    case "table":
      return renderTableBlock(block);
    case "links":
      return renderLinksBlock(block);
    case "embed":
      return renderEmbedBlock(block);
    case "pdf":
      return renderPdfBlock(block);
    default:
      return renderTextBlock(block);
  }
}

function categoryOf(item) {
  return item.kind === "writing" ? { label: "Interest", key: "interest" } : { label: "Project", key: "project" };
}

function displayDomain(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function renderTag(item) {
  const category = categoryOf(item);
  return `<span class="tag tag--${category.key}">${category.label}</span>`;
}

function renderCard(item, { href, text, headingLevel = 2, featured = false }) {
  const external = isExternalUrl(href);
  const domain = external ? displayDomain(href) : "";
  const category = categoryOf(item);
  const updated = item.homeTag ? ` <span class="tag tag--updated">${escapeHtml(item.homeTag)}</span>` : "";
  const cta = external
    ? `<span class="card__cta card__cta--external">Visit ${escapeHtml(domain)}<span aria-hidden="true"> ↗</span></span>`
    : `<span class="card__cta">Read more<span aria-hidden="true"> →</span></span>`;
  const body = renderMarkup(text).replace(/^        /gm, "            ");

  const thumb = item.cardImage
    ? `\n            <div class="card__media"><img src="${escapeHtml(item.cardImage)}" alt="" width="960" height="540" loading="${featured ? "eager" : "lazy"}" decoding="async" /></div>`
    : "";
  return `        <li class="card card--${category.key}${external ? " card--external" : ""}${featured ? " card--featured" : ""}" data-kind="${category.key}">
          <article class="card__inner">${thumb}
            <div class="card__content">
            <div class="card__meta">${renderTag(item)}${updated}</div>
            <h${headingLevel} class="card__title"><a class="card__link" ${renderLinkAttributes(href)}>${escapeHtml(item.title)}${external ? '<span class="visually-hidden"> (external site, opens in a new tab)</span>' : ""}</a></h${headingLevel}>
            <div class="card__body">
${body}
            </div>
            ${cta}
            </div>
          </article>
        </li>`;
}

function listedEntries(content) {
  return sortByImportance([...content.projects, ...content.writing].filter((item) => !item.hiddenFromListings));
}

function renderHomePage(content) {
  const entries = listedEntries(content);
  const counts = {
    all: entries.length,
    project: entries.filter((item) => item.kind !== "writing").length,
    interest: entries.filter((item) => item.kind === "writing").length,
  };
  const cards = entries.map((item, index) => renderCard(item, { href: item.homeHref, text: item.homeCardText, featured: index === 0 })).join("\n");

  const main = `    <main id="main" class="site-main site-main--wide">
      <h1 class="visually-hidden">Projects and interests by Rob Schoen</h1>
      <div class="feed-controls" hidden>
        <div class="filter" role="group" aria-label="Show">
          <button type="button" class="filter__button" data-filter="all" aria-pressed="true">All <span class="filter__count">${counts.all}</span></button>
          <button type="button" class="filter__button" data-filter="project" aria-pressed="false">Projects <span class="filter__count">${counts.project}</span></button>
          <button type="button" class="filter__button" data-filter="interest" aria-pressed="false">Interests <span class="filter__count">${counts.interest}</span></button>
        </div>
        <p class="filter__status visually-hidden" role="status" aria-live="polite"></p>
      </div>
      <ul class="card-grid" id="posts" aria-label="Posts">
${cards}
      </ul>
    </main>`;

  return renderPage({
    title: `${SITE_NAME} | Rob Schoen`,
    description: "Projects and interests by Rob Schoen.",
    shareUrl: "https://entangledparticles.xyz/",
    bodyClass: "page-home",
    main,
  });
}

function renderArchivePage(content, kind) {
  const isProjects = kind === "projects";
  const heading = isProjects ? "Projects" : "Interests";
  const items = sortByImportance(content[kind].filter((item) => !item.hiddenFromListings));
  // Archives use the same destination and summary as the homepage so the two never drift apart.
  const cards = items.map((item) => renderCard(item, { href: item.homeHref, text: item.homeCardText })).join("\n");
  const main = `    <main id="main" class="site-main site-main--wide">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="./index.html"><span aria-hidden="true">←</span> All posts</a></nav>
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title" class="intro__title">${heading}</h1>
      </section>
      <ul class="card-grid" aria-label="${heading}">
${cards}
      </ul>
    </main>`;

  return renderPage({
    title: `${heading} | ${SITE_NAME}`,
    description: `${heading} by Rob Schoen on ${SITE_NAME}.`,
    bodyClass: "page-archive",
    current: isProjects ? "projects" : "interests",
    main,
  });
}

function renderPostNav(item, sequence) {
  const index = sequence.findIndex((entry) => entry.slug === item.slug && entry.kind === item.kind);
  if (index < 0 || sequence.length < 2) {
    return "";
  }
  const previous = sequence[index - 1];
  const next = sequence[index + 1];
  const link = (entry, direction) => entry
    ? `        <a class="post-nav__link post-nav__link--${direction}" href="${escapeHtml(entry.homeHref)}" rel="${direction === "previous" ? "prev" : "next"}">
          <span class="post-nav__label">${direction === "previous" ? '<span aria-hidden="true">← </span>Previous' : 'Next<span aria-hidden="true"> →</span>'}</span>
          <span class="post-nav__title">${escapeHtml(entry.title)}</span>
        </a>`
    : `        <span class="post-nav__spacer"></span>`;

  return `      <nav class="post-nav" aria-label="More posts">
${link(previous, "previous")}
${link(next, "next")}
      </nav>`;
}

function renderDetailPage(item, sequence) {
  // With no separate intro, a leading plain-text block (no heading, no image) becomes the post's opening.
  const [firstBlock] = item.blocks;
  const absorbFirst = !item.pageIntroText && firstBlock && firstBlock.type === "text" && !firstBlock.heading
    && firstBlock.text.trim() && !isCtaImageTextBlock(firstBlock)
    && (!firstBlock.imageSrc || String(firstBlock.imagePosition).toLowerCase() === "after");
  // When the absorbed block also carries an image, the image (and any text after it) stays as its own panel.
  const remainder = absorbFirst && firstBlock.imageSrc ? [{ ...firstBlock, text: "", imagePosition: "before" }] : [];
  const bodyBlocks = absorbFirst ? [...remainder, ...item.blocks.slice(1)] : item.blocks;
  const blocks = bodyBlocks.map((block) => renderBlock(block)).join("\n\n");
  const intro = item.pageIntroText
    ? `\n${renderMarkup(item.pageIntroText).replace(/<p>/, '<p class="lead">')}`
    : absorbFirst ? `\n${renderMarkup(firstBlock.text)}` : "";
  const main = `    <main id="main" class="site-main site-main--post${item.slug === "isocrateez" ? " post--isocrateez" : ""}">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="./index.html"><span aria-hidden="true">←</span> All posts</a></nav>
      <article class="post">
      <header class="panel post-header">
        ${renderTag(item)}
        <h1>${escapeHtml(item.title)}</h1>${intro}
      </header>
${blocks}
      </article>
${renderPostNav(item, sequence)}
    </main>`;

  return renderPage({
    title: `${item.title} | ${SITE_NAME}`,
    description: item.metaDescription,
    shareUrl: item.shareImage ? `https://entangledparticles.xyz/${item.slug}.html` : undefined,
    shareImage: item.shareImage,
    shareType: "article",
    bodyClass: `page-post page-post--${item.kind === "writing" ? "interest" : "project"}`,
    noindex: isExternalUrl(item.homeHref),
    main,
  });
}

export async function generateSite(contentInput) {
  const content = contentInput ? validateSiteContent(contentInput) : await loadSiteContent();
  const sequence = listedEntries(content).filter((item) => item.detailPageEnabled && !isExternalUrl(item.homeHref));

  await fs.writeFile(path.join(rootDir, "index.html"), renderHomePage(content), "utf8");
  await fs.writeFile(path.join(rootDir, "projects.html"), renderArchivePage(content, "projects"), "utf8");
  await fs.writeFile(path.join(rootDir, "writing.html"), renderArchivePage(content, "writing"), "utf8");

  await Promise.all(
    [...content.writing, ...content.projects]
      .filter((item) => item.detailPageEnabled)
      .map((item) => fs.writeFile(path.join(rootDir, `${item.slug}.html`), renderDetailPage(item, sequence), "utf8")),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateSite().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
