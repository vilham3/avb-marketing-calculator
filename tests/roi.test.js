const test = require("node:test");
const assert = require("node:assert/strict");
const {
  closeRateFromTraffic,
  projectReturns,
  planGrowth,
  budgetForVariableSpend,
} = require("../roi.js");

const close = (actual, expected, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

test("close rate from traffic matches the worksheet's YTD totals", () => {
  // Worksheet YTD: 27,386 traffic, 5,729 sales, $12,545,243 written sales
  const averageTicket = 12545243 / 5729;
  close(closeRateFromTraffic(12545243, averageTicket, 27386), 5729 / 27386, 1e-9);
  assert.equal(closeRateFromTraffic(0, 1500, 1000), null);
  assert.equal(closeRateFromTraffic(1000000, 1500, 0), null);
});

test("projectReturns runs visits -> sales -> gross profit", () => {
  const result = projectReturns({
    spend: 27120, costPerVisit: 27.12, closeRate: 0.2, averageTicket: 1500, grossMargin: 0.3,
  });
  close(result.visits, 1000);
  close(result.sales, 200);
  close(result.salesDollars, 300000);
  close(result.grossProfit, 90000);
  assert.equal(projectReturns({ spend: 1000, costPerVisit: 0, closeRate: 0.2, averageTicket: 1, grossMargin: 1 }), null);
});

test("planGrowth works backwards from the goal", () => {
  const plan = planGrowth({
    revenue: 10000000, growthGoal: 0.1, averageTicket: 1500, closeRate: 0.2, grossMargin: 0.3, costPerVisit: 30,
  });
  close(plan.addedSalesDollars, 1000000);
  close(plan.addedSales, 666.67);
  close(plan.addedVisits, 3333.33);
  close(plan.addedSpend, 100000);
  close(plan.addedGrossProfit, 300000);
  assert.equal(planGrowth({ revenue: 1, growthGoal: 0.1, averageTicket: 1, closeRate: 0, grossMargin: 0, costPerVisit: 1 }), null);
});

test("budgetForVariableSpend covers fees, including a tier jump", () => {
  // Flat $10k fees below a $100k budget, $30k at or above it
  const fees = (budget) => (budget >= 100000 ? 30000 : 10000);
  close(budgetForVariableSpend(50000, fees), 60000);
  // $85k of media plus $10k fees is $95k, still under the higher tier
  close(budgetForVariableSpend(85000, fees), 95000);
  // $95k of media pushes the budget over $100k, which brings the higher fees
  close(budgetForVariableSpend(95000, fees), 125000);
  close(budgetForVariableSpend(0, () => 0), 0);
});
