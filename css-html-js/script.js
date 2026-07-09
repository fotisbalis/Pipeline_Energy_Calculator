const form = document.getElementById("calculator-form");
const clearButton = document.getElementById("clear-button");
const errorMessage = document.getElementById("error-message");

const fields = {
  diameter: document.getElementById("diameter"),
  flowRate: document.getElementById("flowRate"),
  flowUnit: document.getElementById("flowUnit"),
  roughness: document.getElementById("roughness"),
  gravity: document.getElementById("gravity"),
  viscosity: document.getElementById("viscosity"),
  length: document.getElementById("length")
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

function colebrookWhite(reynolds, diameter, roughness) {
  let friction = 0.02;

  while (true) {
    const nextFriction = (
      1 /
      (-2 *
        Math.log10(
          roughness / (3.7 * diameter) +
          2.51 / (reynolds * Math.sqrt(friction))
        ))
    ) ** 2;

    if (Math.abs(friction - nextFriction) < 1e-8) {
      break;
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
  fields.length.value = "";
  fields.flowUnit.value = "m3h";
  clearError();
  setResultsToPlaceholder();
}

function getPositiveNumber(field) {
  const value = Number(field.value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function calculate(event) {
  event.preventDefault();
  clearError();

  const diameterMillimeters = getPositiveNumber(fields.diameter);
  const flowRateInput = getPositiveNumber(fields.flowRate);
  const roughnessMillimeters = getPositiveNumber(fields.roughness);
  const gravity = getPositiveNumber(fields.gravity);
  const viscosityInput = getPositiveNumber(fields.viscosity);
  const length = getPositiveNumber(fields.length);

  if (
    diameterMillimeters === null ||
    flowRateInput === null ||
    roughnessMillimeters === null ||
    gravity === null ||
    viscosityInput === null ||
    length === null
  ) {
    showError("Expecting positive numeric values.");
    setResultsToPlaceholder();
    return;
  }

  const diameter = diameterMillimeters * 1e-3;
  const roughness = roughnessMillimeters * 1e-3;
  const viscosity = viscosityInput * 1e-8;
  const flowRate = fields.flowUnit.value === "m3h"
    ? flowRateInput / 3600
    : flowRateInput / 1000;

  const velocity = (4 * flowRate) / (Math.PI * diameter ** 2);
  const reynolds = velocity * (diameter / viscosity);
  const frictionColebrook = colebrookWhite(reynolds, diameter, roughness);
  const frictionSwamee = swameeJain(reynolds, diameter, roughness);
  const gradientColebrook = (frictionColebrook * velocity ** 2) / (diameter * 2 * gravity);
  const gradientSwamee = (frictionSwamee * velocity ** 2) / (diameter * 2 * gravity);
  const headColebrook = gradientColebrook * length;
  const headSwamee = gradientSwamee * length;

  results.velocity.textContent = `${velocity.toFixed(2)} m/s`;
  results.reynolds.textContent = reynolds.toFixed(0);
  results.frictionColebrook.textContent = frictionColebrook.toFixed(4);
  results.gradientColebrook.textContent = gradientColebrook.toFixed(4);
  results.headColebrook.textContent = headColebrook.toFixed(4);
  results.frictionSwamee.textContent = frictionSwamee.toFixed(4);
  results.gradientSwamee.textContent = gradientSwamee.toFixed(4);
  results.headSwamee.textContent = headSwamee.toFixed(4);
}

form.addEventListener("submit", calculate);
clearButton.addEventListener("click", resetForm);

resetForm();
