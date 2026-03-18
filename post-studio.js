const state = {
  content: { projects: [], writing: [] },
  activeKind: "projects",
  selectedId: "",
  loading: true,
  dirty: false,
  saving: false,
};

let nextEditorId = 1;

const elements = {
  archiveCardClassField: document.querySelector("#archive-card-class-field"),
  archiveCardLabel: document.querySelector("#archive-card-label"),
  bodyPanel: document.querySelector("#body-panel"),
  detailToggleField: document.querySelector("#detail-toggle-field"),
  editorHeading: document.querySelector("#editor-heading"),
  editorPanel: document.querySelector("#editor-panel"),
  fieldArchiveCard: document.querySelector("#field-archive-card"),
  fieldArchiveCardClass: document.querySelector("#field-archive-card-class"),
  fieldArchiveHref: document.querySelector("#field-archive-href"),
  fieldBody: document.querySelector("#field-body"),
  fieldDetailEnabled: document.querySelector("#field-detail-enabled"),
  fieldHomeCard: document.querySelector("#field-home-card"),
  fieldHomeHref: document.querySelector("#field-home-href"),
  fieldImportance: document.querySelector("#field-importance"),
  fieldMeta: document.querySelector("#field-meta"),
  fieldPageIntro: document.querySelector("#field-page-intro"),
  fieldSlug: document.querySelector("#field-slug"),
  fieldTitle: document.querySelector("#field-title"),
  itemList: document.querySelector("#item-list"),
  listCount: document.querySelector("#list-count"),
  listTitle: document.querySelector("#list-title"),
  newItemButton: document.querySelector("#new-item-button"),
  projectOnlyFields: document.querySelector("#project-only-fields"),
  reloadButton: document.querySelector("#reload-button"),
  saveButton: document.querySelector("#save-button"),
  statusPill: document.querySelector("#status-pill"),
  statusText: document.querySelector("#status-text"),
  tabProjects: document.querySelector("#tab-projects"),
  tabWriting: document.querySelector("#tab-writing"),
};

function escapeAttribute(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function unescapeAttribute(value) {
  return String(value || "").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function getDirectiveAttributes(tagText) {
  const attributes = {};
  const pattern = /([a-z_]+)="((?:\\.|[^"])*)"/g;
  let match = pattern.exec(tagText);
  while (match) {
    attributes[match[1]] = unescapeAttribute(match[2]);
    match = pattern.exec(tagText);
  }
  return attributes;
}

function buildDirectiveTag(name, attributes = {}) {
  const attributeText = Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
    .map(([key, value]) => `${key}="${escapeAttribute(value)}"`)
    .join(" ");

  return attributeText ? `[${name} ${attributeText}]` : `[${name}]`;
}

function normalizeImportance(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(100, Math.max(1, parsed));
}

function blockMetaAttributes(block) {
  return {
    delay: block.delay,
    heading: block.heading,
    link_label: block.headerLinkLabel,
    link_href: block.headerLinkHref,
  };
}

function isSimpleTextBlock(block) {
  return (
    block.type === "text" &&
    !block.delay &&
    !block.heading &&
    !block.headerLinkLabel &&
    !block.headerLinkHref &&
    !block.imageSrc &&
    !block.imageAlt &&
    (!block.imagePosition || block.imagePosition === "before") &&
    (!block.extraClasses || block.extraClasses.length === 0)
  );
}

function isCenteredTextBlock(block) {
  const classes = Array.isArray(block.extraClasses) ? block.extraClasses : [];
  return (
    block.type === "text" &&
    !block.delay &&
    !block.heading &&
    !block.headerLinkLabel &&
    !block.headerLinkHref &&
    !block.imageSrc &&
    !block.imageAlt &&
    classes.length === 1 &&
    classes[0] === "text-center"
  );
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

function isCtaImageBlock(block) {
  const classes = Array.isArray(block.extraClasses) ? block.extraClasses : [];
  return (
    block.type === "text" &&
    !block.delay &&
    !block.heading &&
    !block.headerLinkLabel &&
    !block.headerLinkHref &&
    Boolean(block.imageSrc) &&
    Boolean(block.imageAlt) &&
    classes.length === 1 &&
    classes[0] === "text-center" &&
    Boolean(parseSingleLinkText(block.text))
  );
}

function serializeTableLines(block) {
  const lines = [];
  if (Array.isArray(block.tableHeaders) && block.tableHeaders.length > 0) {
    lines.push(block.tableHeaders.join(" | "));
  }
  (block.tableRows || []).forEach((row) => {
    lines.push((Array.isArray(row) ? row : [row]).join(" | "));
  });
  return lines.join("\n");
}

function serializeLinksLines(block) {
  return (block.linkItems || [])
    .map((item) => `${item.label || item.href} | ${item.href || item.label}`)
    .join("\n");
}

function blockToBodySegment(block) {
  if (isSimpleTextBlock(block)) {
    return String(block.text || "").trim();
  }

  if (isCtaImageBlock(block)) {
    const link = parseSingleLinkText(block.text);
    return `${buildDirectiveTag("cta_image", {
      href: link.href,
      src: block.imageSrc,
      alt: block.imageAlt,
      style: block.imageStyle,
    })}
${link.label}
[/cta_image]`;
  }

  if (isCenteredTextBlock(block)) {
    return `[center]
${String(block.text || "").trim()}
[/center]`;
  }

  if (block.type === "text") {
    return `${buildDirectiveTag("text", {
      ...blockMetaAttributes(block),
      image_src: block.imageSrc,
      image_alt: block.imageAlt,
      image_style: block.imageStyle,
      image_link: block.imageLink,
      image_position: block.imagePosition,
      align: (block.extraClasses || []).includes("text-center") ? "center" : "",
    })}
${String(block.text || "").trim()}
[/text]`;
  }

  if (block.type === "table") {
    return `${buildDirectiveTag("table", blockMetaAttributes(block))}
${serializeTableLines(block)}
[/table]`;
  }

  if (block.type === "image") {
    return `${buildDirectiveTag("image", {
      ...blockMetaAttributes(block),
      src: block.imageSrc,
      alt: block.imageAlt,
      style: block.imageStyle,
      link: block.imageLink,
    })}
${String(block.caption || "").trim()}
[/image]`;
  }

  if (block.type === "links") {
    return `${buildDirectiveTag("links", blockMetaAttributes(block))}
${serializeLinksLines(block)}
[/links]`;
  }

  if (block.type === "embed") {
    return `${buildDirectiveTag("embed", {
      ...blockMetaAttributes(block),
      src: block.embedSrc,
      title: block.embedTitle,
      height: block.embedHeight,
    })}
${String(block.text || "").trim()}
[/embed]`;
  }

  if (block.type === "pdf") {
    return `${buildDirectiveTag("pdf", {
      ...blockMetaAttributes(block),
      src: block.pdfSrc,
      title: block.pdfTitle,
    })}
[/pdf]`;
  }

  return String(block.text || "").trim();
}

function blocksToBody(blocks) {
  return (blocks || [])
    .map(blockToBodySegment)
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function parseTableContent(content) {
  const lines = String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { tableHeaders: [], tableRows: [] };
  }

  const rows = lines.map((line) => line.split("|").map((cell) => cell.trim()));
  if (rows.length >= 2 && rows[0].length > 1) {
    return { tableHeaders: rows[0], tableRows: rows.slice(1) };
  }

  return { tableHeaders: [], tableRows: rows };
}

function parseLinksContent(content) {
  return String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pieces = line.split("|").map((piece) => piece.trim());
      if (pieces.length >= 2) {
        return { label: pieces[0], href: pieces.slice(1).join(" | ") };
      }
      return { label: line, href: line };
    });
}

function makeTextBlock(text, attrs = {}) {
  return {
    type: "text",
    delay: attrs.delay || "",
    heading: attrs.heading || "",
    text: String(text || "").trim(),
    caption: "",
    imageSrc: attrs.image_src || "",
    imageAlt: attrs.image_alt || "",
    imageStyle: attrs.image_style || "full",
    imageLink: attrs.image_link || "",
    imagePosition: attrs.image_position === "after" ? "after" : "before",
    extraClasses: [],
    headerLinkLabel: attrs.link_label || "",
    headerLinkHref: attrs.link_href || "",
    embedSrc: "",
    embedTitle: "",
    embedHeight: "",
    pdfSrc: "",
    pdfTitle: "",
    tableHeaders: [],
    tableRows: [],
    linkItems: [],
  };
}

function directiveToBlock(name, attrs, content) {
  if (name === "cta_image") {
    return {
      ...makeTextBlock(`[link ${attrs.href || attrs.link || ""}]${String(content || "").trim()}[/link]`, {
        image_src: attrs.src || "",
        image_alt: attrs.alt || "",
        image_style: attrs.style || "full",
        image_link: attrs.image_link || attrs.href || attrs.link || "",
        image_position: "after",
      }),
      extraClasses: ["text-center"],
      imagePosition: "after",
    };
  }

  if (name === "text") {
    const block = makeTextBlock(content, attrs);
    if ((attrs.align || "").toLowerCase() === "center") {
      block.extraClasses = ["text-center"];
    }
    return block;
  }

  if (name === "center") {
    return {
      ...makeTextBlock(content, attrs),
      extraClasses: ["text-center"],
    };
  }

  if (name === "table") {
    const table = parseTableContent(content);
    return {
      ...makeTextBlock("", attrs),
      type: "table",
      text: "",
      tableHeaders: table.tableHeaders,
      tableRows: table.tableRows,
      imageSrc: "",
      imageAlt: "",
      imageStyle: "full",
      imageLink: "",
    };
  }

  if (name === "image") {
    return {
      ...makeTextBlock("", attrs),
      type: "image",
      caption: String(content || "").trim(),
      imageSrc: attrs.src || "",
      imageAlt: attrs.alt || "",
      imageStyle: attrs.style || "full",
      imageLink: attrs.link || "",
      imagePosition: "before",
    };
  }

  if (name === "links") {
    return {
      ...makeTextBlock("", attrs),
      type: "links",
      linkItems: parseLinksContent(content),
      imageSrc: "",
      imageAlt: "",
      imageStyle: "full",
      imageLink: "",
      imagePosition: "before",
    };
  }

  if (name === "embed") {
    return {
      ...makeTextBlock("", attrs),
      type: "embed",
      text: String(content || "").trim(),
      embedSrc: attrs.src || "",
      embedTitle: attrs.title || "",
      embedHeight: attrs.height || "",
      imageSrc: "",
      imageAlt: "",
      imageStyle: "full",
      imageLink: "",
      imagePosition: "before",
    };
  }

  if (name === "pdf") {
    return {
      ...makeTextBlock("", attrs),
      type: "pdf",
      text: "",
      pdfSrc: attrs.src || "",
      pdfTitle: attrs.title || "",
      imageSrc: "",
      imageAlt: "",
      imageStyle: "full",
      imageLink: "",
      imagePosition: "before",
    };
  }

  return makeTextBlock(content, attrs);
}

function bodyToBlocks(bodyText) {
  const source = String(bodyText || "").replace(/\r\n/g, "\n");
  const pattern = /\[(text|center|cta_image|table|image|links|embed|pdf)([^\]]*)\]([\s\S]*?)\[\/\1\]/gi;
  const blocks = [];
  let lastIndex = 0;
  let match = pattern.exec(source);

  while (match) {
    const precedingText = source.slice(lastIndex, match.index).trim();
    if (precedingText) {
      blocks.push(makeTextBlock(precedingText));
    }

    const [, name, rawAttrs, innerContent] = match;
    const attrs = getDirectiveAttributes(rawAttrs);
    blocks.push(directiveToBlock(name.toLowerCase(), attrs, innerContent.trim()));
    lastIndex = pattern.lastIndex;
    match = pattern.exec(source);
  }

  const trailingText = source.slice(lastIndex).trim();
  if (trailingText) {
    blocks.push(makeTextBlock(trailingText));
  }

  return blocks.length > 0 ? blocks : [makeTextBlock("")];
}

function attachEditorIds(items) {
  return items.map((item) => ({
    ...item,
    importance: normalizeImportance(item.importance),
    editorId: `item-${nextEditorId++}`,
    bodyText: blocksToBody(item.blocks || []),
  }));
}

function stripEditorIds(items) {
  return items.map(({ editorId, kind, bodyText, ...item }) => ({
    ...item,
    importance: normalizeImportance(item.importance),
    blocks: bodyToBlocks(bodyText),
  }));
}

function getActiveItems() {
  return state.content[state.activeKind] || [];
}

function getSelectedItem() {
  return getActiveItems().find((item) => item.editorId === state.selectedId) || null;
}

function setStatus(tone, text) {
  elements.statusPill.className = `status-pill ${tone}`;
  elements.statusPill.textContent =
    tone === "success" ? "Saved" : tone === "error" ? "Error" : tone === "warn" ? "Unsaved" : "Ready";
  elements.statusText.textContent = text;
}

function markDirty(message = "Unsaved changes.") {
  state.dirty = true;
  setStatus("warn", message);
}

function replaceSelectedItem(updatedItem) {
  state.content[state.activeKind] = getActiveItems().map((item) =>
    item.editorId === state.selectedId ? updatedItem : item,
  );
}

function sortItems(items) {
  return [...items].sort((left, right) => {
    if (right.importance !== left.importance) {
      return right.importance - left.importance;
    }
    return left.title.localeCompare(right.title);
  });
}

function makeBlankItem(kind) {
  return {
    editorId: `item-${nextEditorId++}`,
    title: kind === "projects" ? "New Project" : "New Writing Post",
    slug: kind === "projects" ? "new_project" : "new_post",
    importance: 10,
    metaDescription: "",
    homeCardText: "",
    archiveCardText: "",
    archiveCardClass: "",
    pageIntroText: "",
    homeHref: kind === "projects" ? "" : undefined,
    archiveHref: kind === "projects" ? "" : undefined,
    detailPageEnabled: true,
    bodyText: "",
  };
}

function updateSelectedField(field, value) {
  const item = getSelectedItem();
  if (!item) {
    return;
  }
  replaceSelectedItem({ ...item, [field]: field === "importance" ? normalizeImportance(value) : value });
  markDirty();
}

function createItem() {
  const item = makeBlankItem(state.activeKind);
  state.content[state.activeKind] = [item, ...getActiveItems()];
  state.selectedId = item.editorId;
  markDirty(`Created a new ${state.activeKind === "projects" ? "project" : "writing item"}.`);
  safeRender();
}

function renderItemList() {
  const items = sortItems(getActiveItems());
  elements.listTitle.textContent = state.activeKind === "projects" ? "Projects" : "Writing";
  elements.listCount.textContent = `${items.length}`;
  elements.itemList.innerHTML = "";

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.editorId === state.selectedId ? "active" : "";
    button.innerHTML = `
      <span class="item-title">${item.title}</span>
      <span class="item-meta">${item.slug}.html · importance ${item.importance}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedId = item.editorId;
      safeRender();
    });
    elements.itemList.append(button);
  });
}

function renderGeneralFields() {
  const item = getSelectedItem();
  if (!item) {
    elements.editorHeading.textContent = "No item selected";
    elements.editorPanel.hidden = true;
    elements.bodyPanel.hidden = true;
    return;
  }

  elements.editorPanel.hidden = false;
  elements.bodyPanel.hidden = false;
  elements.editorHeading.textContent = item.title || "Untitled";
  elements.fieldTitle.value = item.title || "";
  elements.fieldSlug.value = item.slug || "";
  elements.fieldImportance.value = String(item.importance || 0);
  elements.fieldMeta.value = item.metaDescription || "";
  elements.fieldHomeCard.value = item.homeCardText || "";
  elements.fieldArchiveCard.value = item.archiveCardText || "";
  elements.fieldArchiveCardClass.value = item.archiveCardClass || "";
  elements.fieldPageIntro.value = item.pageIntroText || "";
  elements.fieldBody.value = item.bodyText || "";

  const isProject = state.activeKind === "projects";
  elements.projectOnlyFields.hidden = !isProject;
  elements.detailToggleField.hidden = !isProject;
  elements.archiveCardClassField.hidden = isProject;
  elements.archiveCardLabel.textContent = isProject ? "Projects page card text" : "Writing page card text";

  if (isProject) {
    elements.fieldHomeHref.value = item.homeHref || "";
    elements.fieldArchiveHref.value = item.archiveHref || "";
    elements.fieldDetailEnabled.checked = Boolean(item.detailPageEnabled);
  }
}

function renderTabs() {
  elements.tabProjects.classList.toggle("active", state.activeKind === "projects");
  elements.tabWriting.classList.toggle("active", state.activeKind === "writing");
}

function renderAll() {
  renderTabs();
  renderItemList();
  renderGeneralFields();
  elements.saveButton.disabled = state.loading || state.saving;
}

function safeRender() {
  try {
    renderAll();
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "The editor hit an unexpected error.");
  }
}

async function loadContent() {
  state.loading = true;
  setStatus("neutral", "Fetching current site content...");

  try {
    const response = await fetch("./api/site-content", { cache: "no-store" });
    const payload = await response.json();
    state.content = {
      projects: attachEditorIds(payload.projects || []),
      writing: attachEditorIds(payload.writing || []),
    };
    state.selectedId = getActiveItems()[0]?.editorId || "";
    state.dirty = false;
    setStatus("neutral", "Loaded current site content.");
  } catch (error) {
    setStatus("error", error.message || "Failed to load content.");
  } finally {
    state.loading = false;
    safeRender();
  }
}

async function saveContent() {
  state.saving = true;
  setStatus("neutral", "Saving and rebuilding the site...");

  try {
    const payload = {
      projects: stripEditorIds(state.content.projects),
      writing: stripEditorIds(state.content.writing),
    };
    const response = await fetch("./api/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Save failed.");
    }
    state.dirty = false;
    setStatus("success", "Saved and rebuilt the site.");
  } catch (error) {
    setStatus("error", error.message || "Save failed.");
  } finally {
    state.saving = false;
    safeRender();
  }
}

function switchKind(kind) {
  state.activeKind = kind;
  state.selectedId = getActiveItems()[0]?.editorId || "";
  safeRender();
}

elements.tabProjects.addEventListener("click", () => switchKind("projects"));
elements.tabWriting.addEventListener("click", () => switchKind("writing"));
elements.newItemButton.addEventListener("click", createItem);
elements.reloadButton.addEventListener("click", loadContent);
elements.saveButton.addEventListener("click", saveContent);

elements.fieldTitle.addEventListener("input", (event) => {
  updateSelectedField("title", event.target.value);
  elements.editorHeading.textContent = event.target.value || "Untitled";
  renderItemList();
});
elements.fieldSlug.addEventListener("input", (event) => {
  updateSelectedField("slug", event.target.value);
  renderItemList();
});
elements.fieldImportance.addEventListener("input", (event) => {
  const importance = normalizeImportance(event.target.value);
  event.target.value = String(importance);
  updateSelectedField("importance", importance);
  renderItemList();
});
elements.fieldMeta.addEventListener("input", (event) => updateSelectedField("metaDescription", event.target.value));
elements.fieldHomeCard.addEventListener("input", (event) => updateSelectedField("homeCardText", event.target.value));
elements.fieldArchiveCard.addEventListener("input", (event) => updateSelectedField("archiveCardText", event.target.value));
elements.fieldArchiveCardClass.addEventListener("input", (event) =>
  updateSelectedField("archiveCardClass", event.target.value),
);
elements.fieldPageIntro.addEventListener("input", (event) => updateSelectedField("pageIntroText", event.target.value));
elements.fieldHomeHref.addEventListener("input", (event) => updateSelectedField("homeHref", event.target.value));
elements.fieldArchiveHref.addEventListener("input", (event) =>
  updateSelectedField("archiveHref", event.target.value),
);
elements.fieldDetailEnabled.addEventListener("change", (event) =>
  updateSelectedField("detailPageEnabled", event.target.checked),
);
elements.fieldBody.addEventListener("input", (event) => updateSelectedField("bodyText", event.target.value));

window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) {
    return;
  }
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("error", (event) => {
  setStatus("error", event.error?.message || event.message || "The editor hit an unexpected error.");
});

loadContent();
