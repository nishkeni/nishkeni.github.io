# nk-mcp

A personally-addressable **MCP server** for Nishant Keni — my résumé exposed as agent tools.
Humans get a terminal on [nishkeni.github.io](https://nishkeni.github.io); agents get `tools/list`.

Built on **Cloudflare Workers** (remote MCP, authless).
**Live:** https://nk-mcp.mr-nishant-keni.workers.dev

> Lives inside the site repo at `mcp-server/`. All commands below run from this folder.

## Tools
`get_profile` · `get_experience` · `get_education` · `list_publications` ·
`get_expertise` · `get_awards` · `get_research` · `book_session` · `contact`

## Requirements
- **Node ≥ 22** (Wrangler 4 / Miniflare 4 require it — Node 18/20 will fail to run `dev`/`deploy`).
  ```bash
  nvm install 22 && nvm use 22     # or: brew install node@22
  ```

## Develop
```bash
npm install
npm run dev            # http://localhost:8787  (endpoints: /sse and /mcp)
```
Inspect/test it locally:
```bash
npm run inspect        # MCP Inspector → connect to http://localhost:8787/sse
```

## Deploy
```bash
npx wrangler login     # opens browser; log into your Cloudflare account
npm run deploy
```
You'll get a live URL like `https://nk-mcp.mr-nishant-keni.workers.dev`.
The MCP endpoints are:
- `…workers.dev/sse`  — SSE transport (Claude Desktop, Cursor, most clients)
- `…workers.dev/mcp`  — Streamable HTTP transport

## Connect from Claude Desktop
Settings → Developer → Edit Config, add:
```json
{
  "mcpServers": {
    "nk": { "command": "npx", "args": ["mcp-remote", "https://nk-mcp.mr-nishant-keni.workers.dev/sse"] }
  }
}
```
Restart Claude, then ask it to call `get_profile`.

## Notes
- If `npm install` complains about versions, run:
  `npm i agents@latest @modelcontextprotocol/sdk@latest && npm i -D wrangler@latest`
- Optional custom domain: add a route in `wrangler.jsonc` (e.g. `mcp.yourdomain.com`).
