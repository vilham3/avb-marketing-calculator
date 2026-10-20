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
  console.log(retailRevenue)
  // const categoryRevenue1 = parseNumber(document.getElementById("categoryRevenue1").value) / 100;
  // const categoryRevenue2 = parseNumber(document.getElementById("categoryRevenue2").value) / 100;

  // Marketing percentage is now fixed at 3%
  const mrktgRevenue = 3 / 100;

  const recAnnualBudget = retailRevenue * mrktgRevenue;
  // const budget2 = retailRevenue * categoryRevenue2 * mrktgRevenue2;

  document.getElementById("recAnnualBudget").textContent = `$${formatNumberWithCommas(recAnnualBudget)}`;
  document.getElementById("actAnnualBudget").placeholder = formatNumberWithCommas(recAnnualBudget);

  updateMonthlyBudget();
}


function updateMonthlyBudget() {
  // Get the Act Annual Budget value from the input or placeholder
  const actAnnualBudget = parseNumber(
    document.getElementById("actAnnualBudget").value ||
    document.getElementById("actAnnualBudget").placeholder
  );

  // Monthly percentages for each month
  const monthlyPercentages = [
    0.07, 0.08, 0.07, 0.07, 0.09, 0.09, 0.1, 0.085, 0.085, 0.07, 0.12, 0.07,
  ];
  let totalBudget = 0;

  monthlyPercentages.forEach((percentage, index) => {
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

// Tactics paid as a flat monthly fee, taken off the top of the evergreen budget
const FEE_TACTICS = ["email", "content", "seo"];
// Tactics that split whatever evergreen budget is left after the fees
const MEDIA_TACTICS = ["google", "fb", "youtube", "ott"];

// Evergreen tiers, lowest first. A month uses the last tier whose `min` its evergreen budget reaches.
const TIERS = [
  { min: 0,     fees: { email: 0,    content: 0,   seo: 0    }, shares: { google: 1,   fb: 0,    youtube: 0,    ott: 0   } },
  { min: 3000,  fees: { email: 250,  content: 0,   seo: 0    }, shares: { google: 1,   fb: 0,    youtube: 0,    ott: 0   } },
  { min: 5250,  fees: { email: 600,  content: 200, seo: 0    }, shares: { google: 0.8, fb: 0.1,  youtube: 0.1,  ott: 0   } },
  { min: 15000, fees: { email: 1500, content: 200, seo: 0    }, shares: { google: 0.7, fb: 0.15, youtube: 0.15, ott: 0   } },
  { min: 21000, fees: { email: 1500, content: 200, seo: 3000 }, shares: { google: 0.7, fb: 0.1,  youtube: 0.1,  ott: 0.1 } },
  { min: 50000, fees: { email: 1500, content: 200, seo: 5000 }, shares: { google: 0.6, fb: 0.1,  youtube: 0.2,  ott: 0.1 } },
];

function tierFor(evergreenValue) {
  return TIERS.filter((tier) => evergreenValue >= tier.min).pop();
}

function isTacticSelected(tactic) {
  return document.getElementById(`use-${tactic}`).checked;
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

document
  .getElementById("retailRevenue")
  .addEventListener("blur", () => formatInputField("retailRevenue"));
document
  .getElementById("actAnnualBudget")
  .addEventListener("blur", () => formatInputField("actAnnualBudget"));
document
  .querySelectorAll(".tactic-toggle")
  .forEach((checkbox) => checkbox.addEventListener("change", updateMonthlyBudget));

// Fill every cell with formatted zeros on load
calculateBudget();
