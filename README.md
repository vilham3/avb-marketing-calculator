# avb-marketing-calculator

Marketing budget calculator. Enter a member's retail revenue to get a recommended
annual marketing budget (3% of revenue), or enter an actual annual budget to
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

Copied from https://jgezalianavb.github.io/marketing-calc/
(source: https://github.com/jgezalianavb/marketing-calc, commit `700ade9`).

## Files

- `index.html` – page markup (input table and monthly breakdown table)
- `helpers.js` – all budget calculations
- `styles.css` – styling (AVB Marketing brand colors and the Mulish font, with light and dark themes)
- `assets/avb-marketing-logo.png` – AVB Marketing logo shown in the header

## Running

It's a static page with no build step. Open `index.html` in a browser, or serve
the repo root with GitHub Pages.
