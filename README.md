---
jekyll_exclude: true
---

# GHS
GHS Repro website

rebuild via Webarchive

The repository is published via **Netlify** on ghs.myvortexcloud.com


## Structure: the four areas

Every post belongs to one of four areas. The area is one line in the post's front matter:

```
rubrik: archiv            # restored from the old school website (2001–2016)
rubrik: erinnerungen      # memories of alumni; also needs a thema: line (see below)
rubrik: schulgeschichte   # history of the school
rubrik: wiedersehen       # every class reunion (whatever the year), the school grounds, current news
```

A post can belong to two areas; it then shows up in both and counts in both: `rubrik: [wiedersehen, erinnerungen]` (plus the `thema:` line for Erinnerungen), as in the 2005 reunion. Restored posts keep `archiv` in the list (`[archiv, wiedersehen]`), so they still get the archive note and stay out of "Neu auf der Seite".

Memories also name their group, exactly as written on the Erinnerungen page (`themen:` in `_pages/erinnerungen.html`):

```
thema: Klassenfahrten & Austausch
thema: Lehrer, AGs & Sport
thema: Musik & Zeitgeist
thema: Abschlussjahrgänge
```

- A post without `rubrik:` only appears under "Alle Beiträge" (/blog/).
- **Tags:** one or two per post, from these 13 (single words, because the tag name goes into the link to the Themen page): Schulleben, AGs, Projekte, Wettbewerbe, Sport, Lehrer, Klassenfahrten, Schüleraustausch, Abschlussjahrgänge, Klassentreffen, Zeitgeist, Schulgeschichte, Abschied. Example: `tags: [Klassenfahrten, Schüleraustausch]`.
- **Dates** are printed in German ("8. Oktober 2024") by `_includes/datum.html`; templates call it as `include datum.html date=post.date` (add `monat=true` for "Oktober 2024").
- **Home page:** the three tiles and their texts come from `_data/bereiche.yml`; "Neu auf der Seite" shows the three newest posts outside the archive; the dark archive band shows three restored posts with a picture, picked anew at every build.
- **Archive page** (`_pages/archiv.html`): intro text, the three restored pages, all `rubrik: archiv` posts by year. Each restored post shows a short note at the top (`_includes/archiv-hinweis.html`).
- **Timeline** on /schulgeschichte/: `_data/chronik.yml`, one entry per year with optional links (`url:` for a page, `post:` for a post's file name without `.md`) and an optional photo (`bild:` path, `bildtext:` caption; see 1962).
- **Videos:** `video_embed:` in the front matter shows a video instead of the cover picture (a YouTube embed address or a file such as `/videos/name.mp4`); the post then gets a play icon on its card and is listed on /videos/. GitHub warns above 50 MB per file and refuses files over 100 MB; longer videos belong on YouTube.
- **Teacher profiles** live in `_lehrer/`, one file per teacher, named after the surname without umlauts (`_lehrer/dickhoefer.md`, published at /lehrer/dickhoefer/). The overview at /lehrer/ shows them in file-name order, so alphabetically by surname. Front matter:
  - `name` and `description` (the role, shown under the name)
  - `image` (optional; the school logo is shown otherwise). Cropped portraits are in `images/lehrer/`.
  - `suche`: the spellings to look for in the posts, e.g. `[Fisser, Fißer]`. Every post whose title or text contains one of them is listed on the profile, so new posts show up by themselves. Case matters; use `[Herr Kronen, Herrn Kronen]` rather than a bare surname if the name also has another meaning, or belongs to another person too.
  - `kollegium` (optional): the teacher's number on the Kollegium photos, e.g. `- jahr: 1985` / `nr: 24`. It links to that photo on /kollegium/.
  - `autor` (optional): the file name of the author page (`_authors/andreas.md` → `andreas`) for teachers who wrote posts themselves.
  - `website` (optional, shown as "Mehr bei Wikipedia"; another label with `website_titel`, e.g. "Mehr im Dorsten-Lexikon")
  - `foto` (optional): a larger photo shown below the text (see Fißer)
  - `traueranzeige` (optional): the obituary notice, **top part only** (verse, name, dates; no family names or addresses), saved in `images/lehrer/` as `traueranzeige-<name>.jpg`
- **Teachers without a page of their own** are listed on /lehrer/ under "Außerdem in den Beiträgen", from `_data/lehrer_erwaehnt.yml` (name, optional role, the same `suche` list). To give one of them a page, create the file in `_lehrer/` and delete the entry there.
- **Unknown day:** if only the year of a post is known, give it any date in that year (for sorting) and add `nur_jahr: true`; the site then shows just the year, e.g. "2010" (see Klassentreffen 2010).
- **Authors** (`_authors/`): the text below the front matter is shown in full on the author's page, on the Autoren page and in the box under each of their posts (Markdown, headings and pictures included).
- **Second author:** a post can name one more author with `mitautor: <username>`. The post shows "A und B" under the title and a box for each below; the post counts on both author pages. Cards elsewhere (home page, areas, related posts) show only the first author. Authors without a photo use a placeholder with their initials in `images/autoren/`; replace the file (or change `image:`) when a photo arrives.
- **Kollegium** (`_pages/kollegium.md`): the staff photos of 1985 and 2000 with the numbered names; names with a profile are linked.
- Styles for all of this: `css/_3-modules/bereiche.scss`.

## Newsletter

The site sends its own newsletter (in German): one short email when a new post appears, or an old one is restored from the web archive. No outside newsletter service, no ads. It replaced follow.it in November 2026 and is the same system as on chess.myvortexcloud.com.

- **Sign-up:** `/newsletter/` (in the footer menu, the envelope icon in the footer, and on the About page). Readers confirm with one click; every email has a one-click unsubscribe link, and mail apps get their own "Unsubscribe" button (List-Unsubscribe header). Unsubscribing deletes the address.
- **Where the addresses are:** in Netlify Blobs (store `newsletter`) in the Netlify account. Never in this repository.
- **Sending:** `netlify/functions/newsletter-send.mjs` runs every day at 06:00 UTC (7 AM in Germany in winter, 8 AM in summer). It reads `/newsletter.json` (all posts), mails what is new on the site to the confirmed readers through Resend, and remembers what it sent. The first run only remembers what is already on the site.
- **Restored posts are mailed too:** they keep their old date, so the newsletter goes by what is new on the site, not by date. A post that is over a year old when mailed is labelled "Aus dem Archiv", otherwise "Neuer Beitrag". Up to five posts per email; more get one line and a link to the blog. Renaming a post's file changes its address, and the post is then mailed again as new.
- **Never mail a post:** add `newsletter: false` to its front matter.
- **Code:** `netlify/lib/newsletter.mjs` (logic, the same on every site), `netlify/lib/newsletter-site.mjs` (this site's address, name, colours and the German wording of the emails), `netlify/lib/runtime.mjs` (Netlify and Resend), `netlify/functions/newsletter-*.mjs` (subscribe, confirm, unsubscribe, send, admin). Pages: `_pages/newsletter*.html`, script `_includes/newsletter-script.html`, styles `css/_3-modules/newsletter.scss`.

**Netlify environment variables**

| Key | Value |
|---|---|
| `RESEND_API_KEY` | API key from resend.com, its own for this site (sending access, domain news.myvortexcloud.com) |
| `NEWSLETTER_FROM` | `GHS Dorsten <ghs@news.myvortexcloud.com>` |
| `NEWSLETTER_ADMIN_KEY` | a long random string for the admin commands (`openssl rand -hex 24`), its own for this site |
| `NEWSLETTER_REPLY_TO` | optional: an address readers' replies go to |

The sending domain `news.myvortexcloud.com` is already verified in Resend (set up for the chess site), so this site needs no new DNS records.

**Admin commands** (Terminal; replace KEY with the admin key):

```
# how many readers
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=count"
# all addresses
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=list"
# import a follow.it export (the file in Downloads), leaving out one address
curl -X POST -H "Authorization: Bearer KEY" --data-binary @Followers.csv "https://ghs.myvortexcloud.com/api/newsletter-admin?action=import&exclude=someone@example.com"
# remove a reader
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=remove&email=someone@example.com"
# send the newest post to one address, as a test
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=test&to=you@example.com"
# send the "newsletter has moved" email to one address, as a test
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=test-moved&to=you@example.com"
# once: tell the imported follow.it readers about the move
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=moved-notice"
# announce now instead of waiting for the morning (add &dry=1 to only see what would go out)
curl -X POST -H "Authorization: Bearer KEY" "https://ghs.myvortexcloud.com/api/newsletter-admin?action=send-now"
```
