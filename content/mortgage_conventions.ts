import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';
import type { ComparisonSet } from './atlas_extensions.ts';

export const convention_sources = {
  sifma_calendar: {
    publisher: 'SIFMA',
    title: 'Holiday recommendations · trading hours and settlement distinction',
    url: 'https://www.sifma.org/resources/general/holiday-schedule',
  },
  fed_calendar: {
    publisher: 'Federal Reserve Financial Services',
    title: 'Holiday schedules · payment-service operating days',
    url: 'https://www.frbservices.org/about/holiday-schedules/',
  },
  date_conventions: {
    publisher: 'Goldman Sachs · SEC filing',
    title: 'Debt prospectus · business-day adjustment conventions',
    url: 'https://www.sec.gov/Archives/edgar/data/886982/000119312525027378/d860775d424b2.htm',
  },
  factor_disclosure: {
    publisher: 'Freddie Mac',
    title: 'UMBS and MBS Offering Circular · May 2026, pool factors',
    url: 'https://capitalmarkets.freddiemac.com/mbs/docs/umbs_mbs_oc_050126.pdf',
  },
  cme_curve_conventions: {
    publisher: 'CME Group',
    title: 'SOFR data FAQ · zero rates, year fractions and discount factors',
    url: 'https://www.cmegroup.com/market-data/faq-sofr-third-party-data.html',
  },
  curve_validation_public: {
    publisher: 'Office of the Comptroller of the Currency',
    title: 'Model Risk Management · revised guidance, 2026',
    url: 'https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html',
  },
  umbs_public: {
    publisher: 'Federal Housing Finance Agency',
    title: 'Single Security Initiative and Common Securitization Platform',
    url: 'https://www.fhfa.gov/policy/single-security-initiative-and-common-securitization-platform',
  },
  agency_basis_public: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Defragmenting Markets · Fannie, Freddie and Ginnie comparisons',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr965.pdf',
  },
  rating_status_public: {
    publisher: 'Morningstar DBRS',
    title: 'Product Guide · rating scales and status designations',
    url: 'https://dbrs.morningstar.com/media/DBRSM-Product-Guide.pdf',
  },
  option_greeks_public: {
    publisher: 'CME Group',
    title: 'Options Premium and the Greeks',
    url: 'https://www.cmegroup.com/education/courses/option-greeks/options-the-greeks-options-premium-and-the-greeks',
  },
};

export const convention_topics = [
  {
    id: 'calendar_rules',
    branch: 'valuation',
    title: 'Calendars and payment dates',
    concepts: ['business_calendars', 'date_adjustment'],
  },
  {
    id: 'factor_reporting',
    branch: 'basics',
    title: 'Which balance is reported?',
    concepts: ['factor_vintage'],
  },
  {
    id: 'rate_representation',
    branch: 'curves',
    title: 'From a quoted rate to discounting',
    concepts: ['rate_compounding', 'forward_interval', 'curve_validation'],
  },
  {
    id: 'agency_comparisons',
    branch: 'trading',
    title: 'Comparing agency securities',
    concepts: ['umbs', 'agency_price_basis'],
  },
  {
    id: 'rating_labels',
    branch: 'credit',
    title: 'Reading a status label',
    concepts: ['rating_status'],
  },
  {
    id: 'option_coordinates',
    branch: 'risk',
    title: 'Which risk coordinate?',
    concepts: ['option_greeks'],
  },
];

export const convention_concepts: MortgageConcept[] = [
  {
    id: 'business_calendars',
    branch: 'valuation',
    topic: 'calendar_rules',
    title: 'Trading & settlement calendars',
    subtitle: 'A business day for which activity?',
    aliases: [
      'holiday calendar',
      'SIFMA calendar',
      'Fedwire',
      'Good Friday',
      'business day',
    ],
    summary:
      'Trading hours, securities settlement and payment-system availability follow distinct calendars. A market early close does not by itself close the system that transfers cash.',
    distinction:
      'Check the market, service, year and currency. For example, SIFMA recommended a noon U.S. fixed-income close on Good Friday 2026; Good Friday is not on the Federal Reserve holiday list. Neither observation alone supplies a security’s contractual settlement rule.',
    question:
      'Does a bond-market early close automatically mean cash cannot settle that day?',
    answer:
      'No. Check the applicable payment-service calendar and the transaction’s settlement terms separately.',
    links: [
      {
        id: 'settlement',
        reason:
          'Delivery requires the calendars applicable to that transaction.',
      },
      {
        id: 'date_adjustment',
        reason:
          'A calendar identifies eligible dates; a convention chooses how to move a date.',
      },
    ],
    sources: ['sifma_calendar', 'fed_calendar'],
  },
  {
    id: 'date_adjustment',
    branch: 'valuation',
    topic: 'calendar_rules',
    title: 'Business-day adjustments',
    subtitle: 'Following is not modified following',
    aliases: [
      'modified following',
      'following',
      'preceding',
      'business day convention',
    ],
    summary:
      'Following moves a nonbusiness date to the next business day. Modified following does the same unless it crosses into a new month, in which case it uses the preceding business day. Preceding moves backward.',
    distinction:
      'A moved payment date need not move the interest-period boundary. Contracts distinguish adjusted and unadjusted accrual schedules. Month-end rules, calendars and maturity exceptions also need their own definitions.',
    question:
      'A scheduled month-end Sunday is followed by a business Monday in the next month. What does modified following do?',
    answer:
      'It moves backward to the preceding business day in the original month, assuming no contract-specific exception.',
    links: [
      {
        id: 'business_calendars',
        reason: 'The rule needs a named calendar to identify business days.',
      },
      {
        id: 'day_count',
        reason:
          'Accrual can follow different boundaries from the actual payment date.',
      },
    ],
    sources: ['date_conventions'],
  },
  {
    id: 'factor_vintage',
    branch: 'basics',
    topic: 'factor_reporting',
    title: 'Factor month & publication date',
    subtitle: 'A new file can describe a later balance',
    aliases: [
      'factor month',
      'factor date',
      'cutoff balance',
      'cut-off balance',
      'current balance',
      'reporting month',
    ],
    summary:
      'A factor needs its security identifier, applicable month and publication date. Those labels determine which principal balance it describes and when that information became available.',
    distinction:
      'Freddie Mac’s May 2026 circular says monthly factors reflect principal after that month’s payment and are available on or about the fourth business day. Publication can precede payment. This is a program-specific convention, not a universal rule for every securitization or historical analysis.',
    formula: {
      expression:
        'Principal payment = original face × (prior factor − current factor)',
      assumptions:
        'Consecutive applicable factors for the same security and original-face basis. This is a principal distribution, not investment profit.',
      example:
        'Hypothetical factors of 0.720 and 0.715 on $100,000 original face imply a $500 principal payment.',
    },
    question:
      'Can a newly published factor reflect a principal payment that has not yet been received?',
    answer:
      'Yes. The cited program’s factor reflects the payment for its applicable month; publication and payment are different events.',
    links: [
      {
        id: 'pool_factor',
        reason:
          'The ratio becomes meaningful only with the right balance date.',
      },
      {
        id: 'as_of',
        reason:
          'Historical analysis must distinguish effective dates from information availability.',
      },
      {
        id: 'cash_flows',
        reason: 'A change in factors can identify a principal distribution.',
      },
    ],
    sources: ['factor_disclosure'],
  },
  {
    id: 'rate_compounding',
    branch: 'curves',
    topic: 'rate_representation',
    title: 'Rate compounding',
    subtitle: 'Equal percentages can imply different factors',
    aliases: [
      'continuous compounding',
      'simple interest',
      'periodic compounding',
      'nominal annual rate',
    ],
    summary:
      'A rate needs a compounding convention as well as a year fraction. Simple interest, periodic compounding and continuous compounding are different ways to encode the value of a dated payment.',
    distinction:
      '“Nominal” can mean an annual rate before within-year compounding, or a rate before inflation adjustment. State which meaning applies. An accrual day count need not match the discount curve’s convention.',
    formula: {
      expression:
        'DF_simple = 1/(1+rτ); DF_periodic = (1+r/m)^(−mτ); DF_continuous = exp(−rτ)',
      assumptions:
        'Illustrative single-date formulas. r is the rate quoted under each respective convention, τ is its year fraction, and m is periods per year; require valid positive accumulation factors. Equal numerical r does not imply economic equivalence.',
      example:
        'At a hypothetical 6% and τ = 1, annual compounding gives DF ≈ 0.943396; continuous compounding gives DF ≈ 0.941765.',
    },
    question:
      'Do identical numerical rates and payment dates guarantee identical discount factors?',
    answer:
      'No. Align compounding and year fractions, or convert the rates to an equivalent basis first.',
    links: [
      {
        id: 'day_count',
        reason: 'A year fraction and a compounding rule are separate inputs.',
      },
      {
        id: 'discount_factor',
        reason:
          'The dated factor makes different rate representations comparable.',
      },
      {
        id: 'real_yield',
        reason:
          'Nominal-versus-real terminology concerns inflation, not compounding frequency.',
      },
    ],
    sources: ['cme_curve_conventions', 'cfa_valuation'],
  },
  {
    id: 'forward_interval',
    branch: 'curves',
    topic: 'rate_representation',
    title: 'Forward start & forward tenor',
    subtitle: '1Y1Y describes two dates',
    aliases: [
      '1y1y',
      '1y 1y',
      'forward start',
      'forward tenor',
      'instantaneous forward',
    ],
    summary:
      'A 1Y1Y forward starts in one year and covers the following year. It differs from a two-year spot rate covering today to year two, and from an instantaneous forward at year one.',
    distinction:
      'The discount-factor ratio below defines a simple forward for one interval on one curve. A forward swap rate averages a schedule of payments; a projected floating index can use a separate curve. Neither is automatically this single-period rate.',
    formula: {
      expression: 'F(0; T₁,T₂) = [DF(0,T₁)/DF(0,T₂) − 1] / α',
      assumptions:
        'Single-curve no-arbitrage relationship, positive discount factors and interval year fraction α > 0. F is an annualized simple rate. Do not apply it indiscriminately to multi-curve projection or futures quotes.',
      example:
        'With hypothetical annually compounded spots of 3% at 1Y and 4% at 2Y, the 1Y1Y rate is 1.04²/1.03 − 1 ≈ 5.0097%. It is an implied rate, not a forecast.',
    },
    question: 'Does a 1Y1Y forward cover the two years starting today?',
    answer:
      'No. It covers the one-year interval beginning one year from today.',
    links: [
      {
        id: 'forward_curve',
        reason: 'A forward label needs both its start and its interval.',
      },
      {
        id: 'discount_factor',
        reason: 'The ratio compares values at the interval’s endpoints.',
      },
      {
        id: 'dual_curve',
        reason: 'Projection and discounting need not use the same curve.',
      },
    ],
    sources: ['boe_curves', 'cme_curve_conventions'],
  },
  {
    id: 'curve_validation',
    branch: 'curves',
    topic: 'rate_representation',
    title: 'Curve validation',
    subtitle: 'A fitted curve still needs diagnosis',
    aliases: [
      'curve strip failure',
      'repricing residual',
      'curve fit',
      'stale quote',
    ],
    summary:
      'Check quote timestamps, instrument identities, calendars, units and cash-flow conventions before interpreting a curve-fitting failure. Then inspect calibration residuals and sensitivity to inputs and interpolation.',
    distinction:
      'A small repricing error is necessary evidence of a fit, not proof of reliable forwards or sensible risk. Discount factors should be positive, but they need not fall monotonically when rates can be negative. Missing quotes are not zero rates.',
    question:
      'Does reproducing the input prices prove that every interpolated forward rate is reliable?',
    answer:
      'No. Input quality, conventions, interpolation and stability still need examination.',
    links: [
      {
        id: 'bootstrapping',
        reason: 'Calibration instruments provide an initial repricing check.',
      },
      {
        id: 'as_of',
        reason:
          'Mixed snapshots can create inconsistencies before fitting starts.',
      },
      {
        id: 'model_risk',
        reason: 'A successful numerical fit is only part of model validation.',
      },
    ],
    sources: ['curve_validation_public', 'ecb_curves', 'cme_curve_conventions'],
  },
  {
    id: 'umbs',
    branch: 'trading',
    topic: 'agency_comparisons',
    title: 'Uniform mortgage-backed security',
    subtitle: 'A common Fannie and Freddie market',
    aliases: ['UMBS', 'uniform MBS', 'single security', 'CSP'],
    summary:
      'UMBS aligns eligible Fannie Mae and Freddie Mac single-family pass-through securities for a common TBA market. Common securitization infrastructure supports issuance, disclosure and administration.',
    distinction:
      'Uniform does not mean identical pools, prepayment behavior or one merged guarantor. Ginnie Mae securities remain a separate program. Delivery eligibility still depends on the relevant security and transaction requirements.',
    question:
      'Does UMBS make every Fannie, Freddie and Ginnie pool interchangeable?',
    answer:
      'No. It concerns eligible Fannie and Freddie securities; pool characteristics and the separate Ginnie program still matter.',
    links: [
      {
        id: 'tba',
        reason:
          'Standardization supports common delivery and market liquidity.',
      },
      {
        id: 'agency',
        reason:
          'Security standardization does not erase the issuer and guarantee distinctions.',
      },
      {
        id: 'specified',
        reason:
          'Pools within a common market can retain different characteristics.',
      },
    ],
    sources: ['umbs_public'],
  },
  {
    id: 'agency_price_basis',
    branch: 'trading',
    topic: 'agency_comparisons',
    title: 'Cross-agency price comparison',
    subtitle: 'A price difference needs matched terms',
    aliases: ['Ginnie Fannie price spread', 'GNMA FNMA', 'Ginnie Fannie swap'],
    summary:
      'A Ginnie-versus-Fannie price comparison subtracts two specified agency price quotes. Coupon, term, settlement, quote time and price convention must be stated before interpreting the difference.',
    distinction:
      'The sign depends on the named subtraction order. A price-point difference is not a yield spread or pure credit premium: collateral, prepayment, payment timing, guarantees and market liquidity can differ. There is no universal sign convention implied by a shorthand label.',
    question:
      'Does a one-point cross-agency price difference mean a 100 bp yield advantage?',
    answer:
      'No. Price points and annual yield basis points are different units, and the securities can have different cash flows.',
    links: [
      {
        id: 'ginnie',
        reason:
          'The issuer program affects guarantees and underlying collateral.',
      },
      {
        id: 'umbs',
        reason:
          'A common Fannie/Freddie market does not absorb Ginnie securities.',
      },
      {
        id: 'pay_up',
        reason:
          'Both comparisons require aligned price units, but compare different dimensions.',
      },
    ],
    sources: ['agency_basis_public', 'tba'],
  },
  {
    id: 'rating_status',
    branch: 'credit',
    topic: 'rating_labels',
    title: 'Rating status & security status',
    subtitle: 'A missing rating is not a default grade',
    aliases: [
      'NR',
      'not rated',
      'WD',
      'withdrawn rating',
      'PIF',
      'paid in full',
    ],
    summary:
      'Not rated and withdrawn describe the availability or status of a rating opinion. Paid in full describes a repayment state. These are different dimensions from the credit grade itself.',
    distinction:
      'Abbreviations and withdrawal reasons depend on the agency or data dictionary. Check the dated rating action and security records. Neither an absent rating nor withdrawal alone establishes default; paid in full alone does not establish the investor’s total return.',
    question:
      'Can a withdrawn rating by itself establish that principal was lost?',
    answer:
      'No. Read the reason for withdrawal and the actual payment history; a rating-status label is not a loss calculation.',
    links: [
      {
        id: 'credit_rating',
        reason:
          'A rating opinion and its publication status answer different questions.',
      },
      {
        id: 'loan_states',
        reason:
          'Repayment and credit events require their own observed records.',
      },
      {
        id: 'total_return',
        reason:
          'Repayment status alone omits purchase price and prior distributions.',
      },
    ],
    sources: [
      'rating_status_public',
      'ratings_public',
      'loan_performance_glossary',
    ],
  },
  {
    id: 'option_greeks',
    branch: 'risk',
    topic: 'option_coordinates',
    title: 'Option Greeks & mortgage risk',
    subtitle: 'Name the variable before the sensitivity',
    aliases: ['delta', 'gamma', 'vega', 'theta', 'rho', 'Greeks'],
    summary:
      'Delta measures sensitivity to the underlying price; gamma measures how delta changes. Vega addresses implied volatility, theta the passage of time, and rho an interest-rate input. Units and model conventions matter.',
    distinction:
      'Bond duration and convexity usually use yield or curve shocks; option delta and gamma may use a futures price. Their signs and magnitudes cannot be transferred without translating the risk variable. Mortgage cash flows can also change with rates.',
    question:
      'Is an option’s price gamma numerically interchangeable with an MBS curve convexity?',
    answer:
      'No. They differentiate with respect to different variables and may use different units and cash-flow assumptions.',
    links: [
      {
        id: 'effective_convexity',
        reason:
          'Curve curvature needs its own shock and held-fixed assumptions.',
      },
      {
        id: 'volatility',
        reason: 'Volatility is an independent option-model input.',
      },
      {
        id: 'swaption',
        reason:
          'An explicit rate option provides a useful comparison with borrower optionality.',
      },
    ],
    sources: ['option_greeks_public', 'cfa_risk', 'embedded_options'],
  },
];

function relation(
  source: string,
  target: string,
  label: string,
  reason: string,
  sources: string[],
  conditions: string,
  kind: MortgageRelationship['kind'] = 'measurement',
): MortgageRelationship {
  return {
    id: `${source}__${target}`,
    source,
    target,
    label,
    reason,
    kind,
    sources,
    conditions,
  };
}

export const convention_relationships: MortgageRelationship[] = [
  relation(
    'price',
    'total_return',
    'supplies only part of performance',
    'Price and remaining face determine security value, while total return also includes distributions received.',
    ['bloomberg_returns_public'],
    'Use consistent accrual and timing conventions; do not count paid principal in both ending value and cash received.',
  ),
  relation(
    'as_of',
    'business_calendars',
    'dates the available observations',
    'A snapshot may contain observations from a prior session when a market is closed.',
    ['sifma_calendar', 'boe_curves'],
    'Retain effective and publication dates; do not silently relabel an old quote as live.',
  ),
  relation(
    'business_calendars',
    'date_adjustment',
    'defines eligible dates',
    'A business-day rule can choose a replacement date only against the relevant calendar.',
    ['date_conventions', 'fed_calendar'],
    'Different markets and payment services may use different calendars.',
    'definition',
  ),
  relation(
    'date_adjustment',
    'settlement',
    'qualifies the agreed delivery date',
    'The applicable transaction convention determines how a nonbusiness delivery date is handled.',
    ['date_conventions', 'tba'],
    'A swap payment convention is not a universal TBA settlement rule.',
    'definition',
  ),
  relation(
    'date_adjustment',
    'day_count',
    'may change accrual boundaries',
    'A shifted payment date changes interest only as specified by the accrual convention.',
    ['date_conventions'],
    'Distinguish adjusted accrual from payment-only adjustment.',
    'mechanism',
  ),
  relation(
    'factor_vintage',
    'pool_factor',
    'identifies the balance month',
    'The same pool has different factors over time; the applicable month identifies the balance represented.',
    ['factor_disclosure'],
    'Use the issuer’s factor definition and the security’s original-face basis.',
    'definition',
  ),
  relation(
    'as_of',
    'factor_vintage',
    'limits information availability',
    'A historical snapshot should preserve which monthly factor was published and known at that time.',
    ['factor_disclosure', 'boe_curves'],
    'A later revised file must not silently become an earlier observation.',
  ),
  relation(
    'factor_vintage',
    'cash_flows',
    'reconciles principal paid',
    'Consecutive applicable factors can identify the principal distribution on an original-face holding.',
    ['factor_disclosure'],
    'Principal returned is not a measure of investment profit.',
  ),
  relation(
    'day_count',
    'rate_compounding',
    'sets a separate rate convention',
    'A day-count fraction supplies the time input while compounding supplies the accumulation rule.',
    ['cme_curve_conventions', 'formulas'],
    'Do not infer either convention from the annual percentage alone.',
    'comparison',
  ),
  relation(
    'rate_compounding',
    'discount_factor',
    'translates the rate representation',
    'A quoted zero rate becomes a discount factor using its specified compounding and time basis.',
    ['cme_curve_conventions'],
    'Use the convention under which that rate was quoted.',
    'definition',
  ),
  relation(
    'discount_factor',
    'forward_interval',
    'implies a dated interval rate',
    'The ratio of endpoint factors supplies an implied single-period forward under one-curve assumptions.',
    ['cme_curve_conventions', 'boe_curves'],
    'A separate projection curve or forward swap requires the corresponding pricing relation.',
    'definition',
  ),
  relation(
    'forward_interval',
    'forward_curve',
    'specifies what the horizon means',
    'A finite forward interval differs from an instantaneous forward at a point in time.',
    ['boe_curves'],
    'State both start and tenor, or explicitly identify an instantaneous measure.',
    'comparison',
  ),
  relation(
    'curve_validation',
    'bootstrapping',
    'checks the fitted instruments',
    'Repricing checks help identify inconsistency between calibration quotes and inferred discount factors.',
    ['curve_validation_public', 'ecb_curves'],
    'A small residual does not validate every interpolation or risk estimate.',
  ),
  relation(
    'curve_validation',
    'model_risk',
    'examines more than fit',
    'Input selection and numerical stability can affect an apparently successful calibration.',
    ['curve_validation_public'],
    'This is a general diagnostic framework, not a description of any vendor service.',
  ),
  relation(
    'umbs',
    'tba',
    'supports common delivery',
    'Eligible Fannie and Freddie securities participate in the common single-security market.',
    ['umbs_public'],
    'Eligibility requirements and collateral differences still matter.',
    'mechanism',
  ),
  relation(
    'umbs',
    'agency',
    'preserves guarantor distinctions',
    'A common security format does not turn separate issuing Enterprises into one guarantor.',
    ['umbs_public'],
    'Ginnie Mae remains a separate guarantee program.',
    'comparison',
  ),
  relation(
    'agency_price_basis',
    'umbs',
    'separates Ginnie from the common market',
    'Cross-agency comparisons can contrast the Ginnie program with the Fannie/Freddie market.',
    ['agency_basis_public', 'umbs_public'],
    'Name the instruments, coupon, term, settlement and subtraction order.',
    'comparison',
  ),
  relation(
    'agency_price_basis',
    'ginnie',
    'retains program differences',
    'Ginnie collateral and guarantee characteristics are relevant to cross-agency comparisons.',
    ['agency_basis_public', 'tba'],
    'Do not interpret the entire observed price difference as credit risk.',
    'comparison',
  ),
  relation(
    'rating_status',
    'credit_rating',
    'qualifies the opinion record',
    'An available grade and an opinion that is no longer published convey different information.',
    ['rating_status_public', 'ratings_public'],
    'Read the agency’s dated status definitions and action rationale.',
    'definition',
  ),
  relation(
    'rating_status',
    'loan_states',
    'separates opinion from payment',
    'A rating-status label is not a record of loan repayment, delinquency or loss.',
    ['ratings_public', 'loan_performance_glossary'],
    'Use payment history and deal terms to establish cash received.',
    'comparison',
  ),
  relation(
    'option_greeks',
    'effective_convexity',
    'changes the risk coordinate',
    'Curvature with respect to an underlying price is different from curvature under a curve-rate shock.',
    ['option_greeks_public', 'cfa_risk'],
    'Translate variables and units before comparing sensitivities.',
    'comparison',
  ),
  relation(
    'option_greeks',
    'volatility',
    'isolates a volatility input',
    'Vega measures sensitivity to the selected volatility input while other model inputs are held fixed.',
    ['option_greeks_public'],
    'Normal and lognormal volatility, shift sizes and scaling need explicit definitions.',
  ),
];

export const convention_paths = [
  {
    id: 'calendar_to_cash',
    title: 'From the market clock to cash received',
    description:
      'Separate observation, business-day rules, delivery and accrual.',
    premise:
      'A date only becomes useful after identifying the event and calendar it describes.',
    steps: [
      'as_of',
      'business_calendars',
      'date_adjustment',
      'settlement',
      'accrual',
      'day_count',
    ],
    explanations: [
      'Identify when the quote was observed and when it became available.',
      'Check the calendar for trading separately from the payment service.',
      'Apply the contractual adjustment, including month-end exceptions.',
      'Identify the date securities and cash are actually due to exchange.',
      'Determine which accrued interest belongs in the full settlement amount.',
      'Use the contract’s year fraction rather than inferring it from a rate label.',
    ],
    boundary:
      'These are separate questions, not a universal algorithm. Instrument-specific settlement and interest-entitlement rules control the actual transaction.',
  },
  {
    id: 'rate_to_forward',
    title: 'From a rate convention to a forward interval',
    description:
      'Follow the time fraction through compounding and dated discount factors.',
    premise:
      'A numerical rate is incomplete until its time basis and compounding convention are known.',
    steps: [
      'day_count',
      'rate_compounding',
      'discount_factor',
      'forward_interval',
      'forward_curve',
    ],
    explanations: [
      'Translate the relevant start and end dates into the prescribed year fraction.',
      'Identify simple, periodic or continuous compounding before using the rate.',
      'Convert each dated zero rate into the value of a unit payment.',
      'Compare endpoint factors under the stated one-curve relationship.',
      'Read the forward’s start and interval; an instantaneous series uses a different horizon.',
    ],
    boundary:
      'A forward is an implied relationship, not a realized-rate forecast. Multi-curve index projection, forward swaps and futures require their own conventions.',
  },
  {
    id: 'factor_to_value',
    title: 'From a factor release to a holding’s value',
    description:
      'Keep information availability, remaining principal and investment return distinct.',
    premise:
      'A principal balance has a reporting convention as well as a dollar amount.',
    steps: ['as_of', 'factor_vintage', 'pool_factor', 'price', 'total_return'],
    explanations: [
      'Keep the publication timestamp separate from the effective balance date.',
      'Read whether the applicable factor includes that month’s principal payment.',
      'Apply the factor to original face to obtain the represented remaining principal.',
      'Apply the stated quote to current face using consistent price units.',
      'Combine ending value and distributions without double-counting principal received.',
    ],
    boundary:
      'A factor decline records principal reduction, not a loss by itself. Timing, accrual, purchase price and distributions are needed to measure return.',
  },
];

export const convention_comparisons: ComparisonSet[] = [
  {
    id: 'conventions',
    title: 'What does this input actually describe?',
    eyebrow: 'CONVENTIONS',
    intro: 'Resolve the label before comparing the number.',
    takeaway:
      'A shared date, percentage or status code does not establish a shared financial meaning.',
    columns: ['Input', 'What it defines', 'What remains separate'],
    rows: [
      {
        id: 'business_calendars',
        cells: [
          'Business calendar',
          'Eligible days for a named activity',
          'Trading hours and payment-service hours',
        ],
      },
      {
        id: 'date_adjustment',
        cells: [
          'Date adjustment',
          'Where a nonbusiness date moves',
          'Whether the accrual boundary also moves',
        ],
      },
      {
        id: 'day_count',
        cells: [
          'Day count',
          'The time fraction between dates',
          'Compounding frequency',
        ],
      },
      {
        id: 'rate_compounding',
        cells: [
          'Compounding',
          'How a quoted rate accumulates',
          'Inflation adjustment and the curve’s day count',
        ],
      },
      {
        id: 'factor_vintage',
        cells: [
          'Factor month',
          'The principal balance represented',
          'Publication and payment dates',
        ],
      },
      {
        id: 'rating_status',
        cells: [
          'Rating status',
          'Availability of a credit opinion',
          'Grade, payment state and investment return',
        ],
      },
    ],
  },
];

export const convention_checks: Record<
  string,
  { choices: [string, string, string]; correct: number }
> = {
  business_calendars: {
    choices: [
      'Yes. Every trading early close is a settlement holiday.',
      'No. Payment-service availability and transaction terms must be checked separately.',
      'Yes. All securities share one business-day calendar.',
    ],
    correct: 1,
  },
  date_adjustment: {
    choices: [
      'It always rolls into the next month.',
      'It leaves every nonbusiness date unchanged.',
      'It uses the preceding business day in the original month, absent an exception.',
    ],
    correct: 2,
  },
  factor_vintage: {
    choices: [
      'Yes. The factor can reflect its month’s payment before cash is received.',
      'No. A factor can change only after cash reaches the investor.',
      'No. Publication, accrual and payment must occur on the same date.',
    ],
    correct: 0,
  },
  rate_compounding: {
    choices: [
      'Yes. The percentage alone identifies the discount factor.',
      'No. Compounding and year fractions must also agree.',
      'Yes. A nominal annual rate always means continuous compounding.',
    ],
    correct: 1,
  },
  forward_interval: {
    choices: [
      'Yes. It is the two-year spot rate.',
      'Yes. It measures two consecutive years from today.',
      'No. It covers the one-year interval starting one year from today.',
    ],
    correct: 2,
  },
  curve_validation: {
    choices: [
      'No. Input quality, interpolation and stability remain to be checked.',
      'Yes. Matching quotes proves all forwards are reliable forecasts.',
      'Yes. A small residual eliminates model risk.',
    ],
    correct: 0,
  },
  umbs: {
    choices: [
      'Yes. UMBS merges all three guarantors.',
      'No. Eligibility and pool differences remain, and Ginnie is separate.',
      'Yes. Every pool has identical prepayment behavior.',
    ],
    correct: 1,
  },
  agency_price_basis: {
    choices: [
      'Yes. One price point always equals 100 bp of yield.',
      'Yes. All cross-agency differences measure only credit risk.',
      'No. Price and yield use different units and the cash flows can differ.',
    ],
    correct: 2,
  },
  rating_status: {
    choices: [
      'No. The withdrawal reason and payment history are needed.',
      'Yes. A withdrawn rating always means a total principal loss.',
      'Yes. Not rated is another name for default.',
    ],
    correct: 0,
  },
  option_greeks: {
    choices: [
      'Yes. All second derivatives have the same units.',
      'No. The risk variables, units and cash-flow assumptions can differ.',
      'Yes. Gamma is always the bond’s effective convexity.',
    ],
    correct: 1,
  },
};
