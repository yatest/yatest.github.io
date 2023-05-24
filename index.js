// TODO: convert to React
// TODO: automatically fit to phone size
// TODO: remove highlight on button after press on mobile
// TODO: add user settings

const display = document.querySelector('.display');
const calculatorButtons = document.querySelector('.calculatorControls').children;
const settingsButtons = document.querySelector('.settingsControls').children;
const containsOnlyInteger = /^[0-9]+$/;
const containsOnlySingleDecimal= /^(?:0|[1-9]|[1-9]\d+|)?(?:\.?\d{0,1})?$/;

let healthPen = 1.0;

for (let button of calculatorButtons) {
    button.addEventListener('click', () => {
        const { innerText: btnValue } = button;

        if (btnValue === 'Calculate') calculate();
    })
}

// calculate total number of units needed
const calculate = () => {
    let carbs = document.getElementById("carbs");
    let bG = document.getElementById("bG");
    // carbs per unit should be saved locally in settings and loaded here (can be time dependent)
    let carbToUnit = 10;
    // target bG should be saved locally in settings and loaded here (can be time dependent)
    let bGTarget = 6.0;
    // correction unit per mmol/L should be saved locally in settings and loaded here (can be time dependent)
    let corrToUnit = 2.0;

    if (containsOnlyInteger.test(carbs.value) && containsOnlySingleDecimal.test(bG.value)) {
        carbsFloat = parseFloat(carbs.value);
        bGFloat = parseFloat(bG.value);

        let carbValue = carbsFloat / carbToUnit;
        let bGValue = (bGFloat - bGTarget) / corrToUnit;
        result = (carbValue + bGValue) * healthPen;
        result = result.toFixed(1);
        
        if (result < 0.1) {
            result = '0.0';
        }

        let activeInsulin = 0.0;
        // ensure bolusHistory is updated before calculating IOB
        update();
        if (localStorage.getItem("bolusHistory") !== null) {
            let iobResult = iobTotal();
            activeInsulin = iobResult.iob;
        } 

        string1 = "Carbs = ";
        string2 = "bG = ";
        string3 = "Health multiplier = ";
        string4 = "Active insulin = ";

        let bolusAmount = document.getElementById("bolusAmount");
        let bolusText = document.getElementById("bolusText");
        let bolusUnits = document.getElementById("bolusUnits");
        bolusText.innerText = string1;
        bolusAmount.innerText = carbValue;
        bolusAmount.style.color = 'green';
        bolusUnits.innerText = ' units';

        let bGAmount = document.getElementById("bGAmount");
        let bGText = document.getElementById("bGText");
        let bGUnits = document.getElementById("bGUnits");
        bGText.innerText = string2;
        bGAmount.innerText = parseFloat(bGValue).toFixed(1);
        bGAmount.style.color = 'green';
        bGUnits.innerText = ' units';

        let healthAmount = document.getElementById("healthAmount");
        let healthText = document.getElementById("healthText");
        healthText.innerText = string3;
        healthAmount.innerText = healthPen;
        healthAmount.style.color = 'yellow';

        let activeInsulinAmount = document.getElementById("activeInsulinAmount");
        let activeInsulinText = document.getElementById("activeInsulinText");
        let activeInsulinUnits = document.getElementById("activeInsulinUnits");
        activeInsulinText.innerText = string4;
        activeInsulinAmount.innerText = parseFloat(activeInsulin).toFixed(1);
        activeInsulinAmount.style.color = 'red';
        activeInsulinUnits.innerText = ' units';

        finalBolus = result - activeInsulin;
        if (finalBolus < 0.1) {
            finalBolus = '0.0';
        }

        document.getElementById("bolusBtn").value = parseFloat(finalBolus).toFixed(0);
        // document.getElementById("insulinBolusUnits").innerText = " units";
        // document.getElementById("insulinBolusUnits").style.color = 'white';
    } else {
        carbs.value = '';
        bG.value = '';
    }

}

// calculator and settings tabs
const calculator = document.getElementById("calculator");
const settings = document.getElementById("settings");
const calculatorBtn = document.getElementById("calculatorBtn");
const settingsBtn = document.getElementById("settingsBtn");

function openCalculator() {
    calculator.style.transform = "translateX(0px)";
    settings.style.transform = "translateX(100%)";
    calculatorBtn.style.color = "#ff7846";
    settingsBtn.style.color = "#fff";
}

function openSettings() {
    calculator.style.transform = "translateX(-100%)";
    settings.style.transform = "translateX(0px)";
    calculatorBtn.style.color = "#fff";
    settingsBtn.style.color = "#ff7846";
}

// health bolus modifier
function showHealth(item) {
    document.getElementById("health").innerHTML = item.innerHTML;
    switch (item.innerHTML) {
        // change fractions to real health penalties
        case "No Entry":
            healthPen = 1;
            break;
        case "Fasting":
            healthPen = 0.9;
            break;
        case "Exercise":
            healthPen = 0.8;
            break;
        case "Stress":
            healthPen = 0.9;
            break;
        case "Illness":
            healthPen = 0.9;
            break;
        default:
            healthPen = 1;
    }
}

function saveBolus() {
    let newBolus = document.getElementById("bolusBtn").value;
    if (newBolus > 0) {
        if (localStorage.getItem("bolusHistory") === null) {
            update();
            let time = new Date().getTime();
            let bolusHistory = { [time]: newBolus };
            localStorage.setItem("bolusHistory", JSON.stringify(bolusHistory));
        } else {
            update();
            let bolusHistory = JSON.parse(localStorage.getItem("bolusHistory"));
            let time = new Date().getTime();
            bolusHistory = Object.assign({ [time]: newBolus }, bolusHistory);
            localStorage.setItem("bolusHistory", JSON.stringify(bolusHistory));
        }
    }
    // after saving, reset screen
    resetScreen();
}

function resetScreen() {
    let carbs = document.getElementById("carbs");
    let bG = document.getElementById("bG");

    carbs.value = '';
    bG.value = '';
    document.getElementById("health").innerHTML = 'Health';
    healthPen = 1;

    let bolusAmount = document.getElementById("bolusAmount");
    let bolusText = document.getElementById("bolusText");
    let bolusUnits = document.getElementById("bolusUnits");
    bolusText.innerText = '';
    bolusAmount.innerText = '';
    bolusUnits.innerText = '';

    let bGAmount = document.getElementById("bGAmount");
    let bGText = document.getElementById("bGText");
    let bGUnits = document.getElementById("bGUnits");
    bGText.innerText = '';
    bGAmount.innerText = '';
    bGUnits.innerText = '';

    let healthAmount = document.getElementById("healthAmount");
    let healthText = document.getElementById("healthText");
    healthText.innerText = '';
    healthAmount.innerText = '';

    let activeInsulinAmount = document.getElementById("activeInsulinAmount");
    let activeInsulinText = document.getElementById("activeInsulinText");
    let activeInsulinUnits = document.getElementById("activeInsulinUnits");
    activeInsulinText.innerText = '';
    activeInsulinAmount.innerText = '';
    activeInsulinUnits.innerText = '';

    document.getElementById("bolusBtn").value = '';
}

function update() {
    // check if any entries in bolusHistory are > 5 hours ago and delete if so
    if (localStorage.getItem("bolusHistory") !== null) {
        let bolusHistory = JSON.parse(localStorage.getItem("bolusHistory"));
        let currentTime = new Date().getTime();
        for (const bolusTime in bolusHistory) {
            if (Math.round((currentTime - bolusTime) / 1000 / 60) > 300) {
                delete bolusHistory.bolusTime;
            }
        }
        localStorage.setItem("bolusHistory", JSON.stringify(bolusHistory));
    }

}

// bolus entries are properties (time: units) of an object named bolusHistory

// active insulin calculation currently uses code/formula from https://github.com/openaps/oref0/blob/master/lib/iob/calculate.js (with minor adaptations)

function iobCalc(bolusTime, insulin, curve, dia, peak) {
    // iobCalc returns two variables:
    //   activityContrib = units of insulin used in previous minute
    //   iobContrib = units of insulin still remaining at a given point in time
    // ("Contrib" is used because these are the amounts contributed from pontentially multiple insulin dosages -- totals are calculated by iobTotal)
    //
    // Variables is calculated using:
    //   An exponential insulin action curve (which takes both a dia and a peak parameter)

    let currentTime = new Date().getTime();
    let minsAgo = Math.round((currentTime - bolusTime) / 1000 / 60);


    return iobCalcExponential(minsAgo, insulin, curve, dia, peak);
}

function iobCalcExponential(minsAgo, insulin, curve, dia, peak) {

    // Use custom peak time (in minutes) if value is valid
    if ( curve === "rapid-acting" ) {
        peak = 75;
    } else if ( curve === "ultra-rapid" ) {
        peak = 55;
    } else {
        console.error('Curve of',curve,'is not supported.');
    }
    let end = dia * 60;  // end of insulin activity, in minutes


    let activityContrib = 0;  
    let iobContrib = 0;       

    if (minsAgo < end) {
        
        // Formula source: https://github.com/LoopKit/Loop/issues/388#issuecomment-317938473
        // Mapping of original source variable names to those used here:
        //   td = end
        //   tp = peak
        //   t  = minsAgo
        var tau = peak * (1 - peak / end) / (1 - 2 * peak / end);  // time constant of exponential decay
        var a = 2 * tau / end;                                     // rise time factor
        var S = 1 / (1 - a + (1 + a) * Math.exp(-end / tau));      // auxiliary scale factor
        
        activityContrib = insulin * (S / Math.pow(tau, 2)) * minsAgo * (1 - minsAgo / end) * Math.exp(-minsAgo / tau);
        iobContrib = insulin * (1 - S * (1 - a) * ((Math.pow(minsAgo, 2) / (tau * end * (1 - a)) - minsAgo / tau - 1) * Math.exp(-minsAgo / tau) + 1));
    }

    return {
        activityContrib: activityContrib,
        iobContrib: iobContrib        
    };
}

function iobTotal() {

    let bolusHistory = JSON.parse(localStorage.getItem("bolusHistory"));
    let currentTime = new Date().getTime();
    let dia = 5;
    let peak = 75;
    let iob = 0;
    let activity = 0;
    let curve = 'rapid-acting';


    for (const bolusTime in bolusHistory) {
        let dia_ago = currentTime - dia*60*60*1000;
        let insulin = bolusHistory[bolusTime];
        if( bolusTime > dia_ago ) {
            // tIOB = total IOB
            var tIOB = iobCalc(bolusTime, insulin, curve, dia, peak);
            if (tIOB && tIOB.iobContrib) { iob += tIOB.iobContrib; }
            if (tIOB && tIOB.activityContrib) { activity += tIOB.activityContrib; }
        }
    }

    return {
        iob: Math.round(iob * 1000) / 1000,
        // activity: Math.round(activity * 10000) / 10000
    };
}