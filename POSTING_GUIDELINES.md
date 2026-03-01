# Posting Guidelines

## Author Content Rules
- Do not edit or rewrite the author's prose unless explicitly asked.
- Treat this as a coding/layout task, not a writing task.
- The author may include formatting/layout directives in square brackets (for example: `[insert image]`, `[bold]`, `[italicize]`).
- Execute square-bracket directives exactly as instructions, and leave surrounding prose unchanged.
- Typos or errors may be pointed out only in post content, not in user prompts/messages.
- Do not silently fix wording.

## Writing Posts
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
- Washington Street Journal: `50`
- iSocrateez: `10`

### Current Writing Index
- AI-generated Bermanisms: `60`
- Sol LeWitt: `50`
