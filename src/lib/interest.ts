// Standard Indian bank deposit maturity formulas (quarterly compounding).

export function calcFDMaturity(principal: number, annualRatePercent: number, tenureMonths: number): number {
  const quarters = tenureMonths / 3;
  const quarterlyRate = annualRatePercent / 400;
  return principal * Math.pow(1 + quarterlyRate, quarters);
}

export function calcRDMaturity(monthlyInstallment: number, annualRatePercent: number, tenureMonths: number): number {
  const quarters = tenureMonths / 3;
  const i = annualRatePercent / 400;
  return (
    monthlyInstallment *
    ((Math.pow(1 + i, quarters) - 1) / (1 - Math.pow(1 + i, -1 / 3)))
  );
}

export function calcEmi(principal: number, annualRatePercent: number, tenureMonths: number): number {
  const monthlyRate = annualRatePercent / 1200;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
