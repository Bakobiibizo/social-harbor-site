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

## Deployment

Import this repository into Vercel as a static site. No build command or environment variables are required.
