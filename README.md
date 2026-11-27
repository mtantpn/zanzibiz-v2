# ZanziBiz V2

Production rebuild of [zanzibiz.com](https://zanzibiz.com), the Zanzibar small-business directory and travel guide.

## Rules for this repository

- Never commit secrets, `.env` files, database exports, Auth data, user records or storage backups.
- The browser only ever uses the public Supabase key. Service keys live in Supabase and Netlify secrets.
- Every database change is additive and ships with a written undo.
- Production changes need the owner's explicit approval. Everything else goes through pull requests and Netlify deploy previews.

## Layout

- `design/prototype/`: clickable design prototype with sample data. Open `design/prototype/index.html` in a browser.
