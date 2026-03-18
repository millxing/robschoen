# Posting Guidelines

## Author Content Rules
- Do not edit or rewrite the author's prose unless explicitly asked.
- Treat this as a coding/layout task, not a writing task.
- The author may include formatting/layout directives in square brackets (for example: `[insert image]`, `[bold]`, `[italicize]`).
- Execute square-bracket directives exactly as instructions, and leave surrounding prose unchanged.
- Typos or errors may be pointed out only in post content, not in user prompts/messages.
- Do not silently fix wording.

## Writing Posts
- Preferred workflow: use Site Editor instead of editing generated pages by hand.
- Start the editor with `node tools/post_studio_server.mjs`, then open
  `http://127.0.0.1:4173/post-studio.html`.
- The source of truth is `content/site-content.mjs`.
- Use plain text in the editor and square-bracket formatting:
  - `[b]bold[/b]`
  - `[i]italic[/i]`
  - `[code]code[/code]`
  - `[link https://example.com]link text[/link]`
  - `[center]centered text[/center]`
  - `[cta_image src="./assets/example.png" alt="Description" href="https://example.com"]PLAY THE GAME[/cta_image]`
  - `[image src="./assets/example.png" alt="Description"]Caption[/image]`
  - `[table] ... [/table]` with rows like `left | right`
  - blank line for a new paragraph
  - `- item` for bullet points
- The detail page editor uses one linear body field, so text and tables should be written in the
  order they appear on the page.
- Saving in Site Editor automatically regenerates:
  - project detail pages
  - writing detail pages
  - `projects.html`
  - `writing.html`
  - the project and writing sections on `index.html`

## Manual Fallback
- Put writing posts inside a section with `id="writing"`.
- Use the standard post structure:

```html
<article class="item">
  <div class="item-title-row">
    <h3><a href="./your_post.html">Post Title</a></h3>
  </div>
  <p>Your subtitle/description.</p>
</article>
```

- Subtitle paragraphs and bullet lists under writing posts are indented automatically by CSS (same style as projects).

## Projects
- Keep project posts inside the section with `id="work"`.
- Project subtitle paragraphs and bullet lists are indented by the same shared CSS pattern used for writing.

## Importance Index Ordering
- Use an importance index from `1-100` to order Projects and Writing entries.
- Higher score means closer to the top of the list.
- Keep ordering consistent across Home and archive pages.

### Current Project Index
- ExtraPass: `100`
- Brookline Town Meeting Votes: `90`
- iSocrateez: `10`
- Washington Street Journal: `1`

### Current Writing Index
- AI-generated Bermanisms: `60`
- Sol LeWitt: `50`
- Legal Realignment at the Supreme Court: `25`
