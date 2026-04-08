# REDOXY Pricing Guide

## Core formula

`Final offer USD/MT = Benchmark USD/MT + Dubai differential + broker premium + freight + density adjustment + margin`

## Example

- Brent = `85.00 USD/bbl`
- Conversion factor = `7.33`
- Brent in USD/MT = `85.00 x 7.33 = 623.05`
- Dubai differential = `-4.00`
- Broker premium = `18.00`
- Freight = `42.00`
- Density adjustment = `6.00`
- Margin = `25.00`

Final offer:

`623.05 - 4.00 + 18.00 + 42.00 + 6.00 + 25.00 = 710.05 USD/MT`

Implied USD/bbl:

`710.05 / 7.33 = 96.87 USD/bbl`

## REDOXY product examples

- Light Oil = `Benchmark USD/MT x 0.75 + freight + margin`
- LWO = `Benchmark USD/MT x 0.959 + freight + margin`

## Proxy derivation logic

### Diesel = Gas Oil + diesel premium

- Use when live diesel is unavailable but gas oil is live.
- The premium reflects sulfur/spec differences, promptness, and regional logistics.
- Working desk ranges:
  - UAE: `+15 to +30 USD/MT`
  - KSA: `+20 to +35 USD/MT`

### Kerosene = Heating Oil + kerosene differential

- Use heating oil as the nearest live middle-distillate proxy.
- The differential reflects jet/kerosene quality and local physical demand.
- Working desk ranges:
  - UAE: `0 to +10 USD/MT`
  - KSA: `+5 to +15 USD/MT`

### Naphtha = Brent x naphtha factor

- Use when no direct naphtha benchmark is available.
- The factor represents the normal relationship between crude and light-end petrochemical feedstock value.
- Working desk factors:
  - UAE: `0.83 to 0.86`
  - KSA: `0.80 to 0.84`

### Recovery Oil (Black) = Brent x discount factor

- Use as an indicative recovery-oil realization model.
- The discount reflects contamination, handling cost, lower refinery flexibility, and buyer appetite.
- Working desk factors:
  - UAE: `0.60 to 0.65`
  - KSA: `0.55 to 0.62`

## Why UAE and KSA differ

- UAE assumptions are usually tighter around Fujairah and export-linked prompt flows.
- KSA assumptions are often slightly wider due to inland transfer, local allocation, and export routing differences.
- These are internal desk assumptions, not official Platts assessments.

## Notes

- Brent is the main benchmark for seaborne crude.
- DBLc1 is a Dubai-linked futures proxy, not the licensed Platts physical assessment.
- Diesel, gas oil, kerosene, naphtha, and recovery oil proxies should be treated as indicative when direct market feeds are unavailable.
