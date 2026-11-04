function formatNumberWithCommas(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseNumber(value) {
  // Remove commas and dollar signs before parsing
  return parseFloat(value.replace(/,/g, "").replace("$", "")) || 0;
}

function formatInputField(fieldId) {
  const inputField = document.getElementById(fieldId);
  // Leave empty fields empty: an empty Act Annual Budget falls back to the recommended budget
  if (inputField.value.trim() === "") return;
  const value = parseNumber(inputField.value); // Parse the input value to a number
  inputField.value = formatNumberWithCommas(value);
}

function calculateBudget() {
  const retailRevenue = parseNumber(document.getElementById("retailRevenue").value);
  // Marketing percent of revenue, editable on the page (3% by default)
  const marketingShare = parseNumber(document.getElementById("marketingPct").value) / 100;

  const recAnnualBudget = retailRevenue * marketingShare;

  document.getElementById("recAnnualBudget").textContent = `$${formatNumberWithCommas(recAnnualBudget)}`;
  document.getElementById("actAnnualBudget").placeholder = formatNumberWithCommas(recAnnualBudget);

  updateMonthlyBudget();
}


// The Act Annual Budget, or the recommended budget (its placeholder) when it's blank
function currentAnnualBudget() {
  const input = document.getElementById("actAnnualBudget");
  return parseNumber(input.value || input.placeholder);
}

function updateMonthlyBudget() {
  const actAnnualBudget = currentAnnualBudget();
  let totalBudget = 0;

  MONTHLY_SHARES.forEach((percentage, index) => {
    const monthlyBudget = actAnnualBudget * percentage;
    totalBudget += monthlyBudget;

    const monthId = `budget-${[
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ][index]
      }`;
    document.getElementById(monthId).textContent = `$${formatNumberWithCommas(
      monthlyBudget
    )}`;
  });

  document.getElementById(
    "budget-total"
  ).textContent = `$${formatNumberWithCommas(totalBudget)}`;

  calculateEvergreenBudget();
  calculateChannelBudgets();
  calculateBudgetPercentages();
  calculatePromoBudget();
  updateRoi();
}

function calculateEvergreenBudget() {
  const monthlyIds = [
    "budget-jan",
    "budget-feb",
    "budget-mar",
    "budget-apr",
    "budget-may",
    "budget-jun",
    "budget-jul",
    "budget-aug",
    "budget-sep",
    "budget-oct",
    "budget-nov",
    "budget-dec",
  ];

  const monthlyBudgets = monthlyIds.map((id) =>
    parseNumber(document.getElementById(id).textContent)
  );
  const minBudget = Math.min(...monthlyBudgets);

  let totalEvergreen = 0;
  monthlyIds.forEach((id, index) => {
    const evergreenId = `evergreen-${id.split("-")[1]}`;
    document.getElementById(
      evergreenId
    ).textContent = `$${formatNumberWithCommas(minBudget)}`;
    totalEvergreen += minBudget;
  });

  document.getElementById(
    "evergreen-total"
  ).textContent = `$${formatNumberWithCommas(totalEvergreen)}`;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// Share of the annual budget spent in each month, January first
const MONTHLY_SHARES = [0.07, 0.08, 0.07, 0.07, 0.09, 0.09, 0.1, 0.085, 0.085, 0.07, 0.12, 0.07];

// Tactics paid as a flat monthly fee, taken off the top of the evergreen budget
const FEE_TACTICS = ["email", "content", "seo"];
// Tactics that split whatever evergreen budget is left after the fees
const MEDIA_TACTICS = ["google", "fb", "youtube", "ott"];

// Evergreen tiers, lowest first. A month uses the last tier whose `min` its evergreen budget reaches.
// The SEO fee includes AIRank: Local ($500) from $3,500 evergreen, Pro ($1,000) from $7,000.
// From $21,000 Pro is added to the $3,000 SEO package; the $5,000 package already includes it.
const TIERS = [
  { min: 0,     fees: { email: 0,    content: 0,   seo: 0    }, shares: { google: 1,   fb: 0,    youtube: 0,    ott: 0   }, seoPackage: "" },
  { min: 3000,  fees: { email: 250,  content: 0,   seo: 0    }, shares: { google: 1,   fb: 0,    youtube: 0,    ott: 0   }, seoPackage: "" },
  { min: 3500,  fees: { email: 250,  content: 0,   seo: 500  }, shares: { google: 1,   fb: 0,    youtube: 0,    ott: 0   }, seoPackage: "AIRank - Local" },
  { min: 5250,  fees: { email: 600,  content: 200, seo: 500  }, shares: { google: 0.8, fb: 0.1,  youtube: 0.1,  ott: 0   }, seoPackage: "AIRank - Local" },
  { min: 7000,  fees: { email: 600,  content: 200, seo: 1000 }, shares: { google: 0.8, fb: 0.1,  youtube: 0.1,  ott: 0   }, seoPackage: "AIRank - Pro" },
  { min: 15000, fees: { email: 1500, content: 200, seo: 1000 }, shares: { google: 0.7, fb: 0.15, youtube: 0.15, ott: 0   }, seoPackage: "AIRank - Pro" },
  { min: 21000, fees: { email: 1500, content: 200, seo: 4000 }, shares: { google: 0.7, fb: 0.1,  youtube: 0.1,  ott: 0.1 }, seoPackage: "$3,000 SEO + AIRank - Pro" },
  { min: 50000, fees: { email: 1500, content: 200, seo: 5000 }, shares: { google: 0.6, fb: 0.1,  youtube: 0.2,  ott: 0.1 }, seoPackage: "SEO incl. AIRank - Pro" },
];

function tierFor(evergreenValue) {
  return TIERS.filter((tier) => evergreenValue >= tier.min).pop();
}

function isTacticSelected(tactic) {
  return document.getElementById(`use-${tactic}`).checked;
}

// Annual flat fees (Email, Content Bundle, SEO) that an annual budget carries, using the same
// rules as calculateChannelBudgets: evergreen is the smallest month, and its tier sets the fees.
function annualFixedFees(annualBudget) {
  const evergreen = Math.round(annualBudget * Math.min(...MONTHLY_SHARES) * 100) / 100;
  const tier = tierFor(evergreen);
  return 12 * FEE_TACTICS.filter(isTacticSelected).reduce((sum, tactic) => sum + tier.fees[tactic], 0);
}

// Splits each month's evergreen budget across the selected tactics using the tier rules.
// An unselected fee tactic isn't charged, which leaves more for the media tactics. An
// unselected media tactic's share goes to the selected media tactics in proportion to
// their own shares. Anything no selected tactic can take is shown as Unallocated.
function calculateChannelBudgets() {
  const tactics = [...FEE_TACTICS, ...MEDIA_TACTICS, "unallocated"];
  const totals = Object.fromEntries(tactics.map((tactic) => [tactic, 0]));

  MONTHS.forEach((month) => {
    const evergreenValue = parseNumber(document.getElementById(`evergreen-${month}`).textContent);
    const tier = tierFor(evergreenValue);
    const amounts = {};

    FEE_TACTICS.forEach((tactic) => {
      amounts[tactic] = isTacticSelected(tactic) ? tier.fees[tactic] : 0;
    });
    const remaining = evergreenValue - (amounts.email + amounts.content + amounts.seo);

    const tierShareTotal = MEDIA_TACTICS.reduce((sum, tactic) => sum + tier.shares[tactic], 0);
    const selectedShareTotal = MEDIA_TACTICS
      .filter(isTacticSelected)
      .reduce((sum, tactic) => sum + tier.shares[tactic], 0);
    // Only rescale when a funded tactic is unselected, so the default split matches the tier exactly
    const scale = selectedShareTotal === tierShareTotal ? 1 : 1 / selectedShareTotal;

    MEDIA_TACTICS.forEach((tactic) => {
      amounts[tactic] = isTacticSelected(tactic) && selectedShareTotal > 0
        ? tier.shares[tactic] * scale * remaining
        : 0;
    });
    amounts.unallocated = selectedShareTotal > 0 ? 0 : remaining;

    tactics.forEach((tactic) => {
      totals[tactic] += amounts[tactic];
      document.getElementById(`${tactic}-${month}`).textContent = `$${formatNumberWithCommas(amounts[tactic])}`;
    });
  });

  tactics.forEach((tactic) => {
    document.getElementById(`${tactic}-total`).textContent = `$${formatNumberWithCommas(totals[tactic])}`;
  });

  [...FEE_TACTICS, ...MEDIA_TACTICS].forEach((tactic) => {
    document.getElementById(`use-${tactic}`).closest("tr").classList.toggle("is-off", !isTacticSelected(tactic));
  });
  document.getElementById("unallocated-row").hidden = totals.unallocated === 0;

  // Evergreen is the same every month, so January's tier names the SEO package for the year
  const evergreenJan = parseNumber(document.getElementById("evergreen-jan").textContent);
  document.getElementById("seo-package").textContent = tierFor(evergreenJan).seoPackage;
}

function calculatePromoBudget() {
  // Parse necessary values from the respective budget rows
  const febBudget = parseNumber(document.getElementById("budget-feb").textContent);
  const febEvergreen = parseNumber(document.getElementById("evergreen-feb").textContent);

  const mayBudget = parseNumber(document.getElementById("budget-may").textContent);
  const mayEvergreen = parseNumber(document.getElementById("evergreen-may").textContent);

  const juneBudget = parseNumber(document.getElementById("budget-jun").textContent);
  const juneEvergreen = parseNumber(document.getElementById("evergreen-jun").textContent);

  const julyBudget = parseNumber(document.getElementById("budget-jul").textContent);
  const julyEvergreen = parseNumber(document.getElementById("evergreen-jul").textContent);

  const augBudget = parseNumber(document.getElementById("budget-aug").textContent);
  const augEvergreen = parseNumber(document.getElementById("evergreen-aug").textContent);

  const septBudget = parseNumber(document.getElementById("budget-sep").textContent);
  const septEvergreen = parseNumber(document.getElementById("evergreen-sep").textContent);

  const novBudget = parseNumber(document.getElementById("budget-nov").textContent);
  const novEvergreen = parseNumber(document.getElementById("evergreen-nov").textContent);

  // Calculate individual promotion budgets
  const presDay = febBudget - febEvergreen;
  //const memDay = (mayBudget - mayEvergreen) + 0.5 * (juneBudget - juneEvergreen);
  const memDay = (mayBudget - mayEvergreen)
  const junePromo = (juneBudget - juneEvergreen)
  //const july4th = 0.5 * (juneBudget - juneEvergreen) + (julyBudget - julyEvergreen);
  const july4th = (julyBudget - julyEvergreen)
  const augPromo = (augBudget - augEvergreen)
  //const laborDay = (augBudget - augEvergreen) + (septBudget - septEvergreen);
  const laborDay = (septBudget - septEvergreen)
  const blackFriday = novBudget - novEvergreen;

  // Calculate total promo budget
  const promoTotal = presDay + memDay + junePromo + july4th + augPromo + laborDay + blackFriday;

  // Update the DOM with calculated values
  document.getElementById("pres-day").textContent = `$${formatNumberWithCommas(presDay)}`;
  document.getElementById("mem-day").textContent = `$${formatNumberWithCommas(memDay)}`;
  document.getElementById("june-promo").textContent = `$${formatNumberWithCommas(junePromo)}`;
  document.getElementById("july-4").textContent = `$${formatNumberWithCommas(july4th)}`;
  document.getElementById("aug-promo").textContent = `$${formatNumberWithCommas(augPromo)}`;
  document.getElementById("labor-day").textContent = `$${formatNumberWithCommas(laborDay)}`;
  document.getElementById("black-friday").textContent = `$${formatNumberWithCommas(blackFriday)}`;
  document.getElementById("promo-total").textContent = `$${formatNumberWithCommas(promoTotal)}`;
}

function calculateBudgetPercentages() {
  const services = [...FEE_TACTICS, ...MEDIA_TACTICS, "unallocated"];
  const evergreenValue = parseNumber(document.getElementById("evergreen-total").textContent);

  services.forEach(service => {
    const serviceValue = parseNumber(document.getElementById(`${service}-total`).textContent);
    let percentage = evergreenValue > 0 ? (serviceValue / evergreenValue) * 100 : 0;
    document.getElementById(`${service}-percentage`).textContent = `${percentage.toFixed(2)}%`;
  });
}

// ---------- Growth & ROI ----------

const formatWholeDollars = (value) => `$${Math.round(value).toLocaleString()}`;
const formatCount = (value) => Math.round(value).toLocaleString();
const formatPercent = (share) => `${(share * 100).toFixed(1)}%`;

function readPercent(id) {
  return parseNumber(document.getElementById(id).value) / 100;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function fillRoiDefaults() {
  const select = document.getElementById("roiCategory");
  Object.entries(ROI_CATEGORIES).forEach(([key, category]) => select.add(new Option(category.label, key)));
  select.value = ROI_DEFAULTS.category;
  document.getElementById("costPerVisit").value = formatNumberWithCommas(ROI_DEFAULTS.costPerVisit);
  document.getElementById("closeRate").value = (ROI_DEFAULTS.closeRate * 100).toFixed(1);
  document.getElementById("growthGoal").value = (ROI_DEFAULTS.growthGoal * 100).toFixed(0);
  applyCategoryDefaults();
}

function applyCategoryDefaults() {
  const category = ROI_CATEGORIES[document.getElementById("roiCategory").value];
  document.getElementById("averageTicket").value = formatNumberWithCommas(category.averageTicket);
  document.getElementById("grossMargin").value = (category.grossMargin * 100).toFixed(1);
}

// With a door count, the close rate is calculated and locked; clearing the count restores
// whatever close rate was typed before.
function syncCloseRate(revenue, averageTicket) {
  const input = document.getElementById("closeRate");
  const trafficRate = closeRateFromTraffic(revenue, averageTicket, parseNumber(document.getElementById("annualTraffic").value));
  if (trafficRate !== null) {
    if (!input.disabled) input.dataset.typed = input.value;
    input.disabled = true;
    input.value = (trafficRate * 100).toFixed(1);
    setText("closeRateHint", "Calculated: sales (revenue ÷ ticket) ÷ traffic");
  } else if (input.disabled) {
    input.disabled = false;
    input.value = input.dataset.typed || "";
    setText("closeRateHint", "Share of store visitors who buy");
  }
}

function updateRoi() {
  const revenue = parseNumber(document.getElementById("retailRevenue").value);
  const budget = currentAnnualBudget();
  const averageTicket = parseNumber(document.getElementById("averageTicket").value);
  syncCloseRate(revenue, averageTicket);

  const inputs = {
    averageTicket,
    closeRate: readPercent("closeRate"),
    grossMargin: readPercent("grossMargin"),
    costPerVisit: parseNumber(document.getElementById("costPerVisit").value),
  };
  const growthGoal = readPercent("growthGoal");
  const traffic = parseNumber(document.getElementById("annualTraffic").value);

  // What the current budget buys
  const fixedFees = annualFixedFees(budget);
  const mediaSpend = budget - fixedFees;
  const current = budget > 0 ? projectReturns({ spend: mediaSpend, ...inputs }) : null;

  setText("roi-budget", budget > 0 ? formatWholeDollars(budget) : "—");
  setText("roi-budget-note", budget > 0 && revenue > 0 ? `${formatPercent(budget / revenue)} of revenue` : "");
  setText("roi-fixed", budget > 0 ? formatWholeDollars(fixedFees) : "—");
  setText("roi-variable", budget > 0 ? formatWholeDollars(mediaSpend) : "—");
  setText("roi-visits", current ? formatCount(current.visits) : "—");
  setText("roi-sales-dollars", current ? formatWholeDollars(current.salesDollars) : "—");
  setText("roi-sales", current ? `${formatCount(current.sales)} sales` : "");
  setText("roi-gp", current ? formatWholeDollars(current.grossProfit) : "—");
  setText("roi-gp-per-dollar", current && budget > 0 ? `$${(current.grossProfit / budget).toFixed(2)}` : "—");
  document.getElementById("roi-traffic-row").hidden = !(traffic > 0 && budget > 0);
  setText("roi-cost-per-traffic", traffic > 0 ? `$${(budget / traffic).toFixed(2)}` : "—");

  // Working backwards from the growth goal
  setText("goal-label", growthGoal > 0 ? `+${(growthGoal * 100).toLocaleString()}%` : "—");
  const plan = planGrowth({ revenue, growthGoal, ...inputs });
  if (!plan) {
    ["goal-sales-dollars", "goal-visits", "goal-spend", "goal-budget", "goal-gp", "goal-gp-per-dollar"]
      .forEach((id) => setText(id, "—"));
    setText("goal-sales", "");
    setText("goal-budget-note", "");
    return;
  }

  const newBudget = budgetForVariableSpend(mediaSpend + plan.addedSpend, annualFixedFees);
  const addedBudget = newBudget - budget;
  const addedFees = annualFixedFees(newBudget) - fixedFees;
  const budgetNote = [`+${formatWholeDollars(addedBudget)}`, `${formatPercent(newBudget / revenue)} of revenue`];
  if (addedFees >= 1) budgetNote.push(`includes ${formatWholeDollars(addedFees)} more in fixed fees at the higher tier`);

  setText("goal-sales-dollars", formatWholeDollars(plan.addedSalesDollars));
  setText("goal-sales", `${formatCount(plan.addedSales)} more sales`);
  setText("goal-visits", formatCount(plan.addedVisits));
  setText("goal-spend", formatWholeDollars(plan.addedSpend));
  setText("goal-budget", formatWholeDollars(newBudget));
  setText("goal-budget-note", budgetNote.join(" · "));
  setText("goal-gp", formatWholeDollars(plan.addedGrossProfit));
  setText("goal-gp-per-dollar", addedBudget > 0 ? `$${(plan.addedGrossProfit / addedBudget).toFixed(2)}` : "—");
}

document
  .getElementById("retailRevenue")
  .addEventListener("blur", () => formatInputField("retailRevenue"));
document
  .getElementById("actAnnualBudget")
  .addEventListener("blur", () => formatInputField("actAnnualBudget"));
document
  .querySelectorAll(".tactic-toggle")
  .forEach((checkbox) => checkbox.addEventListener("change", updateMonthlyBudget));
document
  .querySelectorAll(".roi-input")
  .forEach((input) => input.addEventListener("input", updateRoi));
["averageTicket", "costPerVisit"].forEach((id) =>
  document.getElementById(id).addEventListener("blur", () => formatInputField(id)));
document.getElementById("annualTraffic").addEventListener("blur", () => {
  const input = document.getElementById("annualTraffic");
  if (input.value.trim() !== "") input.value = formatCount(parseNumber(input.value));
});
document.getElementById("roiCategory").addEventListener("change", () => {
  applyCategoryDefaults();
  updateRoi();
});

// Fill the ROI defaults, then every cell with formatted zeros on load
fillRoiDefaults();
calculateBudget();
