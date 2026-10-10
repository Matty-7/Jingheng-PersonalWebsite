import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';
import type { ComparisonSet } from './atlas_extensions.ts';

// Original educational explanations of public measurement and modeling conventions.
export const analytics_sources = {
  interpolated_swap_spread: {
    publisher: 'Central Bank of Malta',
    title: 'Bond Performance Measures and Valuations · I-spread, section 3.3',
    url: 'https://www.centralbankmalta.org/site/Market-Operations/bond-performance-measures-valuations.pdf?revcount=2717',
  },
  default_rate_glossary: {
    publisher: 'National Credit Union Administration',
    title: 'Glossary · default rate and loss severity',
    url: 'https://ncua.gov/support-services/corporate-system-resolution/glossary',
  },
  default_rate_report: {
    publisher: 'SEC filing · IMPAC CMB Trust 2005-7',
    title: 'Trustee report · liquidation-based MDR/CDR methodology, p. 20',
    url: 'https://www.sec.gov/Archives/edgar/data/1340123/000102024205001465/im050712.htm',
  },
  rate_model_calibration: {
    publisher: 'CFA Institute',
    title: 'The Arbitrage-Free Valuation Framework',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/arbitrage-free-valuation-framework',
  },
  volatility_units: {
    publisher: 'arXiv · Fabien Le Floc’h',
    title:
      'Explicit Rational Formulae for Bachelier (Normal) Implied Volatility · introduction, preprint',
    url: 'https://arxiv.org/html/2605.18343v1',
  },
  hull_white_parameters: {
    publisher: 'OpenGamma Strata',
    title: 'Hull–White parameters · mean reversion and volatility',
    url: 'https://strata.opengamma.io/apidocs/com/opengamma/strata/pricer/model/HullWhiteOneFactorPiecewiseConstantParameters.html',
  },
  daily_prepay: {
    publisher: 'Freddie Mac',
    title: 'Daily Prepayment Report guide · population, dates and measures',
    url: 'https://capitalmarkets.freddiemac.com/mbs/docs/dpr_guide.pdf',
  },
  securitization_handbook: {
    publisher: 'Office of the Comptroller of the Currency',
    title: 'Asset Securitization · cash-flow allocation and payment rates',
    url: 'https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/asset-securitization/pub-ch-asset-securitization.pdf',
  },
  embedded_options: {
    publisher: 'CFA Institute',
    title: 'Valuation and Analysis of Bonds with Embedded Options',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/valuation-analysis-bonds-embedded-options',
  },
  frbsf_empirical_duration: {
    publisher: 'Federal Reserve Bank of San Francisco',
    title:
      'Measuring Interest Rate Risk for Mortgage-Related Assets · FRBSF Economic Letter 2000-01',
    url: 'https://www.frbsf.org/research-and-insights/publications/economic-letter/2000/01/measuring-interest-rate-risk-for-mortgage-related-assets/',
  },
  normal_volatility: {
    publisher: 'OpenGamma Strata',
    title: 'Normal option formula and conversion from Black volatility',
    url: 'https://strata.opengamma.io/apidocs/com/opengamma/strata/pricer/impl/option/NormalFormulaRepository.html',
  },
  defeasance_glossary: {
    publisher: 'CRE Finance Council',
    title: 'Glossary · defeasance and distribution dates',
    url: 'https://www.crefc.org/cre/cre/content/learn/Glossary/CREFC_Glossary.aspx?GlossaryTabs=4',
  },
};

export const analytics_topics = [
  {
    id: 'observed_performance',
    branch: 'prepayment',
    title: 'Reading a reported speed',
    concepts: ['historical_speeds', 'absolute_prepayment_rate'],
  },
  {
    id: 'payment_default_metrics',
    branch: 'credit',
    title: 'Payments, defaults and losses',
    concepts: [
      'loan_states',
      'monthly_payment_rate',
      'conditional_default_rate',
    ],
  },
  {
    id: 'scenario_context',
    branch: 'valuation',
    title: 'Building an analysis context',
    concepts: ['scenario_analysis', 'assumption_vector', 'projection_anchor'],
  },
  {
    id: 'analysis_population',
    branch: 'credit',
    title: 'Which loans and assumptions?',
    concepts: ['collateral_stratification', 're_underwriting', 'defeasance'],
  },
  {
    id: 'flow_allocation',
    branch: 'structure',
    title: 'From assets to claims',
    concepts: ['collateral_tranche_cashflows'],
  },
  {
    id: 'model_context',
    branch: 'risk',
    title: 'What does the model hold fixed?',
    concepts: [
      'short_rate_model',
      'volatility_conventions',
      'model_calibration',
      'empirical_duration',
      'effective_convexity',
    ],
  },
  {
    id: 'spread_convention_context',
    branch: 'curves',
    title: 'Names and calculation conventions',
    concepts: ['spread_conventions'],
  },
];

type ConceptInput = Omit<MortgageConcept, 'branch' | 'topic'>;
function analysis_concept(input: ConceptInput): MortgageConcept {
  const topic = analytics_topics.find((item) =>
    item.concepts.includes(input.id),
  );
  if (!topic) throw new Error(`Missing analytics topic: ${input.id}`);
  return { ...input, topic: topic.id, branch: topic.branch };
}

export const analytics_concepts: MortgageConcept[] = [
  analysis_concept({
    id: 'loan_states',
    title: 'Loan state transitions',
    subtitle: 'From payment status to cash received',
    aliases: ['cure', 'roll rate', 'credit transitions', 'competing risks'],
    summary:
      'A delinquent loan can catch up, fall further behind or enter a workout. Follow its payment status over time before drawing conclusions about losses.',
    distinction:
      'A cure returns a loan to current status; a roll rate measures movement between defined states over a stated interval. Default, property disposition and recovery receipts can occur at different times. Voluntary payoff and credit-related liquidation are different exits from the remaining population, so their assumed probabilities cannot be applied independently without a consistent framework.',
    question:
      'A loan becomes 60 days delinquent. What can you conclude about the investor’s final loss?',
    answer:
      'The final loss is not known. The loan may cure or enter a workout; proceeds, costs, guarantees and recovery timing still affect investor cash flows.',
    links: [
      {
        id: 'delinquency',
        reason: 'Payment status is an observation, not a final loss.',
      },
      { id: 'recovery_lag', reason: 'Recoveries need their own dates.' },
      {
        id: 'prepayments',
        reason: 'Voluntary payoff is a separate exit from the loan population.',
      },
    ],
    sources: ['loan_performance_glossary'],
  }),
  analysis_concept({
    id: 'historical_speeds',
    title: 'Historical prepayment speeds',
    subtitle: 'An observation needs a population and window',
    aliases: [
      'historical speeds',
      'realized CPR',
      '1M CPR',
      '3M CPR',
      '6M CPR',
      '12M CPR',
      'trailing CPR',
    ],
    summary:
      'A reported speed measures selected paydowns over a stated period. Record the population, eligible balance, observation window and included payoff types before comparing reports.',
    distinction:
      'Annualized CPR can describe one month of observations. A trailing multi-month speed requires the stated aggregation method, not simply the arithmetic mean of annualized CPRs. Missing data is not zero; an observation is not a forecast.',
    question: 'Does “12% CPR” identify a twelve-month observation window?',
    answer:
      'No. Annualization and the length of the observed window are separate.',
    links: [
      {
        id: 'cpr',
        reason: 'CPR supplies the annualized unit, not the observation window.',
      },
      {
        id: 'scenario_analysis',
        reason:
          'Using history as a future assumption is an explicit analytical choice.',
      },
    ],
    sources: ['daily_prepay', 'formulas'],
  }),
  analysis_concept({
    id: 'absolute_prepayment_rate',
    title: 'ABS prepayment speed',
    subtitle: 'A speed convention, not the asset class',
    aliases: [
      'absolute prepayment rate',
      'absolute prepayment speed',
      'ABS speed',
    ],
    summary:
      'Under the SIFMA ABS convention, a fresh pool’s speed describes monthly prepayments relative to its original unit-loan population. The equivalent SMM changes with loan age.',
    distinction:
      'For seasoned loans, use the specified age-dependent conversion. Do not treat ABS speed as CPR or assume it always means a percentage of original dollar principal.',
    question: 'Does ABS always mean asset-backed security?',
    answer: 'No. A prepayment field can use ABS as a speed convention.',
    links: [
      {
        id: 'smm',
        reason:
          'The ABS convention translates into an age-dependent monthly speed.',
      },
      {
        id: 'auto_abs',
        reason:
          'Auto-loan analysis is a common application of the ABS speed convention.',
      },
    ],
    sources: ['formulas'],
  }),
  analysis_concept({
    id: 'monthly_payment_rate',
    title: 'Monthly payment rate',
    subtitle: 'Collections on revolving receivables',
    aliases: ['MPR', 'credit card payment rate', 'principal payment rate'],
    summary:
      'Credit-card MPR describes monthly collections relative to the report’s receivables base. Total payments can include principal, finance charges and fees; principal-only rates need a separate label.',
    distinction:
      'Specify the numerator and denominator. Collections may fund new receivables during a revolving period, so the payment rate is not automatically the investor’s principal-paydown rate.',
    question: 'Can you compare MPR with annualized mortgage CPR directly?',
    answer: 'No. The included payments, balance base and time units differ.',
    links: [
      {
        id: 'card_abs',
        reason:
          'Revolving receivables make collection and investor-paydown rates different.',
      },
      {
        id: 'excess_spread',
        reason:
          'Net deal income is a different measure from payment collections.',
      },
    ],
    sources: ['securitization_handbook'],
  }),
  analysis_concept({
    id: 'conditional_default_rate',
    title: 'MDR & CDR',
    subtitle: 'Default frequency, not loss severity',
    aliases: [
      'monthly default rate',
      'MDR',
      'CDR',
      'conditional default rate',
      'constant default rate',
    ],
    summary:
      'MDR measures monthly defaults against a specified eligible balance. CDR expresses a default speed on an annualized basis. The event definition and balance convention must accompany either label.',
    distinction:
      'Default, delinquency and liquidation are distinct events. A default rate does not tell you the loss on each default or when recoveries arrive.',
    formula: {
      expression: 'CDR = 1 − (1 − MDR)¹²',
      assumptions:
        'Decimal rates. Annualizes a constant monthly event rate through survival. The cited trustee report uses liquidated-loan beginning principal divided by total beginning principal for MDR; other default definitions and eligible balances differ.',
      example:
        '1% MDR annualizes to about 11.36% CDR, not a prediction of an 11.36% realized loss.',
    },
    question: 'Does 5% CDR mean a 5% realized principal loss?',
    answer:
      'No. Loss severity, recovery timing and the population still matter.',
    links: [
      {
        id: 'default',
        reason:
          'The reporting method must first define what counts as default.',
      },
      {
        id: 'severity',
        reason:
          'Severity describes loss conditional on a default or liquidation event.',
      },
      {
        id: 'recovery_lag',
        reason: 'Recovery amount and timing are separate assumptions.',
      },
    ],
    sources: ['default_rate_glossary', 'default_rate_report'],
  }),
  analysis_concept({
    id: 'scenario_analysis',
    title: 'Scenario analysis',
    subtitle: 'An explicit set of assumptions',
    aliases: [
      'scenario',
      'base case',
      'stress scenario',
      'sensitivity analysis',
    ],
    summary:
      'A scenario specifies a possible combination of inputs: rates, prepayments, defaults, recoveries or property income. Comparing scenarios reveals how results depend on those assumptions.',
    distinction:
      'Name the changed input, the fixed inputs and the output. At a fixed price, a new cash-flow path implies a new yield. At a fixed yield, it implies a new price. A stress case is not a probability forecast; keep the market snapshot and valuation conventions consistent.',
    question:
      'You change the prepayment assumption while holding the bond price fixed. Which quantity do you solve for?',
    answer:
      'Solve for the yield that discounts the revised cash flows to the same price. Holding yield fixed and solving for price is a different experiment.',
    links: [
      {
        id: 'assumption_vector',
        reason:
          'A time-dependent assumption needs a schedule, not just one number.',
      },
      {
        id: 'quote_context',
        reason: 'A scenario comparison also needs consistent market context.',
      },
      {
        id: 'yield',
        reason:
          'Yield is an output when price and the cash-flow path are given.',
      },
    ],
    sources: ['cre', 'embedded_options'],
  }),
  analysis_concept({
    id: 'assumption_vector',
    title: 'Assumption vector',
    subtitle: 'A schedule indexed by time',
    aliases: [
      'vector',
      'prepayment vector',
      'default vector',
      'time-dependent assumption',
    ],
    summary:
      'An assumption vector is a sequence of values assigned to defined periods. Here it is a general analytical term for a schedule, such as a changing prepayment speed.',
    distinction:
      'Each value needs units, a period and a population. A monthly schedule can contain annualized CPR values. Specify interpolation and behavior after the last entry.',
    question: 'Is [5, 10, 15] a complete prepayment assumption?',
    answer: 'No. Its units, dates and application rules are missing.',
    links: [
      {
        id: 'projection_anchor',
        reason: 'The anchor determines which period receives the first value.',
      },
      {
        id: 'psa',
        reason:
          'PSA illustrates why a prepayment assumption can depend on loan age.',
      },
    ],
    sources: ['formulas'],
  }),
  analysis_concept({
    id: 'projection_anchor',
    title: 'Projection anchor',
    subtitle: 'Where period one begins',
    aliases: [
      'anchor date',
      'projection start',
      'month zero',
      'scenario start date',
    ],
    summary:
      'The projection anchor identifies the starting state and first modeled period. Preserve opening balances, loan ages and the boundary between reported activity and future assumptions.',
    distinction:
      'A factor date, payoff reporting window and market timestamp can refer to different events. Advancing one date does not automatically advance every schedule.',
    question: 'Can an unchanged vector produce different dated cash flows?',
    answer: 'Yes, if its anchor or starting collateral state changes.',
    links: [
      {
        id: 'as_of',
        reason:
          'Information time and the first projected accrual period need separate labels.',
      },
      {
        id: 'collateral_tranche_cashflows',
        reason:
          'Dated assumptions produce the payments that must be allocated to claims.',
      },
    ],
    sources: ['daily_prepay', 'formulas'],
  }),
  analysis_concept({
    id: 'collateral_stratification',
    title: 'Collateral stratification',
    subtitle: 'Compare like populations',
    aliases: [
      'stratification',
      'strata',
      'cohort',
      'loan grouping',
      'collateral group',
    ],
    summary:
      'Stratification groups loans or securities by chosen characteristics. For example, Freddie Mac’s daily prepayment cohorts distinguish security type, coupon and issuance year.',
    distinction:
      'A reporting cohort is not necessarily a model-assignment group. State membership and weighting; overlapping analytical groups cannot be summed as if disjoint.',
    question: 'Does a pool average describe every constituent loan?',
    answer: 'No. Distribution and group composition can matter.',
    links: [
      {
        id: 'historical_speeds',
        reason:
          'The selected population defines which payoff observations enter a reported speed.',
      },
      {
        id: 'pool_averages',
        reason:
          'An average can hide variation that stratification makes visible.',
      },
    ],
    sources: ['daily_prepay'],
  }),
  analysis_concept({
    id: 're_underwriting',
    title: 'Re-underwriting a property scenario',
    subtitle: 'Reassess the income supporting repayment',
    aliases: [
      're-underwriting',
      'reunderwriting',
      'underwriting override',
      'NOI assumption',
    ],
    summary:
      'An analyst can reassess property income, expenses and valuation assumptions to test debt repayment. Changing NOI or a capitalization rate can alter assessed DSCR or collateral value.',
    distinction:
      'An analytical override changes the analysis, not the executed loan contract. Preserve the original observation and state which assumption replaced it.',
    question: 'Does a lower assumed NOI change the contractual coupon?',
    answer:
      'No. It changes the assessed repayment capacity unless a separate contractual mechanism applies.',
    links: [
      {
        id: 'noi',
        reason: 'Property income is an input to repayment-capacity analysis.',
      },
      {
        id: 'scenario_analysis',
        reason:
          'Revised property assumptions define a different analytical case.',
      },
    ],
    sources: ['cre'],
  }),
  analysis_concept({
    id: 'collateral_tranche_cashflows',
    title: 'Collateral & tranche cash flows',
    subtitle: 'Which claim receives the money?',
    aliases: [
      'collateral cashflows',
      'tranche cashflows',
      'bond cashflows',
      'asset cash flows',
      'cashflow allocation',
    ],
    summary:
      'Collateral cash flows enter a structure. Its allocation rules direct payments to individual classes, which can have different principal timing and interest claims even with the same underlying assets.',
    distinction:
      'Identify the level of the report. A collateral total is not a tranche’s payment schedule; class-level WAL and valuation require that class’s allocated flows.',
    question: 'Must two classes backed by the same pool have the same WAL?',
    answer: 'No. Their principal-payment priorities can differ.',
    links: [
      {
        id: 'waterfall',
        reason:
          'The waterfall specifies how asset-level cash reaches each claim.',
      },
      {
        id: 'wal',
        reason:
          'WAL must be computed from the principal schedule of the selected claim.',
      },
      {
        id: 'cash_flows',
        reason:
          'The word cash flows needs a named recipient and payment level.',
      },
    ],
    sources: ['structure'],
  }),
  analysis_concept({
    id: 'defeasance',
    title: 'Defeasance',
    subtitle: 'Replace collateral while debt remains',
    aliases: ['collateral substitution', 'CMBS defeasance'],
    summary:
      'Where permitted, defeasance substitutes qualifying securities for property collateral so scheduled debt payments remain supported. The debt generally remains outstanding.',
    distinction:
      'Prepayment repays debt early. Yield maintenance is a contractual prepayment-charge method. Neither is the same transaction as defeasance; eligibility and costs follow the loan documents.',
    question: 'Does releasing the property always mean the loan was prepaid?',
    answer:
      'No. A permitted collateral substitution may leave the debt in place.',
    links: [
      {
        id: 'cmbs',
        reason:
          'CMBS loan documents may provide collateral-release and defeasance terms.',
      },
      {
        id: 'prepayments',
        reason:
          'Collateral release and early principal repayment are different events.',
      },
    ],
    sources: ['defeasance_glossary'],
  }),
  analysis_concept({
    id: 'short_rate_model',
    title: 'Interest-rate model',
    subtitle: 'Dynamics and numerical method are separate',
    aliases: [
      'short-rate model',
      'rate dynamics',
      'binomial tree',
      'Monte Carlo',
      'mean reversion',
    ],
    summary:
      'A rate model describes possible rate evolution. An implementation can use a tree or simulation to value payments and embedded exercise decisions under those dynamics.',
    distinction:
      'Mean-reversion speed and volatility are separate model parameters. Issuer call exercise and mortgage borrower prepayment also require different behavioral assumptions; a shared tree or simulation method does not resolve those differences.',
    question: 'Does using the same numerical method identify the same model?',
    answer: 'No. The dynamics and exercise assumptions can still differ.',
    links: [
      {
        id: 'model_calibration',
        reason:
          'A model needs parameters consistent with its chosen market inputs.',
      },
      {
        id: 'callable',
        reason: 'Issuer exercise is one application of option-aware valuation.',
      },
    ],
    sources: [
      'rate_model_calibration',
      'embedded_options',
      'hull_white_parameters',
    ],
  }),
  analysis_concept({
    id: 'volatility_conventions',
    title: 'Volatility conventions',
    subtitle: 'The number depends on the model and units',
    aliases: [
      'normal volatility',
      'lognormal volatility',
      'Black volatility',
      'Bachelier volatility',
      'basis point volatility',
    ],
    summary:
      'Normal rate volatility describes absolute rate moves, often quoted in basis points per square-root year. Black/lognormal volatility describes proportional moves, commonly quoted as a percentage per square-root year.',
    distinction:
      'Conversion depends on inputs such as the forward, strike and expiry. Do not copy a volatility number into another model just because both fields are labeled volatility.',
    question:
      'Does the same quoted volatility number guarantee the same option value?',
    answer: 'No. Identify the convention, underlying, units and expiry first.',
    links: [
      {
        id: 'volatility',
        reason:
          'Rate uncertainty needs a measurement convention before it becomes a model input.',
      },
      {
        id: 'model_calibration',
        reason:
          'Calibration must interpret market volatility in the intended convention.',
      },
    ],
    sources: ['volatility_units', 'normal_volatility'],
  }),
  analysis_concept({
    id: 'model_calibration',
    title: 'Model calibration',
    subtitle: 'Fit specified inputs, retain model uncertainty',
    aliases: ['calibration', 'calibrated model', 'model parameters'],
    summary:
      'Calibration chooses model parameters to reproduce selected market inputs under a stated method. Record the reference curve, option inputs and exercise assumptions used for valuation.',
    distinction:
      'Matching calibration instruments does not establish a unique future path or eliminate model risk. Recalibrating and shocking an existing model are different experiments.',
    question: 'Does matching today’s price validate every risk output?',
    answer: 'No. Other prices and sensitivities can still depend on the model.',
    links: [
      {
        id: 'oas',
        reason:
          'The inferred option-adjusted spread is conditional on the model and its inputs.',
      },
      {
        id: 'model_risk',
        reason:
          'Fitting observed inputs does not remove assumptions about unobserved behavior.',
      },
    ],
    sources: ['rate_model_calibration'],
  }),
  analysis_concept({
    id: 'empirical_duration',
    title: 'Empirical duration',
    subtitle: 'Historical co-movement under a specified regression',
    aliases: ['regression-based duration'],
    summary:
      'Empirical duration estimates how a security’s proportional price change or total return co-moved with changes in a chosen benchmark rate over a stated historical sample. It is a sample-dependent regression measure, not a model-free or inherently more realistic duration.',
    formula: {
      expression: 'rₜ = α + β Δyₜ + εₜ; D_emp = −β',
      assumptions:
        'rₜ is either proportional full-price change or total return, identified explicitly, and is measured over the same interval as benchmark-rate change Δyₜ. Rate changes use decimal units. State the observation window, frequency, benchmark, intercept, controls, weighting and return treatment.',
    },
    distinction:
      'Effective duration reprices the same security under defined shocks and held-fixed model assumptions. Empirical duration summarizes historical co-movement and can absorb concurrent spread, liquidity, collateral-mix and other market effects. Its estimate can change with the window, frequency, benchmark, outliers, regression specification and market regime, so it is neither a forecast nor intrinsically more real.',
    question:
      'Can an empirical-duration estimate from one sample be treated as the security’s constant effective duration in another regime?',
    answer:
      'No. It describes the specified sample and regression; benchmark choice, frequency, spread and liquidity co-movement, outliers and regime changes can alter the estimate.',
    links: [
      {
        id: 'duration',
        reason:
          'Effective duration is a defined repricing experiment rather than a historical regression.',
      },
      {
        id: 'hedging',
        reason:
          'A historical beta can inform hedge selection without fixing a future hedge ratio.',
      },
      {
        id: 'basis_risk',
        reason:
          'Benchmark-relative spread and liquidity moves can enter the estimated beta.',
      },
      {
        id: 'model_risk',
        reason:
          'Regression specification, controls and sample choice can change the result.',
      },
      {
        id: 'oas',
        reason:
          'An empirical beta is neither a constant-OAS curve shock nor an OAS estimate.',
      },
    ],
    sources: ['frbsf_empirical_duration', 'cfa_risk'],
  }),
  analysis_concept({
    id: 'effective_convexity',
    title: 'Effective convexity',
    subtitle: 'Curvature under a defined curve shock',
    aliases: ['option adjusted convexity', 'curve convexity', 'OAC'],
    summary:
      'Effective convexity describes curvature in modeled price as the benchmark curve shifts, allowing option-sensitive payments to respond. With a positive base full price and equal nonzero shocks, it is positive when P₋ + P₊ exceeds 2P₀, negative when it is below 2P₀ and zero when the two are equal.',
    distinction:
      'State the shock size and what stays fixed. In a constant-OAS calculation, hold OAS fixed while repricing the changed curve. This differs from shocking the spread with the curve fixed. The sign is local to the model, collateral, valuation date, market state and shock size—not a permanent label. Low CPR or weak refinancing incentive alone does not prove positive convexity.',
    formula: {
      expression: 'C_eff ≈ (P₋ + P₊ − 2P₀) / (P₀ Δy²)',
      assumptions:
        'P₀ > 0 and equal up/down parallel curve shifts of nonzero magnitude Δy in decimal rate units. P₀ is the base full price; P₋ and P₊ use consistent full-price and option-modeling conventions at fixed OAS. A finite-difference approximation, not a guarantee for large shocks.',
      example:
        'Hypothetical same-valuation repricing: P₀ = 100, P₋ = 101.05 and P₊ = 99.05 under ±100 bp parallel shocks, so Δy = 0.01. The numerator is 0.10 and the denominator is 0.01, giving C_eff ≈ +10 years². The up-shock price still falls below 100: positive curvature does not require a gain when rates rise. This is neither a future-price forecast nor a realized-profit claim.',
    },
    question:
      'Can positive effective convexity coexist with an up-shock price below the base price?',
    answer:
      'Yes. Its sign compares the two shocked prices with twice the base price; it does not require the up-shock price to rise.',
    links: [
      {
        id: 'duration',
        reason:
          'Duration measures the first-order response; convexity adds curvature.',
      },
      {
        id: 'spread_duration',
        reason:
          'Spread sensitivity changes the spread while preserving the reference curve.',
      },
      {
        id: 'convexity',
        reason:
          'The sign is a local result, not a permanent label for every MBS or market state.',
      },
    ],
    sources: ['cfa_risk', 'embedded_options', 'convexity'],
  }),
  analysis_concept({
    id: 'spread_conventions',
    title: 'Spread calculation conventions',
    subtitle: 'A letter is not a complete definition',
    aliases: [
      'spread convention',
      'benchmark convention',
      'provider convention',
      'I Spread convention',
    ],
    summary:
      'A spread comparison needs a named benchmark and method. Identify the currency, comparison horizon, interpolation, cash-flow assumptions and option treatment.',
    distinction:
      'This map uses the general bond-market I-spread convention: yield minus an interpolated swap par rate. Product and provider labels need their own documentation; do not infer another system’s formula from the letter alone.',
    question:
      'Can two fields named spread be compared without their definitions?',
    answer: 'No. Establish the benchmark and calculation method first.',
    links: [
      {
        id: 'i_spread',
        reason:
          'The map explicitly scopes the I-spread definition to a general bond-market convention.',
      },
      {
        id: 'quote_context',
        reason: 'Source, date and units must travel with the reported value.',
      },
      {
        id: 'benchmark_matching',
        reason: 'A reference must match the intended comparison.',
      },
    ],
    sources: ['interpolated_swap_spread', 'spreads_public', 'ecb_curves'],
  }),
];

function analysis_relation(
  source: string,
  target: string,
  label: string,
  reason: string,
  kind: MortgageRelationship['kind'],
  sources: string[],
  conditions?: string,
): MortgageRelationship {
  return {
    id: `analysis_${source}__${target}`,
    source,
    target,
    label,
    reason,
    kind,
    sources,
    ...(conditions ? { conditions } : {}),
  };
}

export const analytics_relationships: MortgageRelationship[] = [
  analysis_relation(
    'loan_states',
    'delinquency',
    'tracks payment status',
    'A loan can move into delinquency and later cure; a delinquency observation does not establish a final loss.',
    'measurement',
    ['loan_performance_glossary'],
    'Define the observation interval, population and payment-status convention.',
  ),
  analysis_relation(
    'loan_states',
    'recovery_lag',
    'separates events from receipts',
    'Payment status, loan exit and recovery receipts have distinct dates that affect projected investor cash flows.',
    'mechanism',
    ['loan_performance_glossary'],
    'Recovery amounts and timing depend on the workout and the applicable guarantee or transaction terms.',
  ),
  analysis_relation(
    'collateral_stratification',
    'historical_speeds',
    'defines the observed population',
    'A speed report describes the selected population, not every loan in the market.',
    'measurement',
    ['daily_prepay'],
  ),
  analysis_relation(
    'historical_speeds',
    'scenario_analysis',
    'can inform an assumption',
    'History can inform a future case; carrying it forward requires an explicit assumption.',
    'comparison',
    ['daily_prepay', 'cre'],
    'Observation does not establish a forecast or scenario probability.',
  ),
  analysis_relation(
    'historical_speeds',
    'cpr',
    'distinguishes window from units',
    'The observed window and CPR annualization describe different dimensions of a speed.',
    'measurement',
    ['formulas'],
  ),
  analysis_relation(
    'absolute_prepayment_rate',
    'smm',
    'depends on age',
    'The ABS convention converts to a monthly speed using loan age.',
    'measurement',
    ['formulas'],
    'Use the convention’s seasoned-loan conversion, not an assumed original-dollar denominator.',
  ),
  analysis_relation(
    'monthly_payment_rate',
    'card_abs',
    'tracks collections',
    'Card collections can be reinvested during a revolving period instead of immediately paying investor principal.',
    'measurement',
    ['securitization_handbook'],
  ),
  analysis_relation(
    'conditional_default_rate',
    'default',
    'requires an event definition',
    'A default speed needs a defined default event and an eligible balance.',
    'measurement',
    ['default_rate_glossary', 'default_rate_report'],
  ),
  analysis_relation(
    'conditional_default_rate',
    'severity',
    'separates frequency from loss',
    'Default frequency and the loss per event are separate inputs to credit analysis.',
    'comparison',
    ['default_rate_glossary'],
  ),
  analysis_relation(
    're_underwriting',
    'scenario_analysis',
    'changes the analytical case',
    'Revised property-income assumptions change assessed repayment capacity.',
    'mechanism',
    ['cre'],
    'An analytical override does not amend the loan contract.',
  ),
  analysis_relation(
    're_underwriting',
    'noi',
    'reassesses property income',
    'Income and expense assumptions determine the NOI used in an analytical case.',
    'measurement',
    ['cre'],
  ),
  analysis_relation(
    'scenario_analysis',
    'assumption_vector',
    'can vary through time',
    'A time-dependent case needs dated values rather than one undated scalar.',
    'definition',
    ['formulas'],
  ),
  analysis_relation(
    'assumption_vector',
    'projection_anchor',
    'needs a starting period',
    'Units and an anchor determine where the assumption sequence applies.',
    'definition',
    ['formulas'],
  ),
  analysis_relation(
    'projection_anchor',
    'collateral_tranche_cashflows',
    'dates the projected payments',
    'The starting state and modeled periods determine which payments enter the projected cash-flow schedule.',
    'measurement',
    ['daily_prepay', 'structure'],
  ),
  analysis_relation(
    'collateral_tranche_cashflows',
    'waterfall',
    'allocates assets to claims',
    'Allocation rules turn collateral receipts into individual class payment schedules.',
    'mechanism',
    ['structure'],
  ),
  analysis_relation(
    'collateral_tranche_cashflows',
    'wal',
    'uses the selected principal stream',
    'Each claim’s principal timing determines its own WAL.',
    'measurement',
    ['structure'],
  ),
  analysis_relation(
    'wal',
    'pv',
    'distinguishes timing from value',
    'WAL summarizes principal timing; valuation discounts the full allocated stream, including interest.',
    'comparison',
    ['structure', 'cfa_valuation'],
  ),
  analysis_relation(
    'defeasance',
    'cmbs',
    'can release property collateral',
    'Permitted substitution can release a property while the debt remains outstanding.',
    'definition',
    ['defeasance_glossary'],
    'Eligibility, replacement securities and fees follow the loan documents.',
  ),
  analysis_relation(
    'short_rate_model',
    'model_calibration',
    'requires specified inputs',
    'Dynamics and calibration together identify the model used for option-aware valuation.',
    'definition',
    ['rate_model_calibration'],
  ),
  analysis_relation(
    'volatility_conventions',
    'model_calibration',
    'interprets the option input',
    'Changing the volatility convention changes how an option quote enters calibration.',
    'definition',
    ['normal_volatility'],
  ),
  analysis_relation(
    'model_calibration',
    'oas',
    'conditions the inferred spread',
    'OAS is inferred within a specified model, rather than observed independently of it.',
    'measurement',
    ['embedded_options'],
  ),
  analysis_relation(
    'oas',
    'effective_convexity',
    'can stay fixed in a curve shock',
    'A constant-OAS curve experiment reprices option-sensitive payments after the curve moves.',
    'measurement',
    ['embedded_options', 'cfa_risk'],
    'Hold OAS fixed and identify the shock and other model assumptions.',
  ),
  analysis_relation(
    'empirical_duration',
    'duration',
    'contrasts observed and modeled sensitivity',
    'Empirical duration summarizes historical price-rate co-movement; effective duration reprices option-sensitive cash flows under a defined shock.',
    'comparison',
    ['frbsf_empirical_duration', 'cfa_risk'],
    'State the return, rate shock, sample and held-fixed assumptions before comparing the measures.',
  ),
  analysis_relation(
    'empirical_duration',
    'hedging',
    'can inform a hedge ratio',
    'A historical beta can describe past co-movement with a candidate benchmark hedge.',
    'measurement',
    ['frbsf_empirical_duration'],
    'The estimate is sample-dependent and does not guarantee the future hedge ratio.',
  ),
  analysis_relation(
    'empirical_duration',
    'basis_risk',
    'can absorb non-benchmark moves',
    'Spread, liquidity and benchmark-mismatch effects can enter the observed price-rate relationship.',
    'comparison',
    ['frbsf_empirical_duration'],
    'Regression beta does not isolate a pure curve shock unless the specification and data support that interpretation.',
  ),
  analysis_relation(
    'empirical_duration',
    'model_risk',
    'depends on specification and sample',
    'Window, frequency, controls, weighting, outliers and market regime can change the estimate.',
    'measurement',
    ['frbsf_empirical_duration', 'cfa_risk'],
  ),
  analysis_relation(
    'empirical_duration',
    'oas',
    'differs from a constant-OAS shock',
    'Historical co-movement does not identify OAS or reproduce an option model’s constant-OAS curve experiment.',
    'comparison',
    ['frbsf_empirical_duration', 'embedded_options'],
  ),
  analysis_relation(
    'effective_convexity',
    'spread_duration',
    'changes the experiment',
    'Spread sensitivity moves the spread with the curve fixed; curve convexity measures a different response.',
    'comparison',
    ['cfa_risk', 'spreads_public'],
  ),
  analysis_relation(
    'spread_conventions',
    'i_spread',
    'scopes the letter label',
    'Here I-spread uses the general bond-market interpolated swap reference; another product’s label needs its own specification.',
    'definition',
    ['interpolated_swap_spread'],
  ),
];

export const analytics_paths = [
  {
    id: 'observation_to_scenario',
    title: 'From an observed speed to scenario cash flows',
    description:
      'Check the population and units before turning history into a dated assumption.',
    premise:
      'These steps form an analytical workflow, not a claim that yesterday’s speed predicts tomorrow’s payments.',
    steps: [
      'collateral_stratification',
      'historical_speeds',
      'scenario_analysis',
      'assumption_vector',
      'projection_anchor',
      'collateral_tranche_cashflows',
    ],
    explanations: [
      'Choose which loans belong in the observation.',
      'Read the window, eligible balance and included payoff types.',
      'State the future assumptions separately from the observation.',
      'Give changing assumptions explicit units and periods.',
      'Attach the sequence to the intended starting state.',
      'Identify whether the result is an asset receipt or a payment to a particular claim.',
    ],
    boundary:
      'Changing population, units or the starting date changes the comparison. Missing history supplies no zero-speed assumption.',
  },
  {
    id: 'assumptions_to_claim',
    title: 'From collateral assumptions to tranche value',
    description:
      'Separate a revised property case from contractual allocation and valuation.',
    premise:
      'An analytical change matters through the payment stream belonging to the claim being valued.',
    steps: [
      're_underwriting',
      'scenario_analysis',
      'assumption_vector',
      'projection_anchor',
      'collateral_tranche_cashflows',
      'wal',
      'pv',
    ],
    explanations: [
      'Reassess income and repayment capacity without rewriting the contract.',
      'Name the changed case and the inputs held fixed.',
      'Date the assumptions when they vary through time.',
      'Preserve the opening collateral state.',
      'Apply the structure to find each claim’s allocated payments.',
      'Read that claim’s principal timing.',
      'Discount the full allocated stream, including interest, under a stated valuation and option model.',
    ],
    boundary:
      'WAL summarizes principal timing; it is not a price or duration. Valuation must use the full allocated cash-flow stream and the appropriate option treatment.',
  },
  {
    id: 'model_to_risk',
    title: 'Which input did the risk measure shock?',
    description:
      'Read rate-model inputs, OAS and curve sensitivity as one defined experiment.',
    premise:
      'A risk number is comparable only when the changed input and held-fixed assumptions are known.',
    steps: [
      'short_rate_model',
      'model_calibration',
      'oas',
      'effective_convexity',
      'spread_duration',
    ],
    explanations: [
      'Identify the modeled dynamics and exercise behavior.',
      'State the calibration inputs and volatility convention.',
      'Infer OAS within that model.',
      'For constant-OAS curve convexity, move the curve and reprice the options.',
      'For spread duration, move the stated spread while keeping the curve fixed.',
    ],
    boundary:
      'Recalibration, alternative exercise behavior or a different shock size can change the output. No single shock captures every source of risk.',
  },
];

export const analytics_comparisons: ComparisonSet[] = [
  {
    id: 'metrics',
    title: 'A percentage is not a measurement contract.',
    eyebrow: '07 / METRICS',
    intro:
      'Distinguish time units, the population and the event being counted. A reported history and a future assumption can use the same unit.',
    takeaway:
      'Before comparing two rates, align the numerator, denominator, observation window and annualization. Principal return, default frequency and income are different quantities.',
    columns: [
      'Measure',
      'What is counted',
      'Base or convention',
      'Time',
      'Interpretation',
    ],
    rows: [
      {
        id: 'smm',
        cells: [
          'SMM',
          'Unscheduled principal',
          'Eligible balance after scheduled principal',
          'Monthly',
          'A monthly mortgage speed.',
        ],
      },
      {
        id: 'cpr',
        cells: [
          'CPR',
          'Prepayment speed',
          'Survival-based annualization of monthly speed',
          'Annualized',
          'Observation window still needs a label.',
        ],
      },
      {
        id: 'psa',
        cells: [
          'PSA',
          'Multiple of an age-based speed curve',
          '100% PSA is a benchmark, not 100% repayment',
          'Loan age determines CPR',
          'A multiplier is not a raw annual rate.',
        ],
      },
      {
        id: 'absolute_prepayment_rate',
        cells: [
          'ABS speed',
          'Prepayment under the ABS convention',
          'Original unit-loan interpretation for a fresh pool; age conversion for seasoned loans',
          'Monthly convention',
          'Neither asset-class abbreviation nor interchangeable CPR.',
        ],
      },
      {
        id: 'monthly_payment_rate',
        cells: [
          'MPR',
          'Card payments; total or principal-only',
          'Specified receivables base',
          'Monthly',
          'Revolving collections need not pay investor principal immediately.',
        ],
      },
      {
        id: 'conditional_default_rate',
        cells: [
          'MDR / CDR',
          'Defined default events',
          'Specified eligible balance',
          'Monthly / annualized',
          'Frequency is separate from severity and recovery timing.',
        ],
      },
      {
        id: 'severity',
        cells: [
          'Loss severity',
          'Loss on a defaulted or liquidated exposure',
          'Specified defaulted principal',
          'Event or cohort',
          'A conditional loss fraction, not a default speed.',
        ],
      },
      {
        id: 'excess_spread',
        cells: [
          'Excess spread',
          'Income after specified costs and losses',
          'Deal definition if expressed as a ratio',
          'Specified reporting period',
          'Net income, not a mortgage prepayment rate.',
        ],
      },
    ],
  },
];
