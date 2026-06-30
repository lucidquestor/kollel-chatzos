# Kollel Chatzos · נקודת חצות

A bilingual (English / Yiddish) promotional website for **Kollel Chatzos — Nekudas Chatzos**, the Brooklyn kollel whose chashuva young men learn Torah every night from *chatzos* until *alos hashachar* — illuminating and safeguarding the city.

The site explains what the kollel does and why it is worth supporting, and invites visitors to become a partner.

## Project structure

```
kollel-chatzos/
├── index.html              # Home
├── about.html              # The Kollel
├── segulos.html            # Segulos & maalos of chatzos
├── partner.html            # Become a partner
├── assets/
│   ├── css/
│   │   └── main.css        # Shared styles (navy/gold theme)
│   ├── js/
│   │   └── main.js         # Language toggle, nav, scroll reveals
│   ├── images/             # Logos and hero photo
│   └── icons/
│       └── favicon.svg
└── README.md
```

## Pages

| Page | English | Yiddish |
|------|---------|---------|
| `index.html` | Home — hero, the mission, three pillars | היים |
| `about.html` | The Kollel — the avodah of the night, the *seder hakollel*, the 24-hour cycle | דער כולל |
| `segulos.html` | Segulos & Maalos of chatzos (Zohar, Kaf HaChaim, Sefer HaMiddos) | סגולות |
| `partner.html` | Become a Partner — dedication tiers + contact form | ווערט א שותף |

## Language toggle

Every page is fully bilingual. The **EN / יידיש** toggle in the navbar switches all content and flips the layout to right-to-left for Yiddish. The choice is remembered between pages via `localStorage`.

## Tech

Pure static site — no build step, no dependencies.

- HTML pages at the repo root (GitHub Pages friendly)
- Shared CSS and JS in `assets/`
- Fonts loaded from Google Fonts (Cormorant Garamond, Inter, Frank Ruhl Libre, Heebo)

## Running locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploying (GitHub Pages)

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save — the site goes live at `https://<username>.github.io/kollel-chatzos/`.

## Notes

- Phone, email and donation amounts on the **Partner** page are placeholders — replace with the kollel's real details.
- The contact form is a front-end demo; connect it to a form service (Formspree, Netlify Forms, etc.) to receive submissions.

*Content adapted from the kollel's own flyers and the liqut on the maalos of kimas chatzos.*
