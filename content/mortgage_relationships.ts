import type { MortgageRelationship } from './mortgage_concepts.ts';

// Authored analytical links, independent of the reader's suggested next articles.
// Sources name entries in the shared public-reference registry.
type SourcedRelationship = MortgageRelationship & {
  conditions: string;
  sources: string[];
};
export const foundational_relationships: SourcedRelationship[] = [
  {
    id: 'tba__tba_allocation',
    source: 'tba',
    target: 'tba_allocation',
    kind: 'mechanism',
    label: 'constrains later pool allocation',
    reason:
      'The standardized trade terms are agreed before individual pools are identified and define the delivery obligation against which an allocation is checked.',
    conditions:
      'Apply the transaction’s actual terms and current market rules. A TBA trade does not identify final pools at execution.',
    sources: ['sifma_pool_notification', 'sifma_good_delivery'],
  },
  {
    id: 'tba_analytics_mapping__tba_allocation',
    source: 'tba_analytics_mapping',
    target: 'tba_allocation',
    kind: 'comparison',
    label: 'separates a proxy from pool notification',
    reason:
      'A proxy supplies representative collateral for analysis before allocation, while the allocation notice identifies proposed actual pools for delivery.',
    conditions:
      'The proxy is not a notice, contract promise or representation of the pools ultimately delivered. Good delivery does not require actual pools to match proxy cash flows.',
    sources: ['tba_analytics_public', 'sifma_pool_notification'],
  },
  {
    id: 'tba_allocation__settlement',
    source: 'tba_allocation',
    target: 'settlement',
    kind: 'mechanism',
    label: 'precedes final exchange',
    reason:
      'The proposed pools and delivery package are identified and checked before securities and cash are exchanged at settlement.',
    conditions:
      'Notification is not settlement completion. Timing, corrections and remedies depend on the applicable calendar, agreements and current market rules.',
    sources: [
      'sifma_mbs_calendar',
      'fannie_mbs_operations',
      'freddie_tba_48_hour',
    ],
  },
  {
    id: 'tba__tba_analytics_mapping',
    source: 'tba',
    target: 'tba_analytics_mapping',
    kind: 'definition',
    label: 'requires a proxy for pre-allocation analytics',
    reason:
      'The generic contract does not identify the final pools at trade time, so analytics before allocation require stated representative collateral assumptions.',
    conditions:
      'The proxy is an analytical choice, not a TBA contract term, allocation notice or representation of the pools ultimately delivered.',
    sources: ['tba', 'tba_analytics_public'],
  },
  {
    id: 'pool_averages__tba_analytics_mapping',
    source: 'pool_averages',
    target: 'tba_analytics_mapping',
    kind: 'measurement',
    label: 'summarizes proxy collateral',
    reason:
      'WALA and weighted-average loan balance can describe the representative collateral supplied to generic TBA analytics.',
    conditions:
      'State the population and weighting. Weighted-average loan balance is a collateral statistic, not the TBA trade notional or aggregate pool principal.',
    sources: ['fannie_mbs_basics', 'tba_analytics_public'],
  },
  {
    id: 'tba_analytics_mapping__oas',
    source: 'tba_analytics_mapping',
    target: 'oas',
    kind: 'mechanism',
    label: 'conditions the fitted spread',
    reason:
      'Different proxy collateral can change projected payments and therefore the OAS re-solved to the same observed price.',
    conditions:
      'Align the contract, price basis, as-of, settlement, curve, volatility, prepayment-model method and parameters, and valuation convention; do not also hold projected cash flows or the cross-proxy OAS fixed.',
    sources: ['tba_analytics_public', 'tba'],
  },
  {
    id: 'tba_analytics_mapping__duration',
    source: 'tba_analytics_mapping',
    target: 'duration',
    kind: 'mechanism',
    label: 'conditions the rate sensitivity',
    reason:
      'Different proxy collateral can change how projected payments respond to curve shocks and therefore change option-adjusted duration.',
    conditions:
      "Use the same shock convention and model settings; within each run, hold that run's base OAS fixed across its curve shocks. The sign and size of the change are not predetermined.",
    sources: ['tba_analytics_public', 'tba'],
  },
  {
    id: 'repo__repo_rollover',
    source: 'repo',
    target: 'repo_rollover',
    kind: 'definition',
    label: 'sets the next funding maturity',
    reason:
      'The current repo specifies when its cash financing matures, while a longer MBS holding may require renewal or replacement funding.',
    conditions:
      'Read fixed-term and open-repo provisions directly; neither collateral performance nor the planned holding horizon extends the current financing automatically.',
    sources: ['repo_public', 'repo_tenor_public', 'repo_open_public'],
  },
  {
    id: 'repo_interest__repo_rollover',
    source: 'repo_interest',
    target: 'repo_rollover',
    kind: 'comparison',
    label: 'separates accrual from renewal',
    reason:
      'Interest measures the cost accrued on the current cash financing, whereas rollover asks whether and on what terms the next funding period is available.',
    conditions:
      'Apply the contract’s cash balance, rate and day-count convention to the current period; that calculation does not create a future lending commitment.',
    sources: ['repo_public', 'repo_rollover_public'],
  },
  {
    id: 'repo_rollover__haircut',
    source: 'repo_rollover',
    target: 'haircut',
    kind: 'mechanism',
    label: 'can change cash advanced',
    reason:
      'A replacement or renewed repo can carry a different haircut, changing the cash that the same collateral can support.',
    conditions:
      'The original haircut governs the current trade only; future terms depend on the new agreement, collateral valuation and lender willingness.',
    sources: ['repo_public', 'repo_rollover_public'],
  },
  {
    id: 'repo_rollover__margin_call',
    source: 'repo_rollover',
    target: 'margin_call',
    kind: 'comparison',
    label: 'differs from interim margining',
    reason:
      'Rollover concerns financing after the current maturity, while a margin call can require cash or collateral during the current repo term.',
    conditions:
      'Longer tenor may reduce planned renewal frequency but does not suspend the agreement’s mark-to-market and margin provisions.',
    sources: ['repo_public', 'repo_tenor_public'],
  },
  {
    id: 'repo_rollover__liquidity',
    source: 'repo_rollover',
    target: 'liquidity',
    kind: 'mechanism',
    label: 'can force a funding response',
    reason:
      'If financing is unavailable at maturity, the holder may need cash, replacement funding or an asset sale even while the MBS continues to pay.',
    conditions:
      'The outcome depends on available reserves, alternative lenders, collateral terms and market depth; forced sale is a possible response, not an automatic forecast.',
    sources: ['repo_tenor_public', 'repo_rollover_public'],
  },
  {
    id: 'inverse_floater__floater',
    source: 'inverse_floater',
    target: 'floater',
    kind: 'definition',
    label: 'forms a paired coupon split',
    reason:
      'The floater coupon rises with the reference index while the paired inverse coupon falls under the class formulas.',
    conditions:
      'Use the same accrual period and the balances or notionals specified by the transaction; actual formulas can include caps, floors and reset lags.',
    sources: ['structure'],
  },
  {
    id: 'inverse_floater__caps_floors',
    source: 'inverse_floater',
    target: 'caps_floors',
    kind: 'mechanism',
    label: 'becomes piecewise at coupon limits',
    reason:
      'A binding inverse floor or floater cap changes the linear coupon response to the reference index.',
    conditions:
      'Do not clamp one leg independently and continue to assume the simplified two-class coupon identity; apply the deal’s paired rules.',
    sources: ['structure'],
  },
  {
    id: 'sofr__inverse_floater',
    source: 'sofr',
    target: 'inverse_floater',
    kind: 'definition',
    label: 'can supply the coupon index',
    reason:
      'Agency inverse floaters may reference a SOFR-based index whose increase lowers the class coupon under the stated formula.',
    conditions:
      'The reference-rate family alone does not specify observation, reset, lookback, spread, multiplier, cap or floor conventions.',
    sources: ['structure', 'sofr'],
  },
  {
    id: 'prepayments__inverse_floater',
    source: 'prepayments',
    target: 'inverse_floater',
    kind: 'mechanism',
    label: 'changes future coupon capacity',
    reason:
      'Mortgage principal runoff can reduce the balance or notional available to generate later inverse-floater interest.',
    conditions:
      'The transaction documents determine how class balances or notionals decline; coupon direction alone does not determine realized yield.',
    sources: ['structure'],
  },
  {
    id: 'inverse_floater__basis_risk',
    source: 'inverse_floater',
    target: 'basis_risk',
    kind: 'comparison',
    label: 'links short rates to mortgage behavior imperfectly',
    reason:
      'The class index can move differently from mortgage rates, discount curves and the refinancing incentives driving prepayments.',
    conditions:
      'A lower mortgage rate can coexist with a higher short-rate index; evaluate both the coupon formula and the mortgage payment path.',
    sources: ['structure'],
  },
  {
    id: 'cmo__inverse_floater',
    source: 'cmo',
    target: 'inverse_floater',
    kind: 'definition',
    label: 'reallocates interest across classes',
    reason:
      'A multiclass mortgage structure can split a parent interest budget into floater and inverse-floater coupons.',
    conditions:
      'Coupon allocation is separate from principal priority, credit subordination, market value and the scope of any Agency guarantee.',
    sources: ['structure', 'agency_remic_guarantee'],
  },
  {
    id: 'cash_flows__inverse_floater',
    source: 'cash_flows',
    target: 'inverse_floater',
    kind: 'mechanism',
    label: 'redistributes a parent interest budget',
    reason:
      'The paired coupon identity reallocates the same-period parent interest across floater and inverse classes rather than creating additional collateral cash flow.',
    conditions:
      'The identity requires the deal’s applicable balances or notionals and accrual conventions; fees, shortfalls and other interest classes can change the distributable amount.',
    sources: ['structure'],
  },
  {
    id: 'duration__inverse_floater',
    source: 'duration',
    target: 'inverse_floater',
    kind: 'comparison',
    label: 'separates coupon slope from price duration',
    reason:
      'The balance ratio B_F ÷ B_I scales the inverse coupon’s response to its index, not the class price response to a yield-curve shock.',
    conditions:
      'Price duration still depends on discounting, caps and floors, prepayment paths, cash-flow timing and model assumptions; a 4× coupon multiplier does not imply 4× duration.',
    sources: ['structure'],
  },
  {
    id: 'cmo__clo',
    source: 'cmo',
    target: 'clo',
    kind: 'comparison',
    label: 'compares collateral and class protections',
    reason:
      'Mortgage CMOs and corporate CLOs both divide cash flows into classes, but collateral, guarantee and loss allocation must be examined separately.',
    conditions:
      'Compare a specified guaranteed Agency class with the actual corporate CLO waterfall. Neither acronym alone identifies every class risk.',
    sources: ['agency_remic_guarantee', 'clo'],
  },
  {
    id: 'support__subordination',
    source: 'support',
    target: 'subordination',
    kind: 'comparison',
    label: 'distinguishes timing from credit support',
    reason:
      'A companion takes variable principal timing; credit subordination specifies which class absorbs collateral losses first.',
    conditions:
      'Principal priority and loss priority are separate contractual provisions. A support label alone does not establish first-loss status.',
    sources: ['freddie_faq', 'clo'],
  },
  {
    id: 'rolls__cash_flows',
    source: 'rolls',
    target: 'cash_flows',
    kind: 'mechanism',
    label: 'transfers interim payment rights',
    reason:
      'Selling the near leg gives up intervening principal and interest entitlement.',
    conditions:
      'Compare payment timing and remaining balance, not just coupon income.',
    sources: ['tba', 'basics'],
  },
  {
    id: 'prepayments__rolls',
    source: 'prepayments',
    target: 'rolls',
    kind: 'mechanism',
    label: 'changes the financing comparison',
    reason:
      'Expected paydowns change payments forgone and the balance retained by a cash holder.',
    conditions:
      'Hold the quotation and settlement conventions consistent; principal is not profit.',
    sources: ['tba', 'basics'],
  },
  {
    id: 'rolls__cheapest_deliverable',
    source: 'rolls',
    target: 'cheapest_deliverable',
    kind: 'mechanism',
    label: 'reopens pool selection',
    reason:
      'The later purchase permits different eligible pools with different prepayment characteristics.',
    conditions:
      'Similar delivery terms do not guarantee identical collateral economics.',
    sources: ['tba'],
  },
  {
    id: 'rolls__repo',
    source: 'rolls',
    target: 'repo',
    kind: 'comparison',
    label: 'compares funding and payment rights',
    reason:
      'Repo financing preserves the collateral seller’s economic payment entitlement; a dollar roll transfers the intervening payments.',
    conditions:
      'Contract terms govern income processing and collateral substitution. These are not identical trades.',
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
