import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';
import type { ComparisonSet } from './atlas_extensions.ts';

// Public date and curve conventions. Examples are explanatory, not market data
// or a specification for any employer's analytics service.
export const context_sources = {
  settlement_dates: {
    publisher: 'FINRA',
    title: 'Understanding settlement cycles',
    url: 'https://www.finra.org/investors/insights/understanding-settlement-cycles',
  },
  sofr_dates: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'SOFR: reference rate and publication',
    url: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  },
  boe_curves: {
    publisher: 'Bank of England',
    title: 'Yield curves: maturities, dates and conventions',
    url: 'https://www.bankofengland.co.uk/statistics/yield-curves',
  },
  ecb_curves: {
    publisher: 'European Central Bank',
    title: 'Euro area yield curve methodology',
    url: 'https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_area_yield_curves/shared/pdf/technical_notes.pdf',
  },
  term_sofr: {
    publisher: 'CME Group',
    title: 'Term SOFR reference rates',
    url: 'https://www.cmegroup.com/market-data/cme-group-benchmark-administration/term-sofr.html',
  },
  sofr_futures: {
    publisher: 'CME Group',
    title: 'Three-Month SOFR futures: quotation and reference quarter',
    url: 'https://www.cmegroup.com/markets/interest-rates/stirs/three-month-sofr.contractSpecs.html',
  },
  treasury_strips: {
    publisher: 'U.S. Treasury',
    title:
      'Separate Trading of Registered Interest and Principal of Securities',
    url: 'https://www.treasurydirect.gov/marketable-securities/strips/',
  },
};

export const context_topics = [
  {
    id: 'date_context',
    branch: 'valuation',
    title: 'Which date starts the clock?',
    concepts: ['as_of', 'trade_date', 'original_maturity'],
  },
  {
    id: 'curve_context',
    branch: 'curves',
    title: 'Reading a curve point',
    concepts: [
      'quote_context',
      'curve_nodes',
      'constant_maturity',
      'curve_interpolation',
    ],
  },
  {
    id: 'dated_references',
    branch: 'curves',
    title: 'Terms, contracts and payments',
    concepts: ['term_sofr', 'futures_curve', 'treasury_strips'],
  },
];

export const context_concepts: MortgageConcept[] = [
  {
    id: 'as_of',
    branch: 'valuation',
    topic: 'date_context',
    title: 'As-of date & timestamp',
    subtitle: 'When the information belongs',
    aliases: [
      'asof',
      'valuation date',
      'market date',
      'observation date',
      'UTC',
      'timezone',
    ],
    summary:
      'An as-of label states the effective date or time of a snapshot. An observation time, a publication time and the date chosen for valuation can be different.',
    distinction:
      'A file downloaded today can contain yesterday’s observations. Historical analytics also need contemporaneous prices, curves, settlement and documented model assumptions. Changing only the valuation date does not recreate a historical result. State the time zone and whether the label means observed, published or valued.',
    question:
      'Does a rate published this morning necessarily describe this morning’s transactions?',
    answer:
      'No. Overnight SOFR is published on the next business day for the preceding business day’s transactions. Preserve the rate’s effective date when comparing observations.',
    sources: ['sofr_dates', 'boe_curves'],
    links: [
      {
        id: 'quote_context',
        reason:
          'A number needs an observation context before it can be compared.',
      },
      {
        id: 'settlement',
        reason:
          'The information date and the securities delivery date answer different questions.',
      },
    ],
  },
  {
    id: 'trade_date',
    branch: 'valuation',
    topic: 'date_context',
    title: 'Trade date',
    subtitle: 'When the transaction is agreed',
    aliases: ['execution date', 'T+1'],
    summary:
      'The trade date records execution. The settlement date records the agreed exchange of securities and cash under the market’s delivery convention.',
    distinction:
      'T+1 is a business-day convention for covered transactions, not a rule for every security. Agency TBA trades have their own settlement calendar. A quote may exist without any trade.',
    question:
      'Can two trades executed on the same day settle on different dates?',
    answer:
      'Yes. The instrument, transaction type, agreed terms and relevant calendars can differ.',
    sources: ['settlement_dates', 'tba'],
    links: [
      {
        id: 'settlement',
        reason:
          'Execution creates the transaction whose securities and cash settle later.',
      },
      {
        id: 'as_of',
        reason: 'A market snapshot is not automatically a record of execution.',
      },
    ],
  },
  {
    id: 'original_maturity',
    branch: 'valuation',
    topic: 'date_context',
    title: 'Original & remaining maturity',
    subtitle: 'The same deadline, different starting dates',
    aliases: [
      'actual maturity',
      'actual remaining maturity',
      'original term',
      'remaining term',
    ],
    summary:
      'Original maturity measures the term from issuance to contractual maturity. Remaining maturity measures the interval from a specified valuation or settlement date to that deadline.',
    distinction:
      'A ten-year bond issued two years ago has roughly eight years remaining. “Actual maturity” needs a definition: remaining contractual time is not a prediction of when a mortgage will prepay.',
    question:
      'Does an eight-year remaining term tell you the bond’s weighted-average life?',
    answer:
      'No. An amortizing security can return principal earlier. WAL depends on the principal schedule and, for mortgages, the stated prepayment assumptions.',
    sources: ['glossary', 'formulas', 'structure'],
    links: [
      {
        id: 'final_maturity',
        reason:
          'The final contractual date is the endpoint for the remaining term.',
      },
      {
        id: 'tenor',
        reason:
          'A benchmark tenor can retain its name while the underlying bond ages.',
      },
      {
        id: 'wal',
        reason:
          'A single final date cannot describe a stream of principal repayments.',
      },
    ],
  },
  {
    id: 'quote_context',
    branch: 'curves',
    topic: 'curve_context',
    title: 'Quote context',
    subtitle: 'What must travel with a number',
    aliases: [
      'market source',
      'quote type',
      'yield table',
      'benchmark table',
      'bid ask',
      'market timestamp',
    ],
    summary:
      'A useful comparison preserves the source, observation time, currency, instrument or index, quote side, units and rate convention. A displayed yield alone leaves much of that meaning unstated.',
    distinction:
      'An executable quote offers terms subject to its size, time and conditions; an indicative quote is an indication. An evaluated price is an estimate using observations and methodology. TRACE reports executed trades, which can have earlier execution times or later corrections. None automatically establishes a price available to trade now. Missing observations are not zero.',
    question:
      'A TRACE trade and an evaluated price both show 99. Does that establish an executable offer at 99 now?',
    answer:
      'No. One records a completed trade and the other is a valuation estimate. Check a current executable quote, including its side, size, time, settlement and conditions.',
    sources: ['trace_transactions', 'evaluated_pricing', 'ecb_curves'],
    links: [
      {
        id: 'benchmark_matching',
        reason: 'A spread has meaning only after its reference is identified.',
      },
      {
        id: 'as_of',
        reason:
          'Observations from different times can create a misleading comparison.',
      },
      {
        id: 'curve_nodes',
        reason:
          'The column heading must describe the point actually represented.',
      },
    ],
  },
  {
    id: 'curve_nodes',
    branch: 'curves',
    topic: 'curve_context',
    title: 'Curve nodes & tenor labels',
    subtitle: 'A point is more than its column heading',
    aliases: [
      'nominal maturity',
      'nominal maturity tenor',
      'curve point',
      'maturity grid',
      '6M',
      '20Y',
      '30Y',
    ],
    summary:
      'A curve node can represent a quoted instrument, a contractual period or an estimated value at a standard horizon. Those objects need different labels even when shown in the same table.',
    distinction:
      'A nominal tenor such as 20Y names the intended horizon or benchmark role; here nominal does not mean inflation-unadjusted. Available points depend on the source, curve family, currency and observation date.',
    question:
      'Can you relabel a bond with 19 years remaining as a 20Y curve estimate?',
    answer:
      'Only an explicit benchmark or estimation convention can justify that label. A nearby raw observation does not by itself become a constant-maturity estimate. Preserve its date and identity.',
    sources: ['ecb_curves', 'treasury_curve'],
    links: [
      {
        id: 'tenor',
        reason:
          'The named horizon and an instrument’s remaining time are separate attributes.',
      },
      {
        id: 'constant_maturity',
        reason:
          'A fixed-horizon estimate can be derived from instruments with other maturities.',
      },
      {
        id: 'curve_interpolation',
        reason:
          'An absent point may require an explicit estimation method rather than a substitute label.',
      },
    ],
  },
  {
    id: 'constant_maturity',
    branch: 'curves',
    topic: 'curve_context',
    title: 'Constant-maturity reference',
    subtitle: 'The horizon stays fixed as bonds age',
    aliases: ['CMT', 'government curve', 'GOVT', 'benchmark maturity'],
    summary:
      'A constant-maturity series refers to a fixed remaining horizon on each observation date. It can be estimated from a yield curve rather than taken from a bond with exactly that remaining life.',
    distinction:
      'A 10Y par reference, the yield of an on-the-run ten-year note and a 10Y zero rate are distinct quantities. U.S. Treasury reference horizons include 2Y, 5Y, 10Y, 20Y and 30Y; consult the dated source for the full grid.',
    question:
      'Why can a ten-year reference exist without a bond maturing exactly ten years from today?',
    answer:
      'The provider can evaluate an estimated curve at that horizon. The estimate inherits the provider’s instrument selection, fitting method and conventions.',
    sources: ['treasury_curve', 'ecb_curves'],
    links: [
      {
        id: 'par_curve',
        reason:
          'Treasury par reference rates describe hypothetical coupon-bearing instruments.',
      },
      {
        id: 'curve_interpolation',
        reason:
          'The maturity grid can differ from the maturities of the fitted instruments.',
      },
    ],
  },
  {
    id: 'curve_interpolation',
    branch: 'curves',
    topic: 'curve_context',
    title: 'Interpolation & missing points',
    subtitle: 'An estimate must say how it was made',
    aliases: [
      'interpolate',
      'extrapolation',
      'nearest node',
      'missing yield',
      'NaN',
    ],
    summary:
      'Interpolation estimates between available points under a stated method. Extrapolation extends beyond their range. Choosing a nearby observation is a separate operation.',
    distinction:
      'Linear interpolation of yields and interpolation of discount factors need not agree. A blank or non-finite quote is unavailable, not zero; a finite zero or negative rate can be valid.',
    question:
      'The closest maturity has no usable yield. Does its distance make it a valid reference?',
    answer:
      'No. First establish the node’s meaning and data validity. Any fallback or fitted value needs an explicit method and label; proximity alone is insufficient.',
    sources: ['ecb_curves', 'cfa_valuation'],
    links: [
      {
        id: 'discount_factor',
        reason: 'The quantity being interpolated changes the implied curve.',
      },
      {
        id: 'benchmark_matching',
        reason:
          'Estimated reference yields inherit the chosen fitting convention.',
      },
    ],
  },
  {
    id: 'term_sofr',
    branch: 'curves',
    topic: 'dated_references',
    title: 'Term SOFR',
    subtitle: 'A forward-looking term reference',
    aliases: ['CME Term SOFR', '1M', '3M', '12M'],
    summary:
      'CME Term SOFR provides forward-looking reference rates for 1M, 3M, 6M and 12M periods. Its methodology uses derivatives-market information.',
    distinction:
      'A three-month Term SOFR fixing, three months of realized overnight SOFR and a three-month SOFR futures contract are different objects. A 10Y SOFR swap adds another meaning of term.',
    question:
      'Does a three-month floating coupon necessarily use three-month Term SOFR?',
    answer:
      'No. The contract may instead compound overnight SOFR over an observation window. Read the specified index and accrual rule.',
    sources: ['term_sofr', 'arrc'],
    links: [
      {
        id: 'sofr',
        reason:
          'Term SOFR is related to the overnight benchmark but has a different construction.',
      },
      {
        id: 'ois',
        reason: 'The swap maturity is not the tenor of a floating-rate fixing.',
      },
      {
        id: 'floater',
        reason:
          'A floating coupon identifies its contractual reference and reset convention.',
      },
    ],
  },
  {
    id: 'futures_curve',
    branch: 'curves',
    topic: 'dated_references',
    title: 'SOFR futures strip',
    subtitle: 'A sequence of dated reference periods',
    aliases: [
      'futures curve',
      'contract date',
      'SR3',
      'strip',
      'Eurodollar futures',
    ],
    summary:
      'A SOFR futures strip is a sequence of contracts. Each three-month contract references overnight compounding over a specified quarter between IMM dates, rather than an arbitrary whole-year horizon.',
    distinction:
      'CME SR3 trades at 100 minus an implied annualized rate; final settlement uses realized compounded SOFR over the reference quarter. Historical Eurodollar futures referenced three-month USD LIBOR, not euro-currency rates; that term fixing differs from overnight SOFR compounded in arrears. A futures strip is not Treasury STRIPS.',
    formula: {
      expression: 'Q = 100 − R; r = R/100',
      assumptions:
        'Q is the IMM futures index quote and R is the annualized rate in percentage points. The decimal rate r is used in interest calculations. At final SR3 settlement, R is realized compounded SOFR for the reference quarter; before then it is the rate implied by the traded quote, not a guaranteed forecast.',
      example:
        'A hypothetical quote of 95.25 implies R = 4.75 and r = 0.0475. It does not mean buying a bond for $95.25 per $100 principal.',
    },
    question:
      'Why might the next contract fail to line up with a 6M table column?',
    answer:
      'Its reference quarter follows contract dates while 6M is measured from a chosen anchor. Replacing those dates with a rounded label hides which accrual period is being priced.',
    sources: ['sofr_futures', 'sofr_contract_period', 'imm_calendar'],
    links: [
      {
        id: 'imm_dates',
        reason:
          'The named month identifies the beginning of the reference quarter.',
      },
      {
        id: 'forward_curve',
        reason:
          'Dated futures convey information about forward accrual periods, subject to futures-versus-forward conventions.',
      },
      {
        id: 'term_sofr',
        reason:
          'Term benchmarks and individual contract quotes have different methodologies.',
      },
      {
        id: 'curve_nodes',
        reason:
          'Contract-defined points need labels that preserve their periods.',
      },
    ],
  },
  {
    id: 'treasury_strips',
    branch: 'curves',
    topic: 'dated_references',
    title: 'Treasury STRIPS',
    subtitle: 'Separate principal and interest payments',
    aliases: ['STRIPS', 'stripped Treasury', 'STRIP curve'],
    summary:
      'Stripping an eligible Treasury separates its principal and coupon payments into individual zero-coupon securities. Each piece has its own payment date.',
    distinction:
      'A STRIPS quote is an instrument observation, not automatically a fitted spot-curve value. Its remaining maturity follows its payment date. Do not confuse Treasury STRIPS with a sequence of futures contracts.',
    question:
      'Does every separated payment mature on the original bond’s final date?',
    answer:
      'No. Coupon STRIPS mature on their respective coupon dates; the principal component matures on the original principal repayment date.',
    sources: ['treasury_strips'],
    links: [
      {
        id: 'zero_coupon',
        reason: 'Each separated payment is a zero-coupon security.',
      },
      {
        id: 'spot_curve',
        reason:
          'Single-payment instruments inform zero-rate comparisons but observed and fitted rates remain distinct.',
      },
    ],
  },
];

const relation = (
  source: string,
  target: string,
  label: string,
  reason: string,
  kind: MortgageRelationship['kind'],
  sources: string[],
  conditions: string,
): MortgageRelationship => ({
  id: `context_${source}__${target}`,
  source,
  target,
  label,
  reason,
  kind,
  sources,
  conditions,
});
export const context_relationships: MortgageRelationship[] = [
  relation(
    'prepayments',
    'smm',
    'measured monthly',
    'SMM expresses unscheduled principal repayment relative to the balance after scheduled principal for the month.',
    'measurement',
    ['formulas'],
    'Use scheduled principal and the same monthly balance convention; default-related removals require the stated reporting treatment.',
  ),
  relation(
    'psa',
    'cpr',
    'specifies an age-based CPR',
    'At 100% PSA, annualized CPR rises by 0.2 percentage points per loan-age month to 6% at month 30, then stays at 6%.',
    'definition',
    ['formulas', 'guide'],
    'This is the standard benchmark, not a forecast. A pool’s weighted-average age can conceal loans at different points on the ramp.',
  ),
  relation(
    'benchmark_matching',
    'nominal_spread',
    'identifies the reference yield',
    'A yield difference requires a chosen reference, maturity treatment and aligned quotation conventions.',
    'definition',
    ['formulas', 'fed_spreads'],
    'Applicable to yield-subtraction spreads; a cash-flow or option-adjusted spread requires its own method.',
  ),
  relation(
    'as_of',
    'quote_context',
    'dates the observation',
    'The effective market time belongs with the reported quote and its source.',
    'definition',
    ['sofr_dates'],
    'Publication time can follow observation time; preserve the specified time zone and business-day calendar.',
  ),
  relation(
    'as_of',
    'settlement',
    'separates information from delivery',
    'The time at which inputs are observed need not be the date on which securities and cash exchange.',
    'comparison',
    ['settlement_dates', 'sofr_dates'],
    'A valuation can use an assumed settlement date even without an executed trade.',
  ),
  relation(
    'trade_date',
    'settlement',
    'precedes agreed delivery',
    'Execution and delivery are separate events with a market-specific settlement convention.',
    'definition',
    ['settlement_dates', 'tba'],
    'Do not apply the ordinary T+1 rule to every transaction or to all TBA settlements.',
  ),
  relation(
    'original_maturity',
    'final_maturity',
    'uses the contractual endpoint',
    'Original and remaining maturity use different starting dates and the contractual final date as their endpoint.',
    'measurement',
    ['glossary', 'formulas'],
    'State the anchor date and day-count basis; early principal return does not redefine the legal deadline.',
  ),
  relation(
    'original_maturity',
    'wal',
    'differs from principal timing',
    'A final contractual horizon cannot substitute for the weighted timing of projected principal payments.',
    'comparison',
    ['formulas'],
    'WAL for mortgages depends on the assumed amortization, prepayment and relevant loss treatment.',
  ),
  relation(
    'settlement',
    'original_maturity',
    'can anchor the remaining term',
    'A settlement-based yield measures remaining cash-flow times from the agreed settlement date.',
    'measurement',
    ['formulas'],
    'Original maturity still starts at issuance. Other analyses can use a stated valuation date as their anchor.',
  ),
  relation(
    'original_maturity',
    'curve_nodes',
    'differs from a standard horizon',
    'An instrument’s remaining contractual term can differ from its original issuance tenor and from the horizon of a curve estimate.',
    'comparison',
    ['treasury_curve', 'formulas'],
    'Keep the instrument identity and measurement date explicit; a rounded label is not a new contractual maturity.',
  ),
  relation(
    'curve_nodes',
    'quote_context',
    'identifies the quoted horizon',
    'The node definition tells a reader whether the value refers to an instrument, an accrual period or an estimated maturity point.',
    'definition',
    ['ecb_curves', 'sofr_futures'],
    'Curve family and units must accompany the label before values can be compared.',
  ),
  relation(
    'quote_context',
    'benchmark_matching',
    'establishes comparability',
    'The reference index, currency, effective time and conventions determine whether two rates answer the same question.',
    'definition',
    ['ecb_curves', 'formulas'],
    'Equal units or tenor labels alone do not establish equivalent instruments or curve measures.',
  ),
  relation(
    'curve_nodes',
    'tenor',
    'names the intended horizon',
    'A node’s label can identify a standard horizon while its underlying instrument has dated cash flows.',
    'definition',
    ['treasury_curve', 'ecb_curves'],
    'A node may be observed or estimated; retain that distinction and the provider’s definition.',
  ),
  relation(
    'curve_nodes',
    'curve_interpolation',
    'may require estimation',
    'Requested horizons can differ from available observations, making the estimation method material.',
    'mechanism',
    ['ecb_curves'],
    'Only if the chosen curve construction estimates that horizon; do not invent a value for an unsupported point.',
  ),
  relation(
    'constant_maturity',
    'par_curve',
    'can report a par reference',
    'A constant-horizon par yield describes a hypothetical coupon-bearing bond at that horizon.',
    'definition',
    ['treasury_curve'],
    'This describes par CMT references, not every constant-horizon series or zero-rate estimate.',
  ),
  relation(
    'curve_interpolation',
    'discount_factor',
    'depends on the fitted quantity',
    'Interpolating discount factors can produce different rates from interpolating yields directly.',
    'comparison',
    ['cfa_valuation', 'ecb_curves'],
    'Hold input conventions and the target date fixed when comparing methods.',
  ),
  relation(
    'term_sofr',
    'sofr',
    'differs from overnight fixing',
    'Term SOFR is forward-looking for specified tenors; overnight SOFR reports a defined overnight transaction market.',
    'comparison',
    ['term_sofr', 'sofr_dates'],
    'A contractual index must be identified rather than inferred from the payment frequency.',
  ),
  relation(
    'term_sofr',
    'ois',
    'differs from swap maturity',
    'The term of a rate fixing and the maturity of a fixed-versus-overnight swap describe different periods.',
    'comparison',
    ['term_sofr', 'arrc'],
    'Use the actual contract’s index, reset schedule and maturity.',
  ),
  relation(
    'futures_curve',
    'forward_curve',
    'references future accrual periods',
    'SOFR futures contracts price specified overnight accrual periods that inform forward-rate analysis.',
    'measurement',
    ['sofr_futures'],
    'Futures settlement and daily margining differ from a forward or OIS contract; do not equate raw quotes without the relevant adjustments.',
  ),
  relation(
    'futures_curve',
    'curve_nodes',
    'uses contract dates',
    'A contract-based curve carries reference-period dates that a rounded whole-year label can obscure.',
    'definition',
    ['sofr_futures'],
    'Reference-period start, end and last trading date are not interchangeable.',
  ),
  relation(
    'treasury_strips',
    'zero_coupon',
    'separates single payments',
    'Each separated principal or interest component becomes an individual single-payment security.',
    'definition',
    ['treasury_strips'],
    'Applies to eligible stripped Treasuries; bills and floating-rate notes cannot be stripped.',
  ),
];

export const context_comparisons: ComparisonSet[] = [
  {
    id: 'dates',
    title: 'Which date does this number belong to?',
    eyebrow: '05 / DATES',
    intro:
      'A quote, a trade and a payment run on different clocks. Keep each date attached to the event it describes.',
    takeaway:
      'Read a yield table with both its market snapshot and settlement assumptions in view. Then distinguish the remaining contractual term from modeled principal timing.',
    columns: [
      'Date or interval',
      'Question answered',
      'Reference point',
      'Example',
      'Common confusion',
    ],
    rows: [
      {
        id: 'as_of',
        cells: [
          'As-of / observation',
          'When were the inputs effective?',
          'Specified market snapshot and time zone',
          'Prior-business-day observations published today',
          'Download time is not observation time.',
        ],
      },
      {
        id: 'trade_date',
        cells: [
          'Trade date',
          'When was the transaction executed?',
          'Execution event',
          'A trade agreed today for later delivery',
          'A quote is not necessarily a trade.',
        ],
      },
      {
        id: 'settlement',
        cells: [
          'Settlement date',
          'When do securities and cash exchange?',
          'Agreed delivery and applicable calendar',
          'The starting date for a quoted settlement-based yield',
          'TBA delivery is not a universal T+1 rule.',
        ],
      },
      {
        id: 'payment_delay',
        cells: [
          'Payment date',
          'When does the investor receive cash?',
          'Contractual distribution schedule',
          'MBS interest received after its accrual period',
          'Accrual end and payment date can differ.',
        ],
      },
      {
        id: 'original_maturity',
        cells: [
          'Original / remaining term',
          'How much contractual time?',
          'Issuance / stated valuation or settlement date',
          'A 10Y bond after two years: about 8Y remaining',
          'Remaining term is not realized or forecast payoff time.',
        ],
      },
      {
        id: 'curve_nodes',
        cells: [
          'Nominal tenor label',
          'Which standard horizon or benchmark role?',
          'Provider’s curve definition',
          'A 20Y estimated curve point',
          'The label does not prove an exact 20Y bond exists.',
        ],
      },
    ],
  },
  {
    id: 'curves',
    title: 'A family of curves, several meanings of tenor.',
    eyebrow: '06 / CURVES',
    intro:
      'These are public reference examples, not a universal quote grid. A curve’s measure, currency, instruments and dated methodology determine its available horizons.',
    takeaway:
      'A government or swap label identifies a reference family; par, spot and forward identify rate measures. Check the dated provider specification before carrying a tenor grid into another currency or curve.',
    columns: [
      'Curve or reference',
      'What the rate describes',
      'Tenor meaning',
      'Public example',
      'Before comparing',
    ],
    rows: [
      {
        id: 'constant_maturity',
        cells: [
          'Government par',
          'A hypothetical coupon rate at par',
          'Fixed remaining horizon',
          'USD Treasury: e.g. 2Y, 5Y, 10Y, 20Y, 30Y',
          'A CMT estimate is not an exact-maturity bond quote.',
        ],
      },
      {
        id: 'swap_curve',
        cells: [
          'Swap par',
          'The fixed rate balancing the swap legs',
          'Maturity of the swap',
          'A 10Y swap tied to a specified index',
          'A legacy term-index swap and RFR OIS are distinct.',
        ],
      },
      {
        id: 'ois',
        cells: [
          'RFR / OIS',
          'Fixed interest versus overnight accrual',
          'Swap maturity, not overnight index tenor',
          'BoE SONIA OIS estimates extend to 25Y; range varies with reliable inputs',
          'Currency, index and observation rules matter.',
        ],
      },
      {
        id: 'spot_curve',
        cells: [
          'Spot / zero',
          'Discounting for a single payment date',
          'Time to that payment',
          'ECB euro-area estimates cover 3M–30Y',
          'A fitted zero rate is not a coupon-bond yield.',
        ],
      },
      {
        id: 'forward_curve',
        cells: [
          'Forward',
          'A rate implied between future dates',
          'Start plus interval, or an instantaneous horizon',
          'BoE publishes instantaneous forward curves',
          'A 2Y instantaneous forward is not a 2Y loan rate.',
        ],
      },
      {
        id: 'treasury_strips',
        cells: [
          'Treasury STRIPS',
          'An individual separated Treasury payment',
          'Time to the piece’s payment date',
          'Coupon and principal components have their own dates',
          'Observed STRIPS and a fitted zero curve differ.',
        ],
      },
      {
        id: 'futures_curve',
        cells: [
          'SOFR futures strip',
          'Compounded SOFR over contract reference quarters',
          'Dated IMM periods',
          'Quarterly SR3 contracts; traded quote = 100 − implied annualized rate',
          'Contract period, expiry and 6M-from-today differ.',
        ],
      },
      {
        id: 'term_sofr',
        cells: [
          'Term SOFR fixing',
          'A forward-looking term reference',
          'Specified fixing tenor',
          'CME: 1M, 3M, 6M, 12M',
          'This is not a complete swap or discount curve.',
        ],
      },
    ],
  },
];

export const context_paths = [
  {
    id: 'reading_a_yield_table',
    title: 'Before comparing two yields',
    description:
      'Identify the observation, delivery date and curve point before interpreting a spread.',
    steps: [
      'as_of',
      'settlement',
      'original_maturity',
      'curve_nodes',
      'quote_context',
      'benchmark_matching',
      'nominal_spread',
    ],
  },
];
