import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const valuation_sources = {
  day_count_definitions: {
    publisher: 'OpenGamma Strata',
    title: 'Day Counts · year fractions and schedule-dependent conventions',
    url: 'https://strata.opengamma.io/day_counts/',
  },
  day_count_variants: {
    publisher: 'OpenGamma Strata',
    title: 'DayCounts · Actual/Actual and Actual/365 variants',
    url: 'https://strata.opengamma.io/apidocs/com/opengamma/strata/basics/date/DayCounts.html',
  },
  discount_factor_conventions: {
    publisher: 'OpenGamma Strata',
    title: 'DiscountFactors · valuation dates, year fractions and spreads',
    url: 'https://strata.opengamma.io/apidocs/com/opengamma/strata/pricer/DiscountFactors.html',
  },
  interest_rate_conventions: {
    publisher: 'QuantLib',
    title: 'InterestRate · public compounding implementation',
    url: 'https://github.com/lballabio/QuantLib/blob/master/ql/interestrate.cpp',
  },
  multicurve_framework: {
    publisher: 'OpenGamma · Marc Henrard',
    title: 'Multi-Curve Framework with Collateral',
    url: 'https://quant.opengamma.io/Multi-Curve-Framework-with-Collateral-OpenGamma.pdf',
  },
  pathwise_mbs_research: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Understanding Mortgage Spreads · Appendix E, revised June 2018',
    url: 'https://www.newyorkfed.org/research/economists/medialibrary/media/research/staff_reports/sr674.pdf',
  },
};

export const valuation_topics = [
  {
    id: 'valuation_conventions',
    branch: 'valuation',
    title: 'Dates, fractions and compounding',
    concepts: [
      'accrual_discount_clocks',
      'actual_actual_variants',
      'compounding_conventions',
      'convention_resolution',
    ],
  },
  {
    id: 'valuation_curve_roles',
    branch: 'curves',
    title: 'What each curve does',
    concepts: ['curve_roles', 'zero_volatility_case'],
  },
  {
    id: 'pathwise_cashflows',
    branch: 'valuation',
    title: 'From payment dates to pathwise value',
    concepts: [
      'settlement_cashflow_dates',
      'path_cashflows',
      'pathwise_valuation',
    ],
  },
];

function valuation_concept(
  input: Omit<MortgageConcept, 'branch' | 'topic'>,
): MortgageConcept {
  const topic = valuation_topics.find((t) => t.concepts.includes(input.id));
  if (!topic) throw new Error(`Missing valuation topic: ${input.id}`);
  return { ...input, branch: topic.branch, topic: topic.id };
}

export const valuation_concepts: MortgageConcept[] = [
  valuation_concept({
    id: 'accrual_discount_clocks',
    title: 'Accrual and discounting clocks',
    subtitle: 'The payment amount and its present value use different inputs',
    aliases: ['accrual day count', 'discounting day count', 'year fraction'],
    summary:
      'Accrual measures the interest earned over a contractual period. Discounting measures time from the valuation anchor to payment. Record each day-count convention separately: the coupon contract need not use the curve’s time basis.',
    distinction:
      'Changing only the discounting convention does not rewrite the contractual coupon. Keeping the same numerical rate after changing its time basis is also not necessarily an equivalent quote conversion.',
    formula: {
      expression:
        'Interest = balance × annual coupon × accrual fraction; present value = cash flow × discount factor.',
      assumptions:
        'Simple coupon accrual on a constant balance within the period. Balance, interest and present value use one currency; both fractions are in years and rates are annual decimals. The exponential discount illustration assumes continuous compounding.',
      example:
        'For $100,000 at 6%, February 1 to March 1, 2024 is 29 actual days: Act/360 gives $483.33 and Act/365F gives $476.71. These are alternative coupon conventions, not a choice to change an existing contract.',
    },
    question:
      'A curve uses Act/365F. Must an Act/360 coupon now accrue on Act/365F?',
    answer:
      'No. Preserve the coupon’s contractual accrual rule and interpret the discount curve using its own convention.',
    links: [
      { id: 'day_count', reason: 'Dates become fractions under a named rule.' },
      {
        id: 'accrual',
        reason: 'The coupon clock determines accrued interest.',
      },
      {
        id: 'compounding_conventions',
        reason: 'A year fraction still needs a rate and compounding rule.',
      },
    ],
    sources: ['day_count_definitions', 'discount_factor_conventions'],
  }),
  valuation_concept({
    id: 'actual_actual_variants',
    title: 'Actual/Actual is a family',
    subtitle: 'The suffix and coupon schedule matter',
    aliases: [
      'Act/Act',
      'Actual/Actual',
      'Act/Act ISDA',
      'Act/Act ICMA',
      'Act/365L',
    ],
    summary:
      'Act/Act ISDA splits actual days across calendar years using 365 or 366. Act/Act ICMA uses the coupon schedule and payment frequency, with notional periods for stubs. Act/365L is a separate convention whose denominator depends on frequency and coupon-period dates.',
    distinction:
      'A short label such as Act/Act does not identify one complete algorithm. Act/365F always uses 365; Act/365L is not merely another spelling. A market or country label alone cannot establish the contract’s precise variant.',
    question:
      'Do identical dates and the label Act/Act uniquely determine a year fraction?',
    answer:
      'No. Identify the variant and, when required, the coupon schedule, frequency and stub treatment.',
    links: [
      {
        id: 'accrual_discount_clocks',
        reason: 'Resolve the exact convention for each calculation role.',
      },
      {
        id: 'convention_resolution',
        reason: 'A displayed abbreviation may omit calculation details.',
      },
    ],
    sources: ['day_count_variants'],
  }),
  valuation_concept({
    id: 'compounding_conventions',
    title: 'Compounding conventions',
    subtitle: 'A rate number needs an accumulation rule',
    aliases: [
      'simple interest',
      'continuous compounding',
      'periodic compounding',
      'equivalent rate',
    ],
    summary:
      'Simple, periodic and continuous compounding turn a quoted annual rate into different accumulation factors. Day count supplies the time fraction; compounding supplies the rate-to-factor rule. An equivalent-rate conversion preserves the factor over the specified interval.',
    distinction:
      'Coupon frequency, compounding frequency and day count are separate specifications. Copying 6% between conventions is not an equivalent-rate conversion. A conversion at one maturity need not define a whole equivalent curve.',
    formula: {
      expression:
        'Discount factors are 1/(1+rτ), (1+r/m)^(−mτ), or exp(−rτ) under simple, periodic, or continuous compounding.',
      assumptions:
        'A single payment, annual decimal rate r, positive frequency m and nonnegative year fraction τ. Require positive accumulation factors; the periodic power convention must be appropriate to the instrument. An actual curve supplies a maturity-specific rate.',
      example:
        'Over one year, 6% nominal compounded semiannually accumulates to 1.0609, an effective annual rate of 6.09%. Continuous 6% accumulates to approximately 1.06184.',
    },
    question:
      'What must stay unchanged when a rate quote is converted to an equivalent convention?',
    answer:
      'The accumulation or discount factor for the specified dates, not the displayed rate number.',
    links: [
      {
        id: 'discount_factor',
        reason:
          'The accumulation rule determines the factor used for valuation.',
      },
      {
        id: 'yield',
        reason: 'A yield quote must state its compounding basis.',
      },
    ],
    sources: ['interest_rate_conventions'],
  }),
  valuation_concept({
    id: 'convention_resolution',
    title: 'Resolving a convention',
    subtitle: 'Requested, supported and applied are different questions',
    aliases: [
      'day-count fallback',
      'unsupported convention',
      'effective convention',
      'silent fallback',
    ],
    summary:
      'A recognizable convention name does not establish that a particular calculation supports it. A useful review records the requested rule, the applied rule, required schedule inputs and any explicit conversion or fallback. Compare calculated fractions as well as display labels.',
    distinction:
      'This is a review method, not a claim about a vendor’s implementation. For an unsupported input, require either a clear error or a documented alternative with its consequences visible. Never infer a universal mapping from a numeric identifier or abbreviated label.',
    question:
      'A valid convention is unsupported by a calculation. Is silently using 30/360 a neutral substitution?',
    answer:
      'No. It can change the year fraction and valuation. Reject the input or explicitly disclose and justify the applied alternative.',
    links: [
      {
        id: 'actual_actual_variants',
        reason: 'Similar labels can conceal different schedule requirements.',
      },
      {
        id: 'model_risk',
        reason:
          'An unnoticed convention change can masquerade as a model difference.',
      },
    ],
    sources: ['day_count_definitions', 'interest_rate_conventions'],
  }),
  valuation_concept({
    id: 'curve_roles',
    title: 'Discount, projection and funding curves',
    subtitle: 'State the role before assuming the curves coincide',
    aliases: [
      'simulation curve',
      'financing curve',
      'discount curve',
      'single-curve assumption',
    ],
    summary:
      'A discount curve values future payments; a projection curve supplies index forwards; a financing curve describes a funding assumption. A simulation model needs an initial curve and calibrated dynamics. Using one curve in several roles is an explicit simplification.',
    distinction:
      'A simulation curve is not a complete rate model. Even with the same starting curve, volatility and dynamics can differ. A position’s repo funding, a collateralized swap’s discounting and a mortgage’s reference index need not coincide.',
    question:
      'Does one starting curve for discounting and simulation fully specify an OAS model?',
    answer:
      'No. Dynamics, volatility, prepayment behavior, spread application and conventions still have to be specified.',
    links: [
      {
        id: 'dual_curve',
        reason: 'Projection and discounting can use separate curves.',
      },
      {
        id: 'repo',
        reason: 'Position-specific financing affects carry and funding risk.',
      },
      {
        id: 'short_rate_model',
        reason: 'The starting curve must be paired with rate dynamics.',
      },
    ],
    sources: ['multicurve_framework', 'rate_model_calibration', 'repo_public'],
  }),
  valuation_concept({
    id: 'settlement_cashflow_dates',
    title: 'Settlement and cash-flow dates',
    subtitle: 'Keep the accrual period separate from the payment date',
    aliases: ['first payment date', 'settlement anchor', 'payment entitlement'],
    summary:
      'Start with the settlement date and identify the first payment the buyer is entitled to receive. Keep accrual start, accrual end and payment date distinct. A payment delay changes the discounting horizon without automatically lengthening the interest-accrual period.',
    distinction:
      'The first eligible payment is determined by the security’s entitlement rules, not simply the next calendar month. If curve and settlement dates differ, align the valuation anchor before comparing with an invoice; match clean/full price and current-face units.',
    formula: {
      expression:
        'For a deterministic discount curve, the settlement-to-payment factor is D(v,t) / D(v,s).',
      assumptions:
        'v is the curve valuation date, s ≥ v is settlement and t ≥ s is an eligible payment date. This is a deterministic curve-implied forward factor; it is not a formula for an arbitrary future stochastic discount factor. Apply entitlement and accrued-interest rules separately.',
      example:
        'If D(v,s) = 0.99 and D(v,t) = 0.95, the settlement-based factor is 0.95/0.99 ≈ 0.959596, not 0.95.',
    },
    question:
      'Does a later distribution date automatically extend the coupon’s accrual period?',
    answer:
      'No. Accrual dates determine the interest amount; the payment date determines when that amount is received and discounted.',
    links: [
      {
        id: 'settlement',
        reason: 'Settlement fixes the buyer’s valuation and ownership context.',
      },
      {
        id: 'payment_delay',
        reason: 'Accrual and remittance can follow different schedules.',
      },
      {
        id: 'discount_factor',
        reason: 'Discount factors must share the intended valuation anchor.',
      },
      {
        id: 'pv',
        reason:
          'Only the buyer’s eligible dated payments belong in the valuation.',
      },
    ],
    sources: ['discount_factor_conventions', 'formulas', 'fannie_mbs_basics'],
  }),
  valuation_concept({
    id: 'path_cashflows',
    title: 'Cash flows along a rate path',
    subtitle: 'One index for the path, another for the payment date',
    aliases: [
      'path-dependent cash flows',
      'cash-flow vector',
      'path interest',
      'path principal',
    ],
    summary:
      'For each modeled path i and payment date tₖ, track interest, scheduled principal and unscheduled principal separately. Prepayment changes the surviving balance and later interest. Apply the security’s allocation rules before valuing a tranche.',
    distinction:
      'A base-case vector is one scenario, not automatically the model expectation. Keep cash amounts, current-face normalization and path weights explicit. Loan-level payments are not automatically the investor’s net payments.',
    formula: {
      expression:
        'CFᵢ,ₖ = Iᵢ,ₖ + SPᵢ,ₖ + UPᵢ,ₖ; Bᵢ,ₖ = Bᵢ,ₖ₋₁ − SPᵢ,ₖ − UPᵢ,ₖ.',
      assumptions:
        'An illustrative pass-through balance with no defaults, losses, new advances or capitalization. I is investor interest, SP scheduled principal and UP unscheduled principal; all amounts use one currency. Interest is cash received but does not reduce principal.',
      example:
        'An opening balance of $100 with $1 scheduled principal, $9 prepayment and $0.50 investor interest produces $10.50 cash and a $90 ending balance.',
    },
    question:
      'Why can two rate paths with the same final rate generate different mortgage cash flows?',
    answer:
      'Earlier refinancing opportunities and prepayments can leave different surviving balances and borrower populations.',
    links: [
      {
        id: 'prepayments',
        reason: 'Borrower behavior changes principal timing within a path.',
      },
      {
        id: 'burnout',
        reason: 'Earlier refinancing affects the pool that remains.',
      },
      {
        id: 'collateral_tranche_cashflows',
        reason:
          'Contractual allocation turns collateral cash into security cash.',
      },
      {
        id: 'pathwise_valuation',
        reason: 'Match each payment stream with its own path discount factors.',
      },
    ],
    sources: ['pathwise_mbs_research', 'rate_model_calibration'],
  }),
  valuation_concept({
    id: 'pathwise_valuation',
    title: 'Discount first, then average',
    subtitle: 'Cash flows and discount factors belong to the same path',
    aliases: [
      'pathwise valuation',
      'Monte Carlo valuation',
      'expected present value',
      'cash-flow discount covariance',
    ],
    summary:
      'Value the eligible payments on each rate path using that path’s discount factors, then combine the path values with the model weights. In an OAS calculation, solve for the stated spread that matches the observed full price under the chosen model.',
    distinction:
      'Average cash flow multiplied by average discount factor generally loses their covariance. Discounting at an average rate introduces another nonlinearity. Pricing weights describe the valuation model, not necessarily real-world probabilities; non-rate prepayment risk can remain in OAS.',
    formula: {
      expression:
        'PVₛ(z) = Σᵢ wᵢ Σₖ CFᵢ,ₖ Dᵢ(s,tₖ) exp(−zτₛ,ₖ); E[CF·D] = E[CF]E[D] + Cov(CF,D).',
      assumptions:
        'Weights are nonnegative and sum to one; equally sampled pricing paths use 1/N. Include only eligible post-settlement payments. z is an annual decimal spread, τ is years and D excludes z. The exponential is an illustrative continuous spread convention; compare PV and full market value in identical units.',
      example:
        'For two equally weighted illustrative states, (CF, D) = ($100, 0.98) and ($50, 0.90). Average discounted cash is $71.50; multiplying $75 by 0.94 gives $70.50. The $1 difference is the covariance term, not a market quote.',
    },
    question:
      'When does average cash flow times average discount factor reproduce expected discounted cash flow?',
    answer:
      'When their covariance is zero for each relevant payment, or the covariance contributions cancel in the total. It is not true merely because many paths are simulated.',
    links: [
      {
        id: 'oas',
        reason: 'OAS is fitted to the model’s weighted discounted cash flows.',
      },
      {
        id: 'model_calibration',
        reason:
          'The path distribution and benchmark pricing must be consistent.',
      },
      {
        id: 'settlement_cashflow_dates',
        reason: 'Every path uses the same valuation and entitlement context.',
      },
    ],
    sources: ['pathwise_mbs_research', 'rate_model_calibration'],
  }),
  valuation_concept({
    id: 'zero_volatility_case',
    title: 'The zero-volatility comparison',
    subtitle: 'A deterministic check with explicit held-fixed assumptions',
    aliases: [
      'zero volatility',
      'zero-volatility spread',
      'ZV',
      'deterministic cash flows',
    ],
    summary:
      'A deterministic comparison removes rate-path dispersion while retaining a specified curve and cash-flow rule. It can help isolate what stochastic rates and option-sensitive payments add to a valuation. A Z-spread uses a specified payment schedule and reference zero curve.',
    distinction:
      'Zero volatility does not mean zero interest rates, zero spread or no prepayments. OAS and Z-spread coincide only when the compared cash flows, discount factors, spread convention, dates and price basis coincide. Simply setting one volatility parameter to zero does not establish that equivalence.',
    question:
      'Does setting rate volatility to zero guarantee that an OAS result equals a separately reported Z-spread?',
    answer:
      'No. The remaining cash-flow, curve, spread and quotation assumptions must also match.',
    links: [
      {
        id: 'z_spread',
        reason:
          'A fixed cash-flow schedule defines the static spread comparison.',
      },
      {
        id: 'oas',
        reason:
          'The stochastic calculation must have a consistent deterministic limit.',
      },
      {
        id: 'curve_roles',
        reason:
          'The same curve name does not establish identical valuation roles.',
      },
    ],
    sources: ['rate_model_calibration', 'discount_factor_conventions'],
  }),
];

function valuation_relation(
  source: string,
  target: string,
  kind: MortgageRelationship['kind'],
  label: string,
  reason: string,
  conditions: string,
  sources: string[],
): MortgageRelationship {
  return {
    id: `${source}__${target}`,
    source,
    target,
    kind,
    label,
    reason,
    conditions,
    sources,
  };
}

export const valuation_relationships = [
  valuation_relation(
    'day_count',
    'accrual_discount_clocks',
    'definition',
    'has separate calculation roles',
    'The coupon accrual fraction and the discounting time fraction need not use the same convention.',
    'Follow the contract and curve definitions separately.',
    ['day_count_definitions', 'discount_factor_conventions'],
  ),
  valuation_relation(
    'convention_resolution',
    'actual_actual_variants',
    'measurement',
    'requires a precise variant',
    'A display label must resolve to an actual algorithm and any schedule inputs before calculation.',
    'A country or vendor label alone is insufficient.',
    ['day_count_variants'],
  ),
  valuation_relation(
    'actual_actual_variants',
    'accrual_discount_clocks',
    'measurement',
    'specifies each clock',
    'The named Actual/Actual variant determines the fraction only for the role in which it is applied.',
    'Some variants also require coupon schedule information.',
    ['day_count_variants'],
  ),
  valuation_relation(
    'accrual_discount_clocks',
    'compounding_conventions',
    'comparison',
    'separates time from accumulation',
    'The day-count fraction and the rule that compounds a quoted rate are independent specifications.',
    'Rate conversions must preserve the intended interval factor.',
    ['interest_rate_conventions'],
  ),
  valuation_relation(
    'compounding_conventions',
    'discount_factor',
    'measurement',
    'maps a rate into a factor',
    'A rate and time fraction produce a discount factor only under a stated compounding convention.',
    'Require a valid positive accumulation factor.',
    ['interest_rate_conventions'],
  ),
  valuation_relation(
    'discount_factor',
    'settlement_cashflow_dates',
    'measurement',
    'must use the correct anchor',
    'A factor based at the curve date cannot be used as a settlement-based factor without alignment.',
    'The displayed factor ratio applies to a deterministic curve.',
    ['discount_factor_conventions'],
  ),
  valuation_relation(
    'settlement_cashflow_dates',
    'pv',
    'measurement',
    'selects and dates eligible payments',
    'Present value includes the cash flows belonging to the buyer, discounted from the stated anchor.',
    'Match entitlement, accrued interest and quotation units.',
    ['formulas', 'fannie_mbs_basics'],
  ),
  valuation_relation(
    'curve_roles',
    'dual_curve',
    'comparison',
    'distinguishes projection and discounting',
    'The reference used to project floating coupons can differ from the one used to discount them.',
    'Use the instrument and collateral conventions that apply.',
    ['multicurve_framework'],
  ),
  valuation_relation(
    'curve_roles',
    'short_rate_model',
    'definition',
    'needs dynamics as well as a curve',
    'An initial curve provides calibration context but does not by itself specify future rate paths.',
    'Specify model parameters and the pricing measure.',
    ['rate_model_calibration'],
  ),
  valuation_relation(
    'short_rate_model',
    'path_cashflows',
    'mechanism',
    'supplies rate histories',
    'Different rate histories can induce different prepayment paths and surviving principal balances.',
    'Requires a specified borrower-behavior and cash-flow model.',
    ['pathwise_mbs_research'],
  ),
  valuation_relation(
    'path_cashflows',
    'pathwise_valuation',
    'measurement',
    'pairs cash with its discount factor',
    'A payment stream is discounted on its own path before its value is combined with other paths.',
    'Use the model weights and investor-eligible payments.',
    ['rate_model_calibration'],
  ),
  valuation_relation(
    'pathwise_valuation',
    'oas',
    'measurement',
    'fits a common spread to price',
    'The selected OAS equates weighted pathwise discounted payments with the observed full value.',
    'Match curve, spread convention, dates and price units.',
    ['pathwise_mbs_research'],
  ),
  valuation_relation(
    'oas',
    'zero_volatility_case',
    'comparison',
    'has a conditional deterministic limit',
    'A deterministic OAS calculation reduces to the same static spread problem only when its other inputs coincide.',
    'Zero volatility alone is not a sufficient equivalence check.',
    ['rate_model_calibration', 'discount_factor_conventions'],
  ),
  valuation_relation(
    'zero_volatility_case',
    'z_spread',
    'comparison',
    'requires the same fixed schedule',
    'A Z-spread comparison must use identical payments and discounting conventions to establish equality.',
    'The deterministic path need not be the separately chosen base case.',
    ['discount_factor_conventions'],
  ),
];

export const valuation_paths = [
  {
    id: 'conventions_to_value',
    title: 'From a convention label to present value',
    description:
      'Follow the dates, year fractions and discount factors behind a quoted result.',
    premise:
      'A consistent valuation needs the same intended contract and date context at every step.',
    steps: [
      'convention_resolution',
      'actual_actual_variants',
      'accrual_discount_clocks',
      'compounding_conventions',
      'discount_factor',
      'settlement_cashflow_dates',
      'pv',
    ],
    explanations: [
      'Identify the requested and applied convention, including any explicit alternative.',
      'Resolve abbreviated names and provide required coupon-schedule inputs.',
      'Keep the contractual interest clock separate from the discounting time basis.',
      'State how the annual rate turns a time fraction into an accumulation factor.',
      'Use the resulting dated factors with the matching rate and curve conventions.',
      'Align settlement, payment entitlement and the date on which each payment is received.',
      'Sum the eligible discounted payments in the same units as the full quoted value.',
    ],
    boundary:
      'This is an interpretation checklist, not a vendor-specific convention mapping. Different valid conventions can produce different numbers without implying an economic market move.',
  },
  {
    id: 'paths_to_oas',
    title: 'From a rate path to OAS',
    description:
      'Understand why cash flows must be discounted before paths are averaged.',
    premise:
      'Rate-sensitive payments and discount factors must stay paired throughout the calculation.',
    steps: [
      'curve_roles',
      'short_rate_model',
      'path_cashflows',
      'pathwise_valuation',
      'oas',
      'zero_volatility_case',
    ],
    explanations: [
      'Name the curves used for projection, valuation, financing and simulation inputs.',
      'Specify calibrated rate dynamics and volatility rather than only a curve label.',
      'Generate the interest and principal payments belonging to the claim on each path.',
      'Discount each path’s payments first, then combine values with the model weights.',
      'Fit the stated spread to the observed full price while holding the model assumptions fixed.',
      'Check a deterministic comparison only after aligning its cash flows and all quotation conventions.',
    ],
    boundary:
      'The formulas explain valuation rather than run a pricing engine. OAS remains model-dependent and may contain non-rate prepayment, liquidity and other risk compensation.',
  },
];
