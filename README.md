# avb-marketing-calculator

Marketing budget calculator. Enter a member's retail revenue to get a recommended
annual marketing budget (3% of revenue by default; the percent is editable), or enter an actual annual budget to
override it. The budget is spread across months, split into evergreen and promo
dollars, and allocated across Email, Content Bundle, SEO, Google, FB/IG, YouTube
and OTT based on the evergreen tier.

The SEO line includes AIRank: AIRank - Local ($500/month) from $3,500 evergreen
and AIRank - Pro ($1,000/month) from $7,000. From $21,000 evergreen, Pro is
added to the $3,000 SEO package (so $4,000); the $5,000 package at $50,000+
already includes it. The package name is shown under SEO.

Each tactic has a checkbox. Unchecking one takes it out of the split: an
unchecked flat fee (Email, Content Bundle, SEO) isn't charged, and an unchecked
media tactic's share goes to the checked media tactics in proportion to their
tier shares. If no checked tactic can take the money at that tier, it shows in
an Unallocated row. Checking a tactic never adds it below the tier that funds it.

## Growth & ROI

The Growth & ROI section runs the math from the Sales & Traffic Tracking
Worksheet: store visits × close rate × average ticket × gross margin.

- **What the current budget buys.** The budget's media spend (the budget minus
  the fixed Email, Content and SEO fees for its tier) ÷ cost per store visit
  gives the store visits it buys, then sales and gross profit. With a door count,
  it also shows the budget per store visitor, as on the worksheet.
- **To grow sales.** Works backwards from a growth goal: added sales ÷ average
  ticket ÷ close rate gives the store visits needed, × cost per store visit gives
  the added media spend. The new annual budget covers that spend plus any higher
  fixed fees from moving up a tier.

Every input is editable. Defaults (in `roi.js`):

| Input | Default | Source |
|---|---|---|
| Average ticket | Appliances $1,521 · Furniture $1,396 · Mattresses $1,783 · Electronics $1,753 | Magento online whole-order AOV, placed USD orders, Nov 2025–Oct 2026, duplicate order lines removed |
| Gross margin | 25.8% · 50.6% · 53.2% · 31.4% | POS sample in BigQuery; covers only part of revenue, so low confidence |
| Close rate | 20.9% | Sample member on the tracking worksheet (4 locations, YTD) |
| Cost per store visit | $27.12 | Google Ads spend ÷ Google store visits, members with store visits, Nov 2025–Oct 2026 |
| Growth goal | 10% | |

Entering annual store traffic replaces the close rate with sales (revenue ÷
average ticket) ÷ traffic. The math assumes every added store visit costs the
average, so results are a ballpark.

Copied from https://jgezalianavb.github.io/marketing-calc/
(source: https://github.com/jgezalianavb/marketing-calc, commit `700ade9`).

## Files

- `index.html` – page markup (input table and monthly breakdown table)
- `helpers.js` – budget calculations and page updates
- `roi.js` – Growth & ROI math and defaults (no DOM, so it runs under Node)
- `tests/roi.test.js` – tests for `roi.js`; run with `node --test`
- `styles.css` – styling (AVB Marketing brand colors and the Mulish font, with light and dark themes)
- `assets/avb-marketing-logo.png` – AVB Marketing logo shown in the header

## Running

It's a static page with no build step. Open `index.html` in a browser, or serve
the repo root with GitHub Pages.
