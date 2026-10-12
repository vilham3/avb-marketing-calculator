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
  document.getElementById("actAnnualBudget").placeholder = `$${formatNumberWithCommas(recAnnualBudget)}`;

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
  calculateEmailBudget();
  calculateContentBundleBudget();
  calculateSEOBudget();
  calculateGoogleBudget();
  calculateFBBudget();
  calculateYouTubeBudget()
  calculateOTTBudget();
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

function calculateGoogleBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalGoogleBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    const emailValue = parseNumber(document.getElementById(`email-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const seoValue = parseNumber(document.getElementById(`seo-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const contentValue = parseNumber(document.getElementById(`content-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    let googleBudget = 0;

    if (evergreenValue < 2999) {
      googleBudget = evergreenValue;
    } else if (evergreenValue >= 3000 && evergreenValue <= 5249) {
      googleBudget = evergreenValue - emailValue;
    } else if (evergreenValue >= 5250 && evergreenValue <= 14999) {
      googleBudget = 0.8 * (evergreenValue - (emailValue + contentValue));
    } 
    else if (evergreenValue >= 15000 && evergreenValue <= 20999) {
      googleBudget = 0.7 * (evergreenValue - (emailValue + contentValue));
    } 

    else if (evergreenValue >= 21000 && evergreenValue <= 49999) {
      googleBudget = 0.7 * (evergreenValue - (emailValue + contentValue + seoValue));
    } 

    else {
      googleBudget = 0.6 * (evergreenValue - (emailValue + seoValue + contentValue));
    }

    totalGoogleBudget += googleBudget;

    const googleId = `google-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(googleId).textContent = `$${formatNumberWithCommas(googleBudget)}`;
  });

  document.getElementById("google-total").textContent = `$${formatNumberWithCommas(totalGoogleBudget)}`;
}

function calculateFBBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalFBBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    const emailValue = parseNumber(document.getElementById(`email-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const contentValue = parseNumber(document.getElementById(`content-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const seoValue = parseNumber(document.getElementById(`seo-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    let fbBudget = 0;

    if (evergreenValue < 5250) {
      fbBudget = 0;
    } else if (evergreenValue >= 5250 && evergreenValue <= 14999) {
      fbBudget = 0.1 * (evergreenValue - (emailValue + contentValue));
    
    } 
    
    else if (evergreenValue >= 15000 && evergreenValue <= 20999) {
      fbBudget = 0.15 * (evergreenValue - (emailValue + contentValue));
    }
    
    else {
      fbBudget = 0.1 * (evergreenValue - (seoValue + emailValue + contentValue));
    }

    totalFBBudget += fbBudget;

    const fbId = `fb-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(fbId).textContent = `$${formatNumberWithCommas(fbBudget)}`;
  });

  document.getElementById("fb-total").textContent = `$${formatNumberWithCommas(totalFBBudget)}`;
}

function calculateEmailBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalEmailBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    let emailBudget = 0;

    if(evergreenValue < 2999) {
      emailBudget = 0;
    }
    if (evergreenValue >= 3000 && evergreenValue <= 5249) {
      emailBudget = 250;
    } else if (evergreenValue >= 5250 && evergreenValue <= 14999) {
      emailBudget = 600;
    } else if (evergreenValue >= 14999) {
      emailBudget = 1500;
    }

    totalEmailBudget += emailBudget;

    // Update the respective month cell
    const emailId = `email-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(emailId).textContent = `$${formatNumberWithCommas(emailBudget)}`;
  });

  document.getElementById("email-total").textContent = `$${formatNumberWithCommas(totalEmailBudget)}`;
}


function calculateContentBundleBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalContentBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    let contentBudget = 0;

    if (evergreenValue >= 5250) {
      contentBudget = 200;
    }

    totalContentBudget += contentBudget;

    const contentId = `content-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(contentId).textContent = `$${formatNumberWithCommas(contentBudget)}`;
  });

  document.getElementById("content-total").textContent = `$${formatNumberWithCommas(totalContentBudget)}`;
}


function calculateSEOBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalSEOBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    let seoBudget = 0;

    if (evergreenValue >= 21000 && evergreenValue <= 49999) {
      seoBudget = 3000;
    } else if (evergreenValue >= 50000) {
      seoBudget = 5000;
    }

    totalSEOBudget += seoBudget;

    const seoId = `seo-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(seoId).textContent = `$${formatNumberWithCommas(seoBudget)}`;
  });

  document.getElementById("seo-total").textContent = `$${formatNumberWithCommas(totalSEOBudget)}`;
}

function calculateYouTubeBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalYouTubeBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    const emailValue = parseNumber(document.getElementById(`email-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const contentValue = parseNumber(document.getElementById(`content-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const seoValue = parseNumber(document.getElementById(`seo-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    let ytBudget = 0;

    if (evergreenValue < 5250) {
      ytBudget = 0;
    } else if (evergreenValue >= 5250 && evergreenValue <= 14999) {
      ytBudget = 0.1 * (evergreenValue - (emailValue + contentValue));
    
    } 
    
    else if (evergreenValue >= 15000 && evergreenValue <= 20999) {
      ytBudget = 0.15 * (evergreenValue - (emailValue + contentValue));
    }
    else if (evergreenValue >= 21000 && evergreenValue <= 49999) {
      ytBudget = 0.1 * (evergreenValue - (emailValue + contentValue + seoValue));
    }
    
    else {
      ytBudget = 0.2 * (evergreenValue - (seoValue + emailValue + contentValue));
    }

    totalYouTubeBudget += ytBudget;

    const ytId = `youtube-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(ytId).textContent = `$${formatNumberWithCommas(ytBudget)}`;
  });

  document.getElementById("youtube-total").textContent = `$${formatNumberWithCommas(totalYouTubeBudget)}`;
}

function calculateOTTBudget() {
  const monthlyIds = [
    "evergreen-jan", "evergreen-feb", "evergreen-mar", "evergreen-apr",
    "evergreen-may", "evergreen-jun", "evergreen-jul", "evergreen-aug",
    "evergreen-sep", "evergreen-oct", "evergreen-nov", "evergreen-dec"
  ];

  let totalOTTBudget = 0;

  monthlyIds.forEach((id, index) => {
    const evergreenValue = parseNumber(document.getElementById(id).textContent);
    const emailValue = parseNumber(document.getElementById(`email-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const contentValue = parseNumber(document.getElementById(`content-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);
    const seoValue = parseNumber(document.getElementById(`seo-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`).textContent);

    let ottBudget = 0;

    if (evergreenValue < 21000) {
      ottBudget = 0;
    } else {
      ottBudget = 0.1 * (evergreenValue - (emailValue + contentValue + seoValue));
    }

    totalOTTBudget += ottBudget;

    const ottId = `ott-${["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][index]}`;
    document.getElementById(ottId).textContent = `$${formatNumberWithCommas(ottBudget)}`;
  });

  document.getElementById("ott-total").textContent = `$${formatNumberWithCommas(totalOTTBudget)}`;
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
  const services = ["email", "content", "seo", "google", "fb", "youtube", "ott"];
  const evergreenValue = parseNumber(document.getElementById("evergreen-total").textContent);

  services.forEach(service => {
    const serviceValue = parseNumber(document.getElementById(`${service}-total`).textContent);
    let percentage = evergreenValue > 0 ? (serviceValue / evergreenValue) * 100 : 0;
    document.getElementById(`${service}-percentage`).textContent = `${percentage.toFixed(2)}%`;
  });
}

// Integrate E-Mail/Blog/Social Calculation into Existing Workflow
updateMonthlyBudget = (function (originalFunction) {
  return function () {
    originalFunction();
    calculateEvergreenBudget();
    calculateEmailBudget();
    calculateContentBundleBudget();
    calculateSEOBudget();
    calculateGoogleBudget();
    calculateFBBudget();
    calculateYouTubeBudget()
    calculateOTTBudget();
    calculateBudgetPercentages();
    calculatePromoBudget();
  };
})(updateMonthlyBudget);


document
  .getElementById("retailRevenue")
  .addEventListener("blur", () => formatInputField("retailRevenue"));
document
  .getElementById("categoryRevenue1")
  .addEventListener("blur", () => formatInputField("categoryRevenue1"));
document
  .getElementById("categoryRevenue2")
  .addEventListener("blur", () => formatInputField("categoryRevenue2"));
document
  .getElementById("mrktgRevenue1")
  .addEventListener("blur", () => formatInputField("mrktgRevenue1"));
document
  .getElementById("mrktgRevenue2")
  .addEventListener("blur", () => formatInputField("mrktgRevenue2"));
document
  .getElementById("actAnnualBudget")
  .addEventListener("blur", () => formatInputField("actAnnualBudget"));
