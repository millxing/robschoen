# Personal Website Starter

This is a lightweight starter inspired by the layout style of `steipete.me`.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Customize quickly

- Update your name and intro text in `index.html`.
- Replace social links in `index.html`.
- Edit colors and typography tokens in `styles.css` under `:root`.
- Tune background object behavior in `window.floatingBackgroundConfig` inside `index.html`:
  `density`, `shape`, `size`, and `speed`.
- Add your projects/posts by duplicating an `.item` block.

## Importance index

Use an importance index from `1-100` to sort entries in descending order (higher = closer to top).
Apply this consistently on Home and archive pages.

Current Projects order/index:
- ExtraPass: `100`
- Brookline Town Meeting Votes: `90`
- Washington Street Journal: `50`
- iSocrateez: `10`

Current Writing order/index:
- AI-generated Bermanisms: `60`
- Sol LeWitt: `50`

## File map

- `index.html`: structure and content
- `styles.css`: design system and layout styles
- `background.js`: param-driven floating background engine
