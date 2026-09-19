import type { MortgageConcept } from './mortgage_concepts.ts';

export type AtlasLens = 'mortgage' | 'rates' | 'fixed_income';

export const atlas_lenses = [
  { id: 'mortgage', title: 'Mortgage', description: 'Borrowers, pools, structures and the rates that shape their cash flows.', paths: ['rmbs_label_decoder', 'cre_workout_to_tranche', 'rates_to_mortgages', 'headline_to_evidence'] },
  { id: 'rates', title: 'Rates', description: 'Curves, instruments and conventions, connected back to mortgage risk.', paths: ['rates_to_mortgages', 'curve_to_hedge', 'floating_rate_clock'] },
  { id: 'fixed_income', title: 'All fixed income', description: 'The complete atlas, centered on mortgages and their connections to other debt.', paths: ['headline_to_evidence', 'curve_to_hedge', 'rmbs_label_decoder', 'cre_workout_to_tranche'] },
] as const;

const broader_products = new Set(['sovereign', 'corporate', 'municipal', 'covered_bonds', 'auto_abs', 'card_abs', 'student_abs', 'clo']);
const rates_branches = new Set(['curves', 'risk', 'currencies']);
const rates_shared = new Set([
  'cash_flows', 'pv', 'discount_factor', 'yield', 'reinvestment', 'price', 'accrual', 'day_count', 'price_32nds',
  'as_of', 'trade_date', 'original_maturity', 'quote_context', 'payment_delay', 'final_maturity', 'scenario_analysis',
  'reset_payment_dates', 'observation_conventions', 'sovereign', 'floater', 'zero_coupon', 'inflation_linked', 'callable',
  'repo', 'haircut', 'margin_call', 'liquidity', 'settlement', 'treasury_delivery', 'repo_specialness',
  'total_return', 'carry', 'roll_down', 'real_return', 'current_coupon', 'primary_secondary_spread',
]);

export function concept_in_lens(concept: MortgageConcept, lens: AtlasLens): boolean {
  if (lens === 'fixed_income') return true;
  if (lens === 'rates') return rates_branches.has(concept.branch) || rates_shared.has(concept.id);
  return !broader_products.has(concept.id) && (concept.branch !== 'currencies' || ['usd_rates', 'term_overnight', 'currency_denomination'].includes(concept.id));
}

export function lens_definition(lens: AtlasLens) {
  return atlas_lenses.find(item => item.id === lens)!;
}
