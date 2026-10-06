import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const contract_sources = {
  imm_calendar: {
    publisher: 'CME Group',
    title: 'Understanding IMM Index and Dates',
    url: 'https://www.cmegroup.com/education/courses/understanding-stir-futures/understanding-imm-index-and-dates',
  },
  sofr_contract_period: {
    publisher: 'CME Group',
    title: 'Understanding SOFR Futures · reference periods and settlement',
    url: 'https://www.cmegroup.com/education/articles-and-reports/understanding-sofr-futures',
  },
  fra_contract: {
    publisher: 'OpenGamma Strata',
    title: 'Forward Rate Agreement · contract dates and conventions',
    url: 'https://strata.opengamma.io/fra/',
  },
  date_adjustments: {
    publisher: 'OpenGamma Strata',
    title: 'Date Adjustments · business days and holiday calendars',
    url: 'https://strata.opengamma.io/date_adjustments/',
  },
  curve_pillar_dates: {
    publisher: 'OpenGamma Strata',
    title: 'CurveNodeDate · end, last-fixing and specified dates',
    url: 'https://strata.opengamma.io/apidocs/com/opengamma/strata/market/curve/CurveNodeDate.html',
  },
  bill_quotation: {
    publisher: 'U.S. Treasury',
    title: 'Price, Yield and Rate Calculations for a Treasury Bill',
    url: 'https://www.treasurydirect.gov/instit/annceresult/press/preanre/2004/ofcalc6decbill.pdf',
  },
  repo_accrual: {
    publisher: 'ICMA',
    title: 'Repo FAQ 28 · interest on cash advanced, including negative rates',
    url: 'https://www.icmagroup.org/market-practice-and-regulatory-policy/repo-and-collateral-markets/icma-ercc-publications/frequently-asked-questions-on-repo/28-what-happens-to-repo-transactions-when-interest-rates-go-negative/',
  },
  analytics_market_data: {
    publisher: 'OpenGamma Strata',
    title: 'Market Data · valuation dates, derived inputs and scenarios',
    url: 'https://strata.opengamma.io/market_data/',
  },
};

export const contract_topics = [
  {
    id: 'contract_and_curve_dates',
    branch: 'curves',
    title: 'The dates behind a rate',
    concepts: [
      'curve_anchor',
      'imm_dates',
      'accrual_period',
      'forward_rate_agreement',
      'curve_pillar',
    ],
  },
  {
    id: 'yield_quotation_conventions',
    branch: 'valuation',
    title: 'Which yield convention?',
    concepts: ['bank_discount_rate', 'money_market_yield', 'yield_to_worst'],
  },
  {
    id: 'financing_accrual',
    branch: 'trading',
    title: 'The cash that earns repo interest',
    concepts: ['repo_interest'],
  },
  {
    id: 'notional_claims',
    branch: 'structure',
    title: 'A balance without principal payments',
    concepts: ['io_notional'],
  },
  {
    id: 'analysis_context',
    branch: 'valuation',
    title: 'A result you can reconstruct',
    concepts: ['horizon_date', 'analytics_context'],
  },
];

function contract_entry(
  input: Omit<MortgageConcept, 'branch' | 'topic'>,
): MortgageConcept {
  const topic = contract_topics.find((item) =>
    item.concepts.includes(input.id),
  );
  if (!topic) throw new Error(`Missing convention topic: ${input.id}`);
  return { ...input, branch: topic.branch, topic: topic.id };
}

export const contract_concepts: MortgageConcept[] = [
  contract_entry({
    id: 'curve_anchor',
    title: 'Curve reference & spot dates',
    subtitle: 'Choose the origin before measuring a tenor',
    aliases: [
      'curve date',
      'curve settlement date',
      'spot date',
      'curve reference date',
    ],
    summary:
      'A curve reference date anchors its time coordinates. An input instrument can begin on a different effective or spot date. Keep both when translating a tenor into a calendar date.',
    distinction:
      'A spot lag counts business days using specified calendars; a curve time can use a separate day-count convention. T+2 is not a universal curve rule. The date of the market observation does not, by itself, identify either convention.',
    question:
      'Does a curve observed today force every input instrument to start today?',
    answer:
      'No. The curve reference date, instrument effective date and spot-lag convention must be identified separately.',
    links: [
      {
        id: 'as_of',
        reason:
          'Observation time identifies the snapshot; the curve reference date identifies its time origin.',
      },
      {
        id: 'imm_dates',
        reason:
          'An IMM contract has calendar boundaries rather than a rolling tenor from today.',
      },
      {
        id: 'curve_pillar',
        reason:
          'A node date becomes a time coordinate only relative to a stated origin.',
      },
    ],
    sources: ['date_adjustments', 'analytics_market_data'],
  }),
  contract_entry({
    id: 'imm_dates',
    title: 'IMM dates',
    subtitle: 'Quarterly boundaries, not a fixed day count',
    aliases: [
      'IMM',
      'IMM date',
      'International Monetary Market',
      'third Wednesday',
    ],
    summary:
      'Quarterly IMM dates fall on the third Wednesday of March, June, September and December. They define important boundaries for many interest-rate contracts.',
    distinction:
      'For a quarterly CME SR3 contract, the named contract month starts the reference quarter; the quarter ends immediately before the next quarterly IMM Wednesday. Serial contracts follow their own three-month reference periods. Last trading and final settlement follow their own rules. An IMM quarter is not always 90 days, and an FOMC meeting date is a different calendar.',
    question:
      'Does a September SR3 contract measure only September overnight rates?',
    answer:
      'No. It references compounded overnight SOFR from September IMM Wednesday to, but excluding, December IMM Wednesday.',
    links: [
      {
        id: 'futures_curve',
        reason: 'Each contract in the strip has its own reference quarter.',
      },
      {
        id: 'accrual_period',
        reason:
          'Calendar boundaries determine the interest interval and its actual day count.',
      },
    ],
    sources: ['imm_calendar', 'sofr_contract_period'],
  }),
  contract_entry({
    id: 'accrual_period',
    title: 'Forward start & accrual period',
    subtitle: 'Time until interest starts differs from time earning interest',
    aliases: [
      'period to start',
      'accrual period',
      'accrual factor',
      '3x6',
      '3 x 6',
    ],
    summary:
      'A forward interval has a start and an end. Time from valuation to the start measures the waiting period; the start-to-end interval determines interest accrual. A 3×6 FRA describes roughly a three-month interval starting three months ahead.',
    distinction:
      'Use adjusted contractual dates and the specified day count. Calendar months need not contain 30 days. The curve time to the start, coupon accrual fraction and time to payment need not use the same basis.',
    formula: {
      expression: 'α = actual calendar days from T₁ to T₂ / 360',
      assumptions:
        'An Actual/360 accrual interval, including T₁ and excluding T₂, with T₂ after T₁. This defines the accrual fraction only, not the forward-start delay or compounding rule.',
      example:
        'If the interval contains 91 calendar days, α = 91/360 ≈ 0.252778, even when described as a three-month contract.',
    },
    question:
      'For a 3×6 FRA, is interest normally calculated on six months of accrual?',
    answer:
      'No. The accrual runs between the three-month and six-month dates; calculate the fraction from those adjusted dates.',
    links: [
      {
        id: 'forward_rate_agreement',
        reason:
          'A FRA specifies the future interest interval and its settlement convention.',
      },
      {
        id: 'day_count',
        reason:
          'The chosen day-count basis converts interval dates into an accrual fraction.',
      },
      {
        id: 'forward_curve',
        reason:
          'A finite-period forward rate applies between two dates, not simply at one tenor label.',
      },
    ],
    sources: ['fra_contract', 'date_adjustments', 'formulas'],
  }),
  contract_entry({
    id: 'forward_rate_agreement',
    title: 'Forward rate agreement',
    subtitle: 'An agreed rate for one future interval',
    aliases: ['FRA', 'forward rate agreement', 'forward-starting rate'],
    summary:
      'A FRA exchanges the difference between a contracted fixed rate and a specified floating rate on a notional amount for one future accrual interval. The notional is a calculation base, not a loan advanced to the counterparty.',
    distinction:
      'In a conventional term-index FRA, the fixing is near the interval start and a discounted difference is commonly paid at the start. Payment and discounting rules vary. Compounded-in-arrears SOFR is known later, so it cannot simply inherit the same fixing and settlement timeline.',
    question:
      'Can a term-index FRA and a three-month SOFR future share the same dates yet have different settlement mechanics?',
    answer:
      'Yes. Check the underlying rate, fixing, payment date and daily variation margin before comparing their rates.',
    links: [
      {
        id: 'futures_curve',
        reason:
          'Futures and FRAs can reference similar intervals while settling differently.',
      },
      {
        id: 'reset_payment_dates',
        reason: 'Fixing, accrual and payment are distinct contractual events.',
      },
      {
        id: 'futures_convexity',
        reason:
          'Daily futures settlement can require an adjustment relative to a forward agreement.',
      },
    ],
    sources: ['fra_contract', 'sofr_contract_period'],
  }),
  contract_entry({
    id: 'curve_pillar',
    title: 'Curve pillar date',
    subtitle: 'Where an input is located on a fitted curve',
    aliases: ['pillar', 'pillar date', 'node date', 'curve node date'],
    summary:
      'A pillar date locates a calibration node on the curve. Depending on the instrument and construction method, it can use an end date, an eligible last-fixing date or an explicitly specified date.',
    distinction:
      'A pillar date is not automatically the accrual start, payment date, last trading date or final maturity. Preserve its meaning before converting it into a year fraction or selecting the nearest node. A rounded tenor label cannot resolve those choices.',
    question: 'Does the heading “3M” uniquely identify a curve pillar date?',
    answer:
      'No. The anchor, instrument dates, calendars and pillar convention must also be known.',
    links: [
      {
        id: 'curve_nodes',
        reason:
          'The display label and the actual calibration date are separate node attributes.',
      },
      {
        id: 'curve_interpolation',
        reason:
          'Interpolation relies on correctly located and ordered curve points.',
      },
      {
        id: 'bootstrapping',
        reason:
          'Calibration instruments constrain the curve at dates chosen by the construction method.',
      },
    ],
    sources: ['curve_pillar_dates'],
  }),
  contract_entry({
    id: 'bank_discount_rate',
    title: 'Bank discount rate',
    subtitle: 'The discount divided by face value',
    aliases: [
      'discount quote',
      'discount-quoted',
      'bank discount yield',
      'bill discount rate',
    ],
    summary:
      'A bank discount quote annualizes the difference between redemption and purchase price using face value as its denominator. It is not the return on the cash invested.',
    distinction:
      'Identify whether a raw number is a discount rate, a dollar price or a yield before converting it. A bank discount quote is also different from the spot rate used to discount a cash flow. Treasury investment-rate conventions are separate.',
    formula: {
      expression: 'd = (1 − P/100) × 360/D; P = 100 × (1 − dD/360)',
      assumptions:
        'A single redemption of 100, no intervening coupons, D > 0 actual days and an Actual/360 bank discount quote. P is the price per 100 face; d is an annual decimal rate.',
      example:
        'A hypothetical 90-day bill at 98.75 has a 5.00% bank discount rate. The 1.25 gain is measured against 100 face here, not the 98.75 paid.',
    },
    question:
      'Is a 5% bank discount quote necessarily a 5% return on the purchase price?',
    answer:
      'No. The quote uses face value; an investment-based yield uses the amount paid and its own annualization convention.',
    links: [
      {
        id: 'money_market_yield',
        reason:
          'Changing the denominator from face to price changes the annualized rate.',
      },
      {
        id: 'quote_context',
        reason: 'The quote type and units must accompany a raw observation.',
      },
    ],
    sources: ['bill_quotation'],
  }),
  contract_entry({
    id: 'money_market_yield',
    title: 'Simple money-market yield',
    subtitle: 'Annualizing the return on the price paid',
    aliases: [
      'simple yield',
      'money market yield',
      'investment basis',
      'ACT/360 yield',
    ],
    summary:
      'A simple money-market yield annualizes a single-period return on the purchase price. Under the same Actual/360 basis it differs from a bank discount quote because the denominator is the invested amount.',
    distinction:
      'This is not an effective annual yield or automatically Treasury’s published investment rate. Treasury uses a different year basis and a separate coupon-equivalent calculation for bills beyond a half-year. Match conventions before comparing rates.',
    formula: {
      expression: 'y₃₆₀ = (100/P − 1) × 360/D = d / (1 − dD/360)',
      assumptions:
        'Single redemption of 100, P > 0, D > 0, no intermediate cash flows, simple annualization on Actual/360. The conversion uses the same bank discount rate d and period.',
      example:
        'With P = 98.75 and D = 90, the simple Actual/360 yield is about 5.0633%, versus a 5.00% bank discount quote. Both describe the same hypothetical payment.',
    },
    question:
      'Must 5.00% discount and 5.0633% simple yield describe different 90-day bills?',
    answer:
      'No. They can describe the same bill when one uses face value and the other uses its 98.75 purchase price.',
    links: [
      {
        id: 'bank_discount_rate',
        reason:
          'The same payment can be expressed on face-value or investment bases.',
      },
      {
        id: 'benchmark_matching',
        reason:
          'Yield differences are meaningful only after aligning quotation conventions.',
      },
      {
        id: 'yield',
        reason:
          'A simple single-payment yield is one convention within the broader idea of yield.',
      },
    ],
    sources: ['bill_quotation', 'cfa_valuation'],
  }),
  contract_entry({
    id: 'repo_interest',
    title: 'Repo interest',
    subtitle: 'Accruing on the cash advanced',
    aliases: [
      'repo accrual',
      'financing interest',
      'repo interest calculation',
    ],
    summary:
      'Repo interest applies the agreed financing rate to the cash lent for the financing period. The collateral’s face value, market value and cash advanced are different quantities, especially with a haircut.',
    distinction:
      'Use the agreed day count and actual cash balance. The simple expression below assumes no repricing, balance change or intervening adjustment. Negative agreed rates can produce negative interest. Collateral coupons and principal payments need their own contractual treatment.',
    formula: {
      expression: 'I_repo = C × r_repo × D/360',
      assumptions:
        'Fixed cash principal C and annual decimal repo rate r_repo over D actual calendar days, using Actual/360 simple interest. No fees or cash-balance changes. Positive I_repo is paid by the cash borrower.',
      example:
        'For $1,000,000 of cash advanced at 5% over seven days, interest is $972.22. A larger collateral face amount does not replace the cash principal in this calculation.',
    },
    question:
      'With a haircut, should repo interest automatically use the collateral’s face amount?',
    answer:
      'No. It accrues on the agreed cash financing balance under the repo terms.',
    links: [
      {
        id: 'repo',
        reason:
          'The repo agreement determines the cash principal and repayment obligation.',
      },
      {
        id: 'haircut',
        reason: 'A haircut affects the cash advanced against the collateral.',
      },
      {
        id: 'carry',
        reason:
          'Financing interest reduces income retained during a holding period.',
      },
    ],
    sources: ['repo_accrual', 'repo_public'],
  }),
  contract_entry({
    id: 'yield_to_worst',
    title: 'Yield to worst',
    subtitle: 'The lowest yield in a defined redemption comparison',
    aliases: ['YTW', 'yield to worst', 'yield to call', 'YTC'],
    summary:
      'For a conventional callable bond, YTW is the lowest yield among maturity and the eligible call scenarios included by the calculation. Each scenario uses its own redemption date and price.',
    distinction:
      'YTW assumes the specified payments occur without default. It is not the worst possible realized return, a default stress test or a mortgage prepayment model. State which calls are evaluated, along with settlement and yield conventions.',
    formula: {
      expression: 'YTW = min(YTM, YTC₁, …, YTCₙ)',
      assumptions:
        'The same observed full price and settlement are used with consistent yield conventions for each eligible redemption scenario. Contractual coupons and redemption payments occur as assumed.',
      example:
        'If the hypothetical yields are 5.4% to maturity, 4.7% to the first eligible call and 4.9% to another included call, YTW is 4.7%. It does not guarantee that return.',
    },
    question: 'Does a 4.7% YTW guarantee at least a 4.7% realized return?',
    answer:
      'No. Default, a sale before redemption, actual exercise and reinvestment can produce a different result.',
    links: [
      {
        id: 'callable',
        reason:
          'Contractual call dates and prices define the redemption scenarios.',
      },
      {
        id: 'yield',
        reason:
          'Each scenario solves a yield from an assumed payment schedule.',
      },
      {
        id: 'prepayments',
        reason:
          'Mortgage prepayments require cash-flow assumptions beyond a conventional call schedule.',
      },
    ],
    sources: ['return_public', 'cfa_valuation'],
  }),
  contract_entry({
    id: 'io_notional',
    title: 'IO notional balance',
    subtitle: 'An interest base, not principal owed',
    aliases: [
      'notional balance',
      'notional principal',
      'IO factor',
      'interest-only notional',
    ],
    summary:
      'An interest-only class uses a notional balance to determine interest. A reduction in that reference balance removes future interest capacity; it does not create a principal payment to the IO holder.',
    distinction:
      'Follow the class supplement for the notional allocation, coupon and accrual rules. When documentation reports IO average life or final payment timing using notional reductions, those reductions remain distinct from cash principal distributions.',
    formula: {
      expression: 'I_t = N_t × c_t × α_t',
      assumptions:
        'A class whose contractual interest is computed on notional N_t, annual decimal coupon c_t and period accrual fraction α_t. N_t is the balance applicable to that accrual period; variable excess-interest structures may need different rules.',
      example:
        'At 6% with a 1/12 accrual fraction, a $1,000,000 applicable notional generates $5,000 of interest. If the next period’s notional is $800,000, interest is $4,000; the $200,000 reduction is not principal cash paid to the IO.',
    },
    question:
      'Does a $200,000 reduction of an IO reference notional mean its holder received $200,000 of principal?',
    answer:
      'No. The notional is an interest calculation base, not a principal claim of the IO class.',
    links: [
      {
        id: 'io',
        reason:
          'The class receives designated interest rather than principal distributions.',
      },
      {
        id: 'pool_factor',
        reason:
          'An IO class factor can describe a notional reduction instead of cash principal paid.',
      },
      {
        id: 'cash_flows',
        reason:
          'Keep reference-balance changes separate from actual investor distributions.',
      },
      {
        id: 'wal',
        reason:
          'An IO average-life measure needs a stated convention for weighting notional reductions.',
      },
    ],
    sources: ['smbs', 'structure'],
  }),
  contract_entry({
    id: 'horizon_date',
    title: 'Holding-period horizon',
    subtitle: 'Where an analysis ends, not where a bond must end',
    aliases: ['horizon', 'horizon date', 'horizon months', 'holding period'],
    summary:
      'A horizon is the chosen endpoint for a holding-period scenario. Separate cash received before that date from the remaining position at that date. A security may continue to exist after the analysis ends.',
    distinction:
      'Specify the start date, calendar-month rule and date adjustments. A three-month horizon is not necessarily 90 days. Use the security’s balance at the horizon, count returned principal once and state any reinvestment and funding assumptions.',
    question:
      'Does a six-month holding horizon imply that a thirty-year mortgage security matures in six months?',
    answer:
      'No. It only sets the scenario endpoint; remaining cash flows and any terminal value still need explicit assumptions.',
    links: [
      {
        id: 'settlement',
        reason: 'The holding period needs a stated starting date.',
      },
      {
        id: 'total_return',
        reason:
          'Income and remaining value must be measured over the same interval.',
      },
      {
        id: 'carry',
        reason:
          'Financing and running income accrue during the specified holding interval.',
      },
      {
        id: 'analytics_context',
        reason:
          'The horizon and scenario assumptions belong with the reported result.',
      },
    ],
    sources: ['return_public', 'formulas', 'date_adjustments'],
  }),
  contract_entry({
    id: 'analytics_context',
    title: 'Reproducible analytics',
    subtitle: 'Preserve the inputs behind the displayed number',
    aliases: [
      'analytics context',
      'input lineage',
      'market snapshot',
      'reproducibility',
    ],
    summary:
      'To reconstruct an analytical result, preserve instrument terms, valuation and settlement dates, the market snapshot, quote conventions and model assumptions. A calibrated curve is a derived input; a yield, spread or sensitivity also depends on the instrument and calculation.',
    distinction:
      'Changing the displayed source name does not establish that every underlying input changed. Compare resolved inputs when reconciling results, including missing-data treatment, interpolation, prepayment assumptions and the output’s units. These are general analytical controls, not a description of any provider’s implementation.',
    question:
      'Do matching security names and visible yield labels prove that two calculations used identical inputs?',
    answer:
      'No. Compare the dated market inputs, contractual terms, assumptions and calculation conventions.',
    links: [
      {
        id: 'as_of',
        reason:
          'Effective and publication timestamps establish the observation context.',
      },
      {
        id: 'quote_context',
        reason:
          'A raw quote requires its type, side and units before interpretation.',
      },
      {
        id: 'assumption_vector',
        reason:
          'Time-varying behavioral assumptions can change the projected cash flows.',
      },
      {
        id: 'spread_conventions',
        reason: 'A spread needs a defined curve and calculation method.',
      },
    ],
    sources: ['analytics_market_data', 'formulas'],
  }),
];

export const contract_relationships: MortgageRelationship[] = [
  {
    id: 'curve_interpolation__benchmark_matching',
    source: 'curve_interpolation',
    target: 'benchmark_matching',
    kind: 'measurement',
    label: 'estimates the chosen reference',
    reason:
      'An interpolated reference inherits the selected curve quantity, dates and fitting method; changing that method can change a reported yield spread.',
    conditions:
      'Disclose the interpolation method and distinguish a fitted point from an observed instrument quote.',
    sources: ['ecb_curves', 'cfa_valuation'],
  },
  {
    id: 'curve_anchor__imm_dates',
    source: 'curve_anchor',
    target: 'imm_dates',
    kind: 'comparison',
    label: 'compares rolling and fixed dates',
    reason:
      'A curve origin moves with the valuation convention while an IMM contract retains its specified calendar boundaries.',
    conditions:
      'Distinguish curve time from instrument effective and end dates.',
    sources: ['date_adjustments', 'imm_calendar'],
  },
  {
    id: 'imm_dates__accrual_period',
    source: 'imm_dates',
    target: 'accrual_period',
    kind: 'definition',
    label: 'bounds the reference interval',
    reason:
      'Quarterly IMM boundaries identify the calendar interval over which a quarterly SR3 contract compounds overnight rates.',
    conditions:
      'Apply the contract calendar; the resulting number of days is not always 90.',
    sources: ['sofr_contract_period'],
  },
  {
    id: 'accrual_period__forward_rate_agreement',
    source: 'accrual_period',
    target: 'forward_rate_agreement',
    kind: 'definition',
    label: 'defines the future rate interval',
    reason:
      'A FRA needs a future start and end plus the accrual convention to define the interest difference being exchanged.',
    conditions: 'Fixing and payment dates are additional contract fields.',
    sources: ['fra_contract'],
  },
  {
    id: 'forward_rate_agreement__futures_curve',
    source: 'forward_rate_agreement',
    target: 'futures_curve',
    kind: 'comparison',
    label: 'compares forward exposures',
    reason:
      'A FRA and a futures contract can concern similar future intervals but have different benchmarks and cash-settlement timing.',
    conditions: 'Align index and dates, and consider daily variation margin.',
    sources: ['fra_contract', 'sofr_contract_period'],
  },
  {
    id: 'curve_anchor__curve_pillar',
    source: 'curve_anchor',
    target: 'curve_pillar',
    kind: 'measurement',
    label: 'sets the time origin',
    reason:
      'The pillar calendar date needs a curve reference date and time convention to become a numerical curve coordinate.',
    conditions:
      'The curve basis need not equal the instrument coupon day count.',
    sources: ['curve_pillar_dates', 'date_adjustments'],
  },
  {
    id: 'curve_pillar__curve_interpolation',
    source: 'curve_pillar',
    target: 'curve_interpolation',
    kind: 'measurement',
    label: 'locates the input points',
    reason:
      'An interpolation method must use the intended node dates and coordinates instead of treating rounded tenor labels as exact dates.',
    conditions:
      'Identify which curve quantity is interpolated and avoid silently substituting a missing input.',
    sources: ['curve_pillar_dates', 'ecb_curves'],
  },
  {
    id: 'quote_context__bank_discount_rate',
    source: 'quote_context',
    target: 'bank_discount_rate',
    kind: 'definition',
    label: 'identifies a discount quote',
    reason:
      'Recognizing the native quote type prevents a bank discount rate from being mistaken for a dollar price or a return on invested cash.',
    conditions: 'Retain face units, remaining days and the quotation basis.',
    sources: ['bill_quotation'],
  },
  {
    id: 'bank_discount_rate__money_market_yield',
    source: 'bank_discount_rate',
    target: 'money_market_yield',
    kind: 'measurement',
    label: 'changes the return base',
    reason:
      'For the same single redemption and Actual/360 interval, switching from face value to purchase price gives y = d / (1 − dD/360).',
    conditions:
      'Positive purchase price, positive remaining days and no intervening cash flows.',
    sources: ['bill_quotation', 'cfa_valuation'],
  },
  {
    id: 'money_market_yield__benchmark_matching',
    source: 'money_market_yield',
    target: 'benchmark_matching',
    kind: 'comparison',
    label: 'aligns rate conventions',
    reason:
      'A simple Actual/360 yield is comparable to another rate only after the cash-flow, compounding and timing conventions are reconciled.',
    conditions:
      'Do not treat it as Treasury coupon-equivalent yield by default.',
    sources: ['bill_quotation', 'cfa_valuation'],
  },
  {
    id: 'benchmark_matching__yield_to_worst',
    source: 'benchmark_matching',
    target: 'yield_to_worst',
    kind: 'comparison',
    label: 'identifies the redemption scenario',
    reason:
      'A yield-to-worst comparison needs the selected call or maturity scenario as well as compatible benchmark and yield conventions.',
    conditions:
      'The chosen redemption date can differ from legal final maturity.',
    sources: ['return_public', 'cfa_valuation'],
  },
  {
    id: 'callable__yield_to_worst',
    source: 'callable',
    target: 'yield_to_worst',
    kind: 'definition',
    label: 'supplies the call scenarios',
    reason:
      'The issuer’s eligible contractual call dates and redemption prices determine which yield-to-call cases enter the comparison.',
    conditions:
      'YTW is conditional on the specified non-default payments, not a minimum realized return.',
    sources: ['return_public'],
  },
  {
    id: 'repo__repo_interest',
    source: 'repo',
    target: 'repo_interest',
    kind: 'definition',
    label: 'sets the financing terms',
    reason:
      'The repo agreement identifies the cash advanced, financing rate, day count and payment terms needed for the interest calculation.',
    conditions:
      'Balance changes and collateral income may require additional treatment.',
    sources: ['repo_accrual', 'repo_public'],
  },
  {
    id: 'repo_interest__carry',
    source: 'repo_interest',
    target: 'carry',
    kind: 'mechanism',
    label: 'reduces running income',
    reason:
      'Positive financing interest is a cost to the funded holder and reduces running income after financing under the stated carry convention.',
    conditions:
      'The asset income and financing cost must cover the same period; negative rates reverse the interest sign.',
    sources: ['repo_accrual', 'carry_public'],
  },
  {
    id: 'carry__horizon_date',
    source: 'carry',
    target: 'horizon_date',
    kind: 'measurement',
    label: 'uses a defined holding interval',
    reason:
      'Running income and financing expense need the same start and end dates before they can be combined in a holding-period scenario.',
    conditions:
      'State any changes in rate or funded balance during the interval.',
    sources: ['carry_public', 'return_public'],
  },
  {
    id: 'horizon_date__total_return',
    source: 'horizon_date',
    target: 'total_return',
    kind: 'measurement',
    label: 'sets the return endpoint',
    reason:
      'The chosen horizon determines which distributions enter the cash bucket and when the remaining security is measured.',
    conditions:
      'Do not count a principal repayment both as cash and as part of the remaining position.',
    sources: ['return_public', 'formulas'],
  },
  {
    id: 'io__io_notional',
    source: 'io',
    target: 'io_notional',
    kind: 'definition',
    label: 'uses a reference balance',
    reason:
      'An IO class calculates designated interest using a notional reference balance without receiving that notional as principal cash.',
    conditions:
      'The class supplement controls allocation and interest-accrual rules.',
    sources: ['smbs'],
  },
  {
    id: 'io_notional__cash_flows',
    source: 'io_notional',
    target: 'cash_flows',
    kind: 'measurement',
    label: 'determines designated interest',
    reason:
      'For a notional-times-coupon class, the applicable balance and accrual fraction determine interest; a notional reduction is not principal received.',
    conditions:
      'Do not apply a simple fixed-notional formula to every excess-interest structure.',
    sources: ['smbs', 'structure'],
  },
  {
    id: 'as_of__analytics_context',
    source: 'as_of',
    target: 'analytics_context',
    kind: 'definition',
    label: 'dates the market inputs',
    reason:
      'Reconstructing a result requires the effective information date and market snapshot, not merely the date on which the output was viewed.',
    conditions: 'Retain observation and publication times when they differ.',
    sources: ['analytics_market_data', 'sofr_dates'],
  },
  {
    id: 'horizon_date__analytics_context',
    source: 'horizon_date',
    target: 'analytics_context',
    kind: 'definition',
    label: 'records the scenario endpoint',
    reason:
      'A reproducible holding-period result records its endpoint with cash-flow, reinvestment, funding and terminal-value assumptions.',
    conditions:
      'Historical observations and forward scenario assumptions must remain distinguishable.',
    sources: ['analytics_market_data', 'formulas'],
  },
  {
    id: 'analytics_context__curve_anchor',
    source: 'analytics_context',
    target: 'curve_anchor',
    kind: 'definition',
    label: 'preserves the curve clock',
    reason:
      'A result’s input context records the curve reference date as well as the instrument conventions needed to interpret its nodes.',
    conditions:
      'A visible market-source label alone does not identify all these choices.',
    sources: ['analytics_market_data', 'date_adjustments'],
  },
];

export const contract_paths = [
  {
    id: 'contract_clock_to_curve',
    title: 'From a contract clock to a curve',
    description:
      'Separate the anchor, IMM boundary and accrual interval before comparing forward and futures rates.',
    steps: [
      'curve_anchor',
      'imm_dates',
      'accrual_period',
      'forward_rate_agreement',
      'futures_curve',
      'futures_convexity',
    ],
  },
  {
    id: 'quote_basis_to_redemption',
    title: 'What does this yield actually mean?',
    description:
      'Read the quote base, align the convention and identify the assumed redemption.',
    steps: [
      'quote_context',
      'bank_discount_rate',
      'money_market_yield',
      'benchmark_matching',
      'yield_to_worst',
      'callable',
    ],
  },
  {
    id: 'financing_to_horizon',
    title: 'From financing cash to holding-period return',
    description:
      'Follow cash advanced through financing interest, carry and the chosen return endpoint.',
    steps: ['repo', 'repo_interest', 'carry', 'horizon_date', 'total_return'],
  },
  {
    id: 'snapshot_to_curve_point',
    title: 'Reconstruct a curve comparison',
    description:
      'Preserve the snapshot and time coordinates before applying interpolation and comparing benchmarks.',
    steps: [
      'as_of',
      'analytics_context',
      'curve_anchor',
      'curve_pillar',
      'curve_interpolation',
      'benchmark_matching',
    ],
  },
];
