# Pipe Flow Calculator

A lightweight calculator for estimating flow conditions and friction losses in a circular pipe. It calculates velocity, Reynolds number, Darcy friction factor, hydraulic gradient, and head loss using both the Colebrook-White and Swamee-Jain methods.

The project includes a responsive browser version and a simple Python/Tkinter desktop version.

## Features

- Calculates velocity and Reynolds number from pipe diameter and flow rate
- Compares Colebrook-White (iterative) and Swamee-Jain (explicit) friction factors
- Reports hydraulic gradient and total head loss
- Supports common input and output units in the web app
- Validates that all inputs are positive numeric values

## Use the web calculator

No installation or build step is required.

1. Open `css-html-js/index.html` in a modern web browser.
2. Enter the pipe diameter, flow rate, roughness, gravity, kinematic viscosity, and pipe length.
3. Select **Calculate** to view the results. Change the result-unit selectors at any time to convert the displayed values.

The static site is configured for deployment to GitHub Pages through `.github/workflows/static.yml`.

## Run the desktop calculator

The desktop version requires Python 3 with Tkinter (included with most standard Python installations).

```bash
python python/energy_deprivation.py
```

## Calculation basis

All calculations are performed in SI base units:

- Velocity: `V = 4Q / (πD²)`
- Reynolds number: `Re = VD / ν`
- Hydraulic gradient: `J = fV² / (2gD)`
- Head loss: `hf = JL`

Here, `Q` is volumetric flow rate, `D` is pipe diameter, `ν` is kinematic viscosity, `f` is the Darcy friction factor, `g` is gravitational acceleration, and `L` is pipe length.

## Project structure

```text
css-html-js/              Static web calculator
  index.html              Interface markup
  script.js               Calculations and unit conversion
  styles.css              Responsive styling
python/
  energy_deprivation.py   Tkinter desktop calculator
.github/workflows/
  static.yml              GitHub Pages deployment workflow
```

## Notes

The calculator estimates friction losses for fully developed pipe flow. Confirm that the assumptions and input data are appropriate for your engineering use case before relying on the results for design decisions.
