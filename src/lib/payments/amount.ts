// Money lives as PLN in our data; P24 transacts in integer grosze (1/100 PLN).
// Converting through one rounding rule keeps register/verify/reconcile in sync —
// a divergent rounding at any boundary would surface as an amount mismatch and
// reject an otherwise-valid payment.
export function plnToGrosze(pln: number): number {
  return Math.round(pln * 100);
}
