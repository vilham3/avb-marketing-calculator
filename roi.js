// Growth & ROI math. No DOM access here, so it can be tested with `node --test`.
//
// The chain follows the Sales & Traffic Tracking Worksheet:
//   store visits x close rate = sales, sales x average ticket = sales dollars,
//   sales dollars x gross margin = gross profit, marketing spend / store visits = cost per visit.
// Rates are fractions (0.209 for 20.9%).

// Defaults by member category. Average ticket is the online whole-order AOV from Magento
// (placed USD orders, Nov 2025 - Oct 2026, duplicate order lines removed). Gross margin
// comes from the POS sample in BigQuery and covers only part of revenue, so it's a placeholder.
const ROI_CATEGORIES = {
  appliances: { label: "Appliances", averageTicket: 1521, grossMargin: 0.258 },
  furniture: { label: "Furniture", averageTicket: 1396, grossMargin: 0.506 },
  mattresses: { label: "Mattresses", averageTicket: 1783, grossMargin: 0.532 },
  electronics: { label: "Electronics", averageTicket: 1753, grossMargin: 0.314 },
};

const ROI_DEFAULTS = {
  category: "appliances",
  // Google Ads spend / Google store visits across members with store visits, Nov 2025 - Oct 2026
  costPerVisit: 27.12,
  // Sample member from the Sales & Traffic Tracking Worksheet (4 locations, YTD)
  closeRate: 0.209,
  growthGoal: 0.1,
};

function isPositive(value) {
  return Number.isFinite(value) && value > 0;
}

// Close rate implied by a door count: sales count (revenue / average ticket) / traffic.
function closeRateFromTraffic(revenue, averageTicket, annualTraffic) {
  if (!isPositive(revenue) || !isPositive(averageTicket) || !isPositive(annualTraffic)) return null;
  return revenue / averageTicket / annualTraffic;
}

// What a given media spend buys at the average cost per visit.
function projectReturns({ spend, costPerVisit, closeRate, averageTicket, grossMargin }) {
  if (!isPositive(costPerVisit) || !(spend >= 0)) return null;
  const visits = spend / costPerVisit;
  const sales = visits * closeRate;
  const salesDollars = sales * averageTicket;
  const grossProfit = salesDollars * grossMargin;
  return { visits, sales, salesDollars, grossProfit };
}

// Works backwards from a sales growth goal to the store visits and media spend it takes.
function planGrowth({ revenue, growthGoal, averageTicket, closeRate, grossMargin, costPerVisit }) {
  if (!isPositive(revenue) || !isPositive(growthGoal) || !isPositive(averageTicket) ||
      !isPositive(closeRate) || !isPositive(costPerVisit)) {
    return null;
  }
  const addedSalesDollars = revenue * growthGoal;
  const addedSales = addedSalesDollars / averageTicket;
  const addedVisits = addedSales / closeRate;
  const addedSpend = addedVisits * costPerVisit;
  const addedGrossProfit = addedSalesDollars * grossMargin;
  return { addedSalesDollars, addedSales, addedVisits, addedSpend, addedGrossProfit };
}

// Smallest annual budget whose variable (media) part reaches `targetVariable`, given the
// fixed fees each budget carries. Fees step up with the budget tier, so a bigger budget can
// pull in higher fees; repeat until the budget covers both the media target and its fees.
function budgetForVariableSpend(targetVariable, fixedFeesFor) {
  if (!(targetVariable >= 0)) return null;
  let budget = targetVariable;
  for (let i = 0; i < 100; i++) {
    const next = targetVariable + fixedFeesFor(budget);
    if (next <= budget + 0.005) return budget;
    budget = next;
  }
  return budget;
}

if (typeof module !== "undefined") {
  module.exports = {
    ROI_CATEGORIES,
    ROI_DEFAULTS,
    closeRateFromTraffic,
    projectReturns,
    planGrowth,
    budgetForVariableSpend,
  };
}
