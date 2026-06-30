# Kollel Chatzos · נקודת חצות

A bilingual (English / Yiddish) promotional website for **Kollel Chatzos — Nekudas Chatzos**, the Brooklyn kollel whose chashuva young men learn Torah every night from *chatzos* until *alos hashachar* — illuminating and safeguarding Brooklyn.

**Live site:** [lucidquestor.github.io/kollel-chatzos](https://lucidquestor.github.io/kollel-chatzos/)

## Should this be Next.js?

**Not right now.** This is a 4-page static marketing site with no database, auth, or dynamic content. Plain HTML + shared assets gives you:

- Free hosting on GitHub Pages (already set up)
- Zero build step — edit and push
- Fast loads, no JavaScript framework overhead

Consider **Next.js** later only if you need things like: a blog, admin CMS, user accounts, payment API routes, or complex interactive features. A lighter middle ground would be **Eleventy (11ty)** if you want components/templates without React.

## Project structure

```
kollel-chatzos/
├── index.html                 # Home
├── about.html                 # The Kollel
├── segulos.html               # Segulos & maalos
├── partner.html               # Partner / donate
├── assets/
│   ├── css/
│   │   ├── main.css           # Theme & components
│   │   └── utilities.css      # Layout helpers (no inline styles)
│   ├── js/
│   │   ├── layout.js          # Loads shared nav & footer
│   │   └── main.js            # Language, nav, forms, scroll
│   ├── partials/
│   │   ├── nav.html           # Single nav (consistent labels)
│   │   └── footer.html        # Single footer
│   ├── images/
│   └── icons/
└── scripts/                   # Optional HTML maintenance scripts
```

Nav and footer live in **one place** (`assets/partials/`) and are injected on every page — no more copy-paste drift between files.

## Pages

| Page | English | Yiddish |
|------|---------|---------|
| `index.html` | Home — hero, mission, three pillars | היים |
| `about.html` | The Kollel — seder, 24-hour cycle | דער כולל |
| `segulos.html` | Segulos & maalos of chatzos | סגולות |
| `partner.html` | Become a Partner — tiers + contact | ווערט א שותף |

## Language toggle

The **EN / יידיש** toggle switches all content and RTL layout for Yiddish. Preference is saved in `localStorage`.

## Running locally

The shared nav/footer load via `fetch`, so use a local server (not `file://`):

```bash
python -m http.server 8000
# visit http://localhost:8000
```

## Deploying

Already on GitHub Pages from the `main` branch, root folder. Push to update:

```bash
git push origin main
```

## Notes

- Replace placeholder phone/email on the Partner page with real kollel details.
- Connect the contact form to Formspree, Netlify Forms, etc. when ready.

*Content adapted from the kollel's flyers and the liqut on the maalos of kimas chatzos.*
