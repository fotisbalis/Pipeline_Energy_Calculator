const form = document.getElementById("calculator-form");
const clearButton = document.getElementById("clear-button");
const errorMessage = document.getElementById("error-message");

const fields = {
  diameter: document.getElementById("diameter"),
  diameterUnit: document.getElementById("diameterUnit"),
  flowRate: document.getElementById("flowRate"),
  flowUnit: document.getElementById("flowUnit"),
  roughness: document.getElementById("roughness"),
  roughnessUnit: document.getElementById("roughnessUnit"),
  gravity: document.getElementById("gravity"),
  gravityUnit: document.getElementById("gravityUnit"),
  viscosity: document.getElementById("viscosity"),
  viscosityUnit: document.getElementById("viscosityUnit"),
  length: document.getElementById("length"),
  lengthUnit: document.getElementById("lengthUnit")
};

const outputUnits = {
  velocity: document.getElementById("velocityUnit"),
  gradient: document.getElementById("gradientUnit"),
  head: document.getElementById("headUnit")
};

const results = {
  velocity: document.getElementById("result-velocity"),
  reynolds: document.getElementById("result-reynolds"),
  frictionColebrook: document.getElementById("result-f-cw"),
  gradientColebrook: document.getElementById("result-j-cw"),
  headColebrook: document.getElementById("result-hf-cw"),
  frictionSwamee: document.getElementById("result-f-sj"),
  gradientSwamee: document.getElementById("result-j-sj"),
  headSwamee: document.getElementById("result-hf-sj")
};

// Each factor converts one displayed unit to the SI base unit used by the formulas.
const unitFactors = {
  length: {
    um: 1e-6,
    mm: 1e-3,
    cm: 1e-2,
    m: 1,
    km: 1e3,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mil: 0.0000254
  },
  flow: {
    m3s: 1,
    m3h: 1 / 3600,
    ls: 1e-3,
    lmin: 1e-3 / 60,
    lh: 1e-3 / 3600,
    usgpm: 0.003785411784 / 60,
    usgpd: 0.003785411784 / 86400,
    ukgpm: 0.00454609 / 60,
    cfs: 0.028316846592,
    cfm: 0.028316846592 / 60,
    mld: 1000 / 86400
  },
  gravity: {
    ms2: 1,
    fts2: 0.3048,
    cms2: 0.01,
    ins2: 0.0254,
    g0: 9.80665
  },
  viscosity: {
    m2s: 1,
    mm2s: 1e-6,
    cm2s: 1e-4,
    ft2s: 0.09290304,
    in2s: 0.00064516
  },
  velocity: {
    ms: 1,
    kmh: 1 / 3.6,
    fts: 0.3048,
    mph: 0.44704,
    kn: 0.5144444444,
    cms: 0.01
  }
};

const gradientScales = {
  mm: 1,
  mkm: 1000,
  mmm: 1000,
  ftft: 1,
  ft100ft: 100,
  percent: 100,
  permille: 1000
};

let lastCalculation = null;

function colebrookWhite(reynolds, diameter, roughness) {
  let friction = 0.02;

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const nextFriction = (
      1 /
      (-2 *
        Math.log10(
          roughness / (3.7 * diameter) +
          2.51 / (reynolds * Math.sqrt(friction))
        ))
    ) ** 2;

    if (Math.abs(friction - nextFriction) < 1e-8) {
      return nextFriction;
    }

    friction = nextFriction;
  }

  return friction;
}

function swameeJain(reynolds, diameter, roughness) {
  const x = roughness / (3.7 * diameter);
  const y = 5.74 / reynolds ** 0.9;
  return 0.25 / Math.log10(x + y) ** 2;
}

function setResultsToPlaceholder() {
  lastCalculation = null;
  Object.values(results).forEach((node) => {
    node.textContent = "-";
  });
}

function clearError() {
  errorMessage.textContent = "";
}

function showError(message) {
  errorMessage.textContent = message;
}

function resetForm() {
  fields.diameter.value = "";
  fields.flowRate.value = "";
  fields.roughness.value = "";
  fields.gravity.value = "9.81";
  fields.viscosity.value = "1.15";
  fields.length.value = "1";
  fields.diameterUnit.value = "mm";
  fields.flowUnit.value = "m3h";
  fields.roughnessUnit.value = "mm";
  fields.gravityUnit.value = "ms2";
  fields.viscosityUnit.value = "mm2s";
  fields.lengthUnit.value = "m";
  outputUnits.velocity.value = "ms";
  outputUnits.gradient.value = "mm";
  outputUnits.head.value = "m";
  initializePreviousUnits();
  clearError();
  setResultsToPlaceholder();
}

function getPositiveNumber(field) {
  const value = Number(field.value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function toBase(value, unit, group) {
  return value * unitFactors[group][unit];
}

function fromBase(value, unit, group) {
  return value / unitFactors[group][unit];
}

function formatConvertedInput(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude >= 1e9 || magnitude < 1e-6)) {
    return value.toExponential(8).replace(/\.?0+e/, "e");
  }

  return Number(value.toPrecision(10)).toString();
}

function formatResult(value, maximumFractionDigits = 4) {
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude >= 1e7 || magnitude < 1e-4)) {
    return value.toExponential(4);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0
  }).format(value);
}

function selectedUnitLabel(select) {
  return select.selectedOptions[0].textContent;
}

function initializePreviousUnits() {
  [
    fields.diameterUnit,
    fields.flowUnit,
    fields.roughnessUnit,
    fields.gravityUnit,
    fields.viscosityUnit,
    fields.lengthUnit
  ].forEach((select) => {
    select.dataset.previousUnit = select.value;
  });
}

function convertInputOnUnitChange(input, select, group) {
  const previousUnit = select.dataset.previousUnit || select.value;
  const numericValue = Number(input.value);

  if (input.value !== "" && Number.isFinite(numericValue)) {
    const baseValue = toBase(numericValue, previousUnit, group);
    input.value = formatConvertedInput(fromBase(baseValue, select.value, group));
  }

  select.dataset.previousUnit = select.value;
}

function renderResults() {
  if (!lastCalculation) {
    return;
  }

  const velocity = fromBase(
    lastCalculation.velocity,
    outputUnits.velocity.value,
    "velocity"
  );
  const gradientScale = gradientScales[outputUnits.gradient.value];
  const headColebrook = fromBase(
    lastCalculation.headColebrook,
    outputUnits.head.value,
    "length"
  );
  const headSwamee = fromBase(
    lastCalculation.headSwamee,
    outputUnits.head.value,
    "length"
  );
  const velocityLabel = selectedUnitLabel(outputUnits.velocity);
  const gradientLabel = selectedUnitLabel(outputUnits.gradient);
  const headLabel = selectedUnitLabel(outputUnits.head);

  results.velocity.textContent = formatResult(velocity) + " " + velocityLabel;
  results.reynolds.textContent = formatResult(lastCalculation.reynolds, 0);
  results.frictionColebrook.textContent = formatResult(
    lastCalculation.frictionColebrook,
    5
  );
  results.gradientColebrook.textContent =
    formatResult(lastCalculation.gradientColebrook * gradientScale, 6) +
    " " +
    gradientLabel;
  results.headColebrook.textContent =
    formatResult(headColebrook, 6) + " " + headLabel;
  results.frictionSwamee.textContent = formatResult(
    lastCalculation.frictionSwamee,
    5
  );
  results.gradientSwamee.textContent =
    formatResult(lastCalculation.gradientSwamee * gradientScale, 6) +
    " " +
    gradientLabel;
  results.headSwamee.textContent =
    formatResult(headSwamee, 6) + " " + headLabel;
}

function calculate(event) {
  event.preventDefault();
  clearError();

  const diameterInput = getPositiveNumber(fields.diameter);
  const flowRateInput = getPositiveNumber(fields.flowRate);
  const roughnessInput = getPositiveNumber(fields.roughness);
  const gravityInput = getPositiveNumber(fields.gravity);
  const viscosityInput = getPositiveNumber(fields.viscosity);
  const lengthInput = getPositiveNumber(fields.length);

  if (
    diameterInput === null ||
    flowRateInput === null ||
    roughnessInput === null ||
    gravityInput === null ||
    viscosityInput === null ||
    lengthInput === null
  ) {
    showError("Expecting positive numeric values.");
    setResultsToPlaceholder();
    return;
  }

  const diameter = toBase(diameterInput, fields.diameterUnit.value, "length");
  const flowRate = toBase(flowRateInput, fields.flowUnit.value, "flow");
  const roughness = toBase(roughnessInput, fields.roughnessUnit.value, "length");
  const gravity = toBase(gravityInput, fields.gravityUnit.value, "gravity");
  const viscosity = toBase(viscosityInput, fields.viscosityUnit.value, "viscosity");
  const length = toBase(lengthInput, fields.lengthUnit.value, "length");

  const velocity = (4 * flowRate) / (Math.PI * diameter ** 2);
  const reynolds = velocity * (diameter / viscosity);
  const frictionColebrook = colebrookWhite(reynolds, diameter, roughness);
  const frictionSwamee = swameeJain(reynolds, diameter, roughness);
  const gradientColebrook = (frictionColebrook * velocity ** 2) / (diameter * 2 * gravity);
  const gradientSwamee = (frictionSwamee * velocity ** 2) / (diameter * 2 * gravity);
  const headColebrook = gradientColebrook * length;
  const headSwamee = gradientSwamee * length;

  lastCalculation = {
    velocity,
    reynolds,
    frictionColebrook,
    gradientColebrook,
    headColebrook,
    frictionSwamee,
    gradientSwamee,
    headSwamee
  };

  renderResults();
}

form.addEventListener("submit", calculate);
clearButton.addEventListener("click", resetForm);

[
  [fields.diameter, fields.diameterUnit, "length"],
  [fields.flowRate, fields.flowUnit, "flow"],
  [fields.roughness, fields.roughnessUnit, "length"],
  [fields.gravity, fields.gravityUnit, "gravity"],
  [fields.viscosity, fields.viscosityUnit, "viscosity"],
  [fields.length, fields.lengthUnit, "length"]
].forEach(([input, select, group]) => {
  select.addEventListener("change", () => {
    convertInputOnUnitChange(input, select, group);
  });
});

Object.values(outputUnits).forEach((select) => {
  select.addEventListener("change", renderResults);
});

resetForm();
