import fs from "node:fs/promises";
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
      pattern: /\[link ([^\]]+)\]([\s\S]*?)\[\/link\]/gi,
      replacement: (_match, href, inner) => `<a ${renderLinkAttributes(href)}>${inner}</a>`,
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

function renderCaption(text) {
  const lines = String(text || "")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `        <p class="media-caption">${lines.map((line) => applyInlineMarkup(line)).join("<br />")}</p>\n`;
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

      const paragraph = lines.map((line) => applyInlineMarkup(line.trim())).join("<br />");
      return `        <p>${paragraph}</p>`;
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

function normalizeBlocks(blocks) {
  return Array.isArray(blocks)
    ? blocks.map((block) => ({
        type: String(block.type || "text"),
        delay: String(block.delay || ""),
        heading: String(block.heading || ""),
        text: String(block.text || ""),
        caption: String(block.caption || ""),
        imageSrc: String(block.imageSrc || ""),
        imageAlt: String(block.imageAlt || ""),
        imageStyle: String(block.imageStyle || "full"),
        imageLink: String(block.imageLink || ""),
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
        importance: Number(item.importance || 0),
        metaDescription: String(item.metaDescription || "").trim(),
        homeCardText: String(item.homeCardText || ""),
        archiveCardText: String(item.archiveCardText || ""),
        archiveCardClass: String(item.archiveCardClass || "").trim(),
        pageIntroText: String(item.pageIntroText || ""),
        detailPageEnabled: kind === "writing" ? true : Boolean(item.detailPageEnabled),
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

function renderHead(pageTitle, metaDescription) {
  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta
      name="description"
      content="${escapeHtml(metaDescription)}"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./styles.css" />
  </head>`;
}

function renderHero() {
  return `      <section class="hero top-hero reveal candy-red">
        <div class="top-hero-row">
          <a href="./index.html" class="site-title">
            <img src="./assets/entangledParticlesLogo.jpg" class="site-title-logo" alt="" />
            <span class="visually-hidden">Entangled Particles</span>
          </a>
          <div class="social-row header-social">
            <a class="social-icon" href="https://github.com/millxing?tab=repositories" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
              </svg>
            </a>
            <a class="social-icon" href="https://www.linkedin.com/in/robschoen/" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zM4.943 13.5V6.169H2.542V13.5h2.4zM3.743 5.168c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zM13.458 13.5V9.359c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.694 0 7.331 0 7.331h2.4v-4.094c0-.219.016-.438.08-.594.175-.438.574-.891 1.245-.891.878 0 1.23.672 1.23 1.656V13.5h2.4z"/>
              </svg>
            </a>
            <a class="social-icon" href="mailto:robschoen.robschoen@gmail.com" aria-label="Email" title="Email">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-.5a.5.5 0 0 0-.5.5v.217l6.5 3.9 6.5-3.9V4a.5.5 0 0 0-.5-.5H2zm12.5 2.458-4.796 2.878 4.796 3.264V5.958zM14.204 12.5 8.68 8.74 8 9.147l-.681-.408L1.796 12.5h12.408zM1.5 12.1l4.796-3.264L1.5 5.958V12.1z"/>
              </svg>
            </a>
            <a class="social-icon" href="https://www.dropbox.com/scl/fi/demzlgct5g7ve15c9kz8j/resume_Rob-Schoen.docx?rlkey=ylomjukk1df5zfzfx1qbh2jus&dl=0" target="_blank" rel="noreferrer" aria-label="Resume" title="Resume">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5z"/>
                <path d="M5 7.5h6v1H5v-1zm0 2h6v1H5v-1zm0 2h4v1H5v-1z"/>
              </svg>
            </a>
          </div>
          <nav class="site-nav" aria-label="Primary">
            <a href="./index.html">Home</a>
            <span class="nav-disabled" aria-disabled="true">About</span>
            <a href="./projects.html">Projects</a>
            <a href="./writing.html">Interests</a>
          </nav>
        </div>
      </section>`;
}

function renderPanelHeader(heading, linkLabel, linkHref) {
  if (!heading && !linkLabel) {
    return "";
  }

  const headingMarkup = heading ? `\n          <h2>${escapeHtml(heading)}</h2>` : "";
  const linkMarkup = linkLabel ? `\n          <a ${renderLinkAttributes(linkHref)}>${escapeHtml(linkLabel)}</a>` : "";

  return `        <div class="panel-header">${headingMarkup}${linkMarkup}\n        </div>\n`;
}

function renderTextBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const imageMarkup = block.imageSrc
    ? `        <img
          src="${escapeHtml(block.imageSrc)}"
          alt="${escapeHtml(block.imageAlt)}"
          style="${escapeHtml(resolveImageStyle(block.imageStyle))}"
        />\n`
    : "";

  return `      <section class="${classes.join(" ")}">
${header}${imageMarkup}${renderMarkup(block.text)}
      </section>`;
}

function resolveImageStyle(style) {
  if (style === "small-center") {
    return "width: 25%; height: auto; border-radius: 12px; margin: 0 auto 1rem; display: block";
  }
  if (style === "full-white") {
    return "width: 100%; height: auto; border: 0; border-radius: 12px; background: #ffffff";
  }
  return "width: 100%; height: auto; border-radius: 12px; display: block";
}

function renderImageBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const caption = renderCaption(block.caption);
  const image = `        <img
          src="${escapeHtml(block.imageSrc)}"
          alt="${escapeHtml(block.imageAlt)}"
          style="${escapeHtml(resolveImageStyle(block.imageStyle))}"
        />`;

  const wrappedImage = block.imageLink
    ? `        <a ${renderLinkAttributes(block.imageLink)}>
${image}
        </a>`
    : image;

  return `      <section class="${classes.join(" ")}">
${header}${caption}${wrappedImage}
      </section>`;
}

function renderTableBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const intro = renderMarkup(block.text);
  const hasHeaders = block.tableHeaders.length > 0;
  const headerMarkup = hasHeaders
    ? `          <thead>
            <tr>
${block.tableHeaders
  .map(
    (headerCell) =>
      `              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 2px 4px">${applyInlineMarkup(headerCell)}</th>`,
  )
  .join("\n")}
            </tr>
          </thead>\n`
    : "";
  const bodyRows = block.tableRows
    .map((row, rowIndex) => {
      const cells = row.map((cell) => applyInlineMarkup(cell));
      return `            <tr>
${cells
  .map((cell, cellIndex) => {
    const isLastRow = rowIndex === block.tableRows.length - 1;
    const styleParts = ["padding: 2px 4px"];
    if (!isLastRow) {
      styleParts.unshift("border-bottom: 1px solid #eee");
    }
    if (cells.length === 2) {
      styleParts.push("width: 50%");
    }
    return `              <td style="${styleParts.join("; ")}">${cell}</td>`;
  })
  .join("\n")}
            </tr>`;
    })
    .join("\n");

  return `      <section class="${classes.join(" ")}">
${header}${intro ? `${intro}\n` : ""}        <table style="width: 100%; border-collapse: collapse">
${headerMarkup}          <tbody>
${bodyRows}
          </tbody>
        </table>
      </section>`;
}

function renderLinksBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const items = block.linkItems
    .map(
      (item) => `          <li>
            <a ${renderLinkAttributes(item.href)}>${escapeHtml(item.label)}</a>
          </li>`,
    )
    .join("\n");

  return `      <section class="${classes.join(" ")}">
${header}        <ul class="subtitle-list">
${items}
        </ul>
      </section>`;
}

function renderEmbedBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);
  const caption = renderMarkup(block.text);
  const height = block.embedHeight || "72vh";

  return `      <section class="${classes.join(" ")}">
${header}${caption ? `${caption}\n` : ""}        <iframe
          src="${escapeHtml(block.embedSrc)}"
          title="${escapeHtml(block.embedTitle)}"
          loading="lazy"
          allowfullscreen
          style="width: 100%; min-height: ${escapeHtml(height)}; border: 0; border-radius: 12px; background: #ffffff"
        ></iframe>
      </section>`;
}

function renderPdfBlock(block) {
  const classes = ["panel", "reveal"];
  if (block.delay) {
    classes.push(block.delay);
  }
  block.extraClasses.forEach((value) => classes.push(value));

  const header = renderPanelHeader(block.heading, block.headerLinkLabel, block.headerLinkHref);

  return `      <section class="${classes.join(" ")}">
${header}        <iframe
          src="${escapeHtml(block.pdfSrc)}"
          title="${escapeHtml(block.pdfTitle)}"
          loading="lazy"
          style="width: 100%; min-height: 80vh; border: 0; border-radius: 12px; background: #ffffff"
        ></iframe>
      </section>`;
}

function renderBlock(block) {
  switch (block.type) {
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

function renderPageIntro(item, bodyClass) {
  const classes = ["panel", "reveal", "delay-1"];
  return `      <section class="${classes.join(" ")}">
        <div class="panel-header">
          <h2>${escapeHtml(item.title)}</h2>
        </div>
${item.pageIntroText ? `${renderMarkup(item.pageIntroText)}\n` : ""}      </section>`;
}

function renderWritingCard(item, variant) {
  const href = `./${item.slug}.html`;
  const subtitle = variant === "home" ? item.homeCardText : item.archiveCardText;
  const classAttribute = variant === "archive" && item.archiveCardClass ? ` class="${escapeHtml(item.archiveCardClass)}"` : "";
  return `        <article class="item">
          <div class="item-title-row">
            <h3><a href="${href}">${escapeHtml(item.title)}</a></h3>
          </div>
          <p${classAttribute}>${applyInlineMarkup(subtitle)}</p>
        </article>`;
}

function renderProjectCardBody(text) {
  return renderMarkup(text, { listClass: "subtitle-list" })
    .replace(/^        /gm, "          ");
}

function renderProjectCard(item, variant) {
  const href = variant === "home" ? item.homeHref : item.archiveHref;
  return `        <article class="item">
          <div class="item-title-row">
            <h3><a ${renderLinkAttributes(href)}>${escapeHtml(item.title)}</a></h3>
          </div>
${renderProjectCardBody(variant === "home" ? item.homeCardText : item.archiveCardText)}
        </article>`;
}

function renderHomePage(content) {
  const projects = sortByImportance(content.projects).map((item) => renderProjectCard(item, "home")).join("\n");
  const writing = sortByImportance(content.writing).map((item) => renderWritingCard(item, "home")).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
${renderHead("Entangled Particles | Rob Schoen", "Entangled Particles: projects and writing by Rob Schoen.")}
  <body class="home">
    <div class="floating-squares" aria-hidden="true"></div>

    <main class="page">
${renderHero()}

      <section class="panel reveal delay-1" id="work">
        <div class="panel-header">
          <h2>Projects</h2>
          <a href="./projects.html">See all</a>
        </div>
${projects}
      </section>

      <section class="panel reveal delay-2" id="writing">
        <div class="panel-header">
          <h2>Interests</h2>
          <a href="./writing.html">See all</a>
        </div>
${writing}
      </section>
    </main>

    <script>
      window.floatingBackgroundConfig = {
        density: 50,
        shape: "square",
        size: { min: 100, max: 300 },
        speed: { min: 35, max: 75 },
      };
    </script>
    <script src="./background.js"></script>
  </body>
</html>
`;
}

function renderProjectsPage(content) {
  const projects = sortByImportance(content.projects).map((item) => renderProjectCard(item, "archive")).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
${renderHead("Projects | Entangled Particles", "Project index for Entangled Particles.")}
  <body>
    <div class="floating-squares" aria-hidden="true"></div>

    <main class="page">
${renderHero()}

      <section class="panel reveal delay-1" id="work">
        <div class="panel-header">
          <h2>Projects</h2>
        </div>
${projects}
      </section>
    </main>

    <script>
      window.floatingBackgroundConfig = {
        density: 40,
        shape: "square",
        size: { min: 100, max: 280 },
        speed: { min: 30, max: 70 },
      };
    </script>
    <script src="./background.js"></script>
  </body>
</html>
`;
}

function renderWritingIndex(content) {
  const writing = sortByImportance(content.writing).map((item) => renderWritingCard(item, "archive")).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
${renderHead("Interests | Entangled Particles", "Interests index for Entangled Particles.")}
  <body class="writing-page">
    <div class="floating-squares" aria-hidden="true"></div>

    <main class="page">
${renderHero()}

      <section class="panel reveal delay-1" id="writing">
        <div class="panel-header">
          <h2>Interests</h2>
        </div>
${writing}
      </section>
    </main>

    <script>
      window.floatingBackgroundConfig = {
        density: 40,
        shape: "square",
        size: { min: 100, max: 280 },
        speed: { min: 30, max: 70 },
      };
    </script>
    <script src="./background.js"></script>
  </body>
</html>
`;
}

function renderDetailPage(item) {
  const isWriting = item.kind === "writing";
  const titleSuffix = isWriting ? "Entangled Particles" : "Rob Schoen";
  const bodyClass = isWriting ? ' class="writing-page"' : "";
  const blocks = item.blocks.map((block) => renderBlock(block)).join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
${renderHead(`${item.title} | ${titleSuffix}`, item.metaDescription)}
  <body${bodyClass}>
    <div class="floating-squares" aria-hidden="true"></div>

    <main class="page">
${renderHero()}

${renderPageIntro(item)}
${blocks ? `\n\n${blocks}` : ""}
    </main>

    <script>
      window.floatingBackgroundConfig = {
        density: 40,
        shape: "square",
        size: { min: 100, max: 280 },
        speed: { min: 30, max: 70 },
      };
    </script>
    <script src="./background.js"></script>
  </body>
</html>
`;
}

export async function generateSite(contentInput) {
  const content = contentInput ? validateSiteContent(contentInput) : await loadSiteContent();

  await fs.writeFile(path.join(rootDir, "index.html"), renderHomePage(content), "utf8");
  await fs.writeFile(path.join(rootDir, "projects.html"), renderProjectsPage(content), "utf8");
  await fs.writeFile(path.join(rootDir, "writing.html"), renderWritingIndex(content), "utf8");

  await Promise.all(
    content.writing.map((item) =>
      fs.writeFile(path.join(rootDir, `${item.slug}.html`), renderDetailPage(item), "utf8"),
    ),
  );

  await Promise.all(
    content.projects
      .filter((item) => item.detailPageEnabled)
      .map((item) =>
        fs.writeFile(path.join(rootDir, `${item.slug}.html`), renderDetailPage(item), "utf8"),
      ),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  generateSite().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
