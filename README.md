# Harbor Website and Deep Link Handler

Static production website for [Harbor](https://github.com/Bakobiibizo/harbor), a local-first peer-to-peer communication app.

The repository contains the product site and the `/add-friend` web-to-app deep link handler. Vercel routing serves the handler for encoded contact paths while preserving a lightweight, framework-free deployment.

## Project Structure

```text
social-harbor-site/
├── index.html          # Product site
├── add-friend/         # Contact-link handler
├── privacy/            # Privacy disclosures
├── assets/             # Brand and social-preview assets
├── css/                # Shared styles
├── js/                 # Contact-link decoding and app launch
└── vercel.json         # Routing, headers, and caching
```

## Local Preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Validation

Node.js 20 or newer is required for the dependency-free test suite:

```bash
npm test
```

Tests cover URL-safe contact decoding (including Unicode), malformed and oversized
payload rejection, route extraction, and static page security invariants. CI runs
the same suite for every push and pull request.

## Deployment

Import this repository into Vercel as a static site. No build command or environment variables are required.

`vercel.json` provides the contact-link rewrite, strict transport and content
security headers, and asset caching. Contact pages are marked `noindex` because
their URLs contain intentionally shared peer connection data.

This repository intentionally diverges from its upstream: it is the maintained
product site for the [`Bakobiibizo/harbor`](https://github.com/Bakobiibizo/harbor)
application rather than a generic template.
