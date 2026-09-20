import type { MortgageRelationship } from './mortgage_concepts.ts';

// Authored analytical links, independent of the reader's suggested next articles.
// Sources name entries in the shared public-reference registry.
type SourcedRelationship = MortgageRelationship & {
  conditions: string;
  sources: string[];
};
export const foundational_relationships: SourcedRelationship[] = [
  {
    id: 'rolls__cash_flows', source: 'rolls', target: 'cash_flows',
    kind: 'mechanism', label: 'transfers interim payment rights',
    reason: 'Selling the near leg gives up intervening principal and interest entitlement.',
    conditions: 'Compare payment timing and remaining balance, not just coupon income.',
    sources: ['tba', 'basics'],
  },
  {
    id: 'prepayments__rolls', source: 'prepayments', target: 'rolls',
    kind: 'mechanism', label: 'changes the financing comparison',
    reason: 'Expected paydowns change payments forgone and the balance retained by a cash holder.',
    conditions: 'Hold the quotation and settlement conventions consistent; principal is not profit.',
    sources: ['tba', 'basics'],
  },
  {
    id: 'rolls__cheapest_deliverable', source: 'rolls', target: 'cheapest_deliverable',
    kind: 'mechanism', label: 'reopens pool selection',
    reason: 'The later purchase permits different eligible pools with different prepayment characteristics.',
    conditions: 'Similar delivery terms do not guarantee identical collateral economics.',
    sources: ['tba'],
  },
  {
    id: 'rolls__repo', source: 'rolls', target: 'repo',
    kind: 'comparison', label: 'compares funding and payment rights',
    reason: 'Repo financing preserves the collateral seller’s economic payment entitlement; a dollar roll transfers the intervening payments.',
    conditions: 'Contract terms govern income processing and collateral substitution. These are not identical trades.',
    sources: ['tba', 'repo_public'],
  },
  {
    id: 'fixed_arm__principal_interest',
    source: 'fixed_arm',
    target: 'principal_interest',
    kind: 'mechanism',
    label: 'sets interest accrual',
    reason:
      'The contractual note rate determines interest on the outstanding loan balance.',
    conditions:
      'ARM reset dates, caps, floors and introductory terms can constrain the rate actually charged.',
    sources: ['arm'],
  },
  {
    id: 'pool_averages__wac',
    source: 'pool_averages',
    target: 'wac',
    kind: 'measurement',
    label: 'summarizes loan coupons',
    reason:
      'WAC condenses a pool’s loan coupons into a balance-weighted measure; it does not describe every loan.',
    conditions:
      'Use the balance weights and reporting date specified by the disclosure.',
    sources: ['disclosure', 'glossary'],
  },
  {
    id: 'pool_averages__prepayments',
    source: 'pool_averages',
    target: 'prepayments',
    kind: 'mechanism',
    label: 'composition affects payoffs',
    reason:
      'Loan ages, balances and borrower characteristics can produce different payoff behavior in pools with the same average coupon.',
    conditions:
      'Pool averages alone do not identify the distribution of refinancing ability or incentives.',
    sources: ['mbs_runoff_public'],
  },
  {
    id: 'cash_flows__pass_through',
    source: 'cash_flows',
    target: 'pass_through',
    kind: 'definition',
    label: 'feeds investor distributions',
    reason:
      'A pass-through distributes mortgage principal and interest under its security terms, after applicable fees.',
    conditions:
      'Payment delays and guarantees affect what investors receive and when.',
    sources: ['basics'],
  },
  {
    id: 'pass_through__cmo',
    source: 'pass_through',
    target: 'cmo',
    kind: 'definition',
    label: 'can supply collateral',
    reason:
      'A CMO can use pass-through MBS as collateral and redistribute their payments among classes.',
    conditions:
      'The transaction can also hold mortgage loans; its documents specify the collateral and payment rules.',
    sources: ['basics', 'remic'],
  },
  {
    id: 'cmo__waterfall',
    source: 'cmo',
    target: 'waterfall',
    kind: 'definition',
    label: 'specifies class allocation',
    reason:
      'A CMO’s waterfall sets how available cash is allocated among its classes.',
    conditions:
      'The CMO label alone does not establish which class repays first.',
    sources: ['structure'],
  },
  {
    id: 'cmo__remic',
    source: 'cmo',
    target: 'remic',
    kind: 'comparison',
    label: 'structure versus tax status',
    reason:
      'CMO describes a multiclass mortgage security; REMIC describes a qualifying tax framework often used to issue it.',
    conditions:
      'REMIC qualification does not specify the economic payment priority of a class.',
    sources: ['irs', 'remic'],
  },
  {
    id: 'cash_flows__io_po',
    source: 'cash_flows',
    target: 'io_po',
    kind: 'definition',
    label: 'separates payment rights',
    reason:
      'IO and PO interests assign interest and principal components to separate claims.',
    conditions:
      'Some structures split only portions of those components; consult the class terms.',
    sources: ['smbs'],
  },
  {
    id: 'prepayments__io_po',
    source: 'prepayments',
    target: 'io_po',
    kind: 'mechanism',
    label: 'changes income and timing',
    reason:
      'Faster paydowns reduce the balance generating future IO income and return PO principal sooner.',
    conditions:
      'This describes cash-flow effects. Price changes also depend on discount rates and class terms.',
    sources: ['smbs'],
  },
  {
    id: 'amortization__balloon',
    source: 'amortization',
    target: 'balloon',
    kind: 'mechanism',
    label: 'can leave a final balance',
    reason:
      'If the contractual loan term ends before scheduled amortization repays the balance, the remainder is due as a balloon.',
    conditions:
      'A longer amortization schedule does not extend the legal loan term.',
    sources: ['cre'],
  },
  {
    id: 'balloon__refinance_risk',
    source: 'balloon',
    target: 'refinance_risk',
    kind: 'mechanism',
    label: 'creates a maturity need',
    reason:
      'A borrower relying on new financing to repay a balloon is exposed to the availability and terms of that financing.',
    conditions:
      'Asset sales or other cash may instead fund repayment; refinancing is not assured.',
    sources: ['cre'],
  },
  {
    id: 'curtailment__prepayments',
    source: 'curtailment',
    target: 'prepayments',
    kind: 'definition',
    label: 'a partial early repayment',
    reason:
      'A curtailment returns extra principal without paying off the whole mortgage.',
    conditions: 'Distinguish it from scheduled amortization and a full payoff.',
    sources: ['cfpb', 'mbs_runoff_public'],
  },
  {
    id: 'curtailment__pool_factor',
    source: 'curtailment',
    target: 'pool_factor',
    kind: 'mechanism',
    label: 'reduces remaining face',
    reason:
      'Additional principal returned from pool loans reduces the balance represented by the pool factor.',
    conditions:
      'Use the factor’s reporting period and original principal denominator.',
    sources: ['basics'],
  },
  {
    id: 'ginnie__agency',
    source: 'ginnie',
    target: 'agency',
    kind: 'comparison',
    label: 'distinguishes legal backing',
    reason:
      'Ginnie Mae’s guarantee carries U.S. full faith and credit; the backing of other agency programs must be identified separately.',
    conditions:
      'Payment backing does not fix the market price or prevent early principal return.',
    sources: ['ginnie', 'basics'],
  },
  {
    id: 'settlement__accrual',
    source: 'settlement',
    target: 'accrual',
    kind: 'measurement',
    label: 'anchors accrued interest',
    reason:
      'Settlement anchors the timing used to calculate accrued interest and the investor’s subsequent cash flows.',
    conditions:
      'Apply the security’s day-count, payment-delay and settlement conventions.',
    sources: ['formulas', 'tba'],
  },
  {
    id: 'final_maturity__wal',
    source: 'final_maturity',
    target: 'wal',
    kind: 'comparison',
    label: 'deadline versus average time',
    reason:
      'Final maturity is a contractual date; WAL weights the projected dates of principal repayment.',
    conditions:
      'Amortization and prepayments can return principal well before final maturity.',
    sources: ['glossary', 'structure'],
  },
  {
    id: 'price_32nds__price',
    source: 'price_32nds',
    target: 'price',
    kind: 'measurement',
    label: 'converts the quoted price',
    reason:
      'A quote of 101-16 with no additional tick is 101.5 per 100 of face, before any accrued-interest adjustment.',
    conditions:
      'Fractional ticks vary by market. A price point is not a yield basis point.',
    sources: ['treasury_futures', 'formulas'],
  },
  {
    id: 'spot_curve__forward_curve',
    source: 'spot_curve',
    target: 'forward_curve',
    kind: 'measurement',
    label: 'implies future-period rates',
    reason:
      'Discount factors at two dates imply the forward rate between those dates under a consistent compounding convention.',
    conditions:
      'This is a relationship among today’s prices, not a certain forecast of future spot rates.',
    sources: ['treasury_curve'],
  },
  {
    id: 'macaulay__modified_duration',
    source: 'macaulay',
    target: 'modified_duration',
    kind: 'measurement',
    label: 'converts time to sensitivity',
    reason:
      'With periodic yield compounding, dividing Macaulay duration by one plus yield per period gives modified duration.',
    conditions:
      'Keep cash flows fixed and align the yield convention and time units.',
    sources: ['yield_duration_public', 'formulas'],
  },
  {
    id: 'macaulay__wal',
    source: 'macaulay',
    target: 'wal',
    kind: 'comparison',
    label: 'different cash-flow weights',
    reason:
      'Macaulay duration uses discounted principal and interest; WAL uses undiscounted principal weights.',
    conditions:
      'Both require specified payment timing, but they answer different questions.',
    sources: ['yield_duration_public', 'formulas'],
  },
  {
    id: 'modified_duration__duration',
    source: 'modified_duration',
    target: 'duration',
    kind: 'comparison',
    label: 'fixed versus responsive cash',
    reason:
      'Modified duration holds payments fixed; effective duration can reproject option-sensitive payments after a curve shock.',
    conditions:
      'For MBS, the effective measure depends on rate and prepayment models.',
    sources: ['cfa_risk', 'yield_duration_public'],
  },
  {
    id: 'delinquency__buyouts',
    source: 'delinquency',
    target: 'buyouts',
    kind: 'mechanism',
    label: 'can lead to pool removal',
    reason:
      'Delinquent loans may be bought out of an agency pool, returning principal to investors without borrower refinancing.',
    conditions:
      'Timing and eligibility depend on the applicable program rules; a missed payment does not imply immediate removal.',
    sources: ['mbs_runoff_public'],
  },
  {
    id: 'debt_yield__dscr',
    source: 'debt_yield',
    target: 'dscr',
    kind: 'comparison',
    label: 'balance versus debt service',
    reason:
      'Debt yield divides annual NOI by debt balance; DSCR divides NOI by debt service for the same period.',
    conditions:
      'With NOI and balance fixed, a change in debt service changes DSCR but not debt yield.',
    sources: ['cre'],
  },
];
