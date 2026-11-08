import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const response_sources = {
  fannie_refinance_transition_2026: {
    publisher: 'Fannie Mae',
    title:
      'Explore Refinance Activity with the New Refinance Transition Trends Dashboard · October 26, 2026 · matched old/new purpose, product and term',
    url: 'https://capitalmarkets.fanniemae.com/mortgage-backed-securities/new-refinance-transition-trends-dashboard',
  },
  freddie_refinance_product_transition: {
    publisher: 'Freddie Mac',
    title:
      'Refinance Product Transition Report · methodology and old/new mortgage definitions',
    url: 'https://capitalmarkets.freddiemac.com/mbs/refinance-transition-report',
  },
  fhfa_refinance_2q26: {
    publisher: 'Federal Housing Finance Agency',
    title:
      'Foreclosure Prevention, Refinance, and FPM Report · 2Q2026 · refinance volume and cash-out share',
    url: 'https://www.fhfa.gov/reports/foreclosure-prevention-refinance-and-fpm/2026/Q2',
  },
  cfpb_cash_out_nmdb: {
    publisher: 'Consumer Financial Protection Bureau',
    title:
      'A look at cash-out refinance mortgages and their borrowers between 2013 to 2023 · December 18, 2023',
    url: 'https://www.consumerfinance.gov/archive/blog/office-of-research-blog-a-look-at-cash-out-refinance-mortgages-and-their-borrowers-between-2013-to-2023/',
  },
  refinance_costs: {
    publisher: 'Federal Reserve Board',
    title:
      'A Consumer’s Guide to Mortgage Refinancings · archived educational guide · costs, terms and no-cost refinancing',
    url: 'https://www.federalreserve.gov/pubs/refinancings/default.htm',
  },
  mortgage_technology: {
    publisher: 'Federal Reserve Bank of New York',
    title:
      'The Role of Technology in Mortgage Lending · Staff Report 836, February 2018 · section VI and identification limits',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr836.pdf',
  },
  refinancing_structural_change: {
    publisher: 'Federal Reserve Bank of New York',
    title:
      'Structural Change in the Mortgage Market and the Propensity to Refinance · Staff Report 45, September 1998',
    url: 'https://www.newyorkfed.org/research/staff_reports/sr45.html',
  },
  model_validation_2026: {
    publisher: 'Federal Reserve Board, OCC and FDIC',
    title:
      'Supervisory Guidance on Model Risk Management · April 17, 2026 · sections IV–V',
    url: 'https://www.federalreserve.gov/frrs/guidance/supervisory-guidance-on-model-risk-management.htm',
  },
};

export const response_topics = [
  {
    id: 'prepayment_response',
    branch: 'prepayment',
    title: 'From borrower response to pool speed',
    concepts: [
      'prepayment_aggregation',
      'refinance_transition',
      'prepayment_model_stability',
    ],
  },
];

export const response_concepts: MortgageConcept[] = [
  {
    id: 'prepayment_aggregation',
    branch: 'prepayment',
    topic: 'prepayment_response',
    title: 'Prepayment aggregation',
    subtitle: 'Add principal dollars before annualizing',
    aliases: [
      'cohort aggregation',
      'balance-weighted prepayments',
      'pool SMM',
      'borrower heterogeneity',
    ],
    summary:
      'A pool combines borrowers with different incentives, balances and constraints. Its monthly prepayment rate weights each group by the balance exposed to prepayment after scheduled principal. A response evaluated at average borrower characteristics need not equal the average response.',
    distinction:
      'A loan-count average answers a different question from principal repayment. Averaging subgroup CPRs also does not give the pool’s annualized monthly speed: convert through SMM and combine the underlying balances first. A changing group mix can move pool CPR even when each group’s response is unchanged.',
    formula: {
      expression:
        'Pool SMM = Σ prepaid principal / Σ (opening balance − scheduled principal) = Σ weight × group SMM; pool CPR = 1 − (1 − pool SMM)^12.',
      assumptions:
        'Use disjoint groups covering the same pool and month, positive post-scheduled balances and decimal speeds. Weight each group by its post-scheduled balance divided by the pool total. Align cutoff dates and the treatment of buyouts, liquidations and curtailments; this illustration excludes defaults and losses. Annualization repeats the one-month rate mathematically, not as a forecast.',
      example:
        'Illustrative post-scheduled balances of $80 million at 1% SMM and $20 million at 5% SMM produce $1.8 million prepaid, 1.8% pool SMM and about 19.58% CPR. Averaging their separately annualized CPRs with 80/20 weights gives about 18.28%, a different statistic. The two groups’ simple average SMM of 3% is also wrong for these balances.',
    },
    question:
      'With $80 million at 1% SMM and $20 million at 5% SMM, what is pool SMM?',
    answer:
      '1.8%: total prepayments of $1.8 million divided by $100 million of post-scheduled balance. Annualize only after aggregating.',
    links: [
      {
        id: 'smm',
        reason: 'Provides the monthly principal-at-risk denominator.',
      },
      {
        id: 'cpr',
        reason:
          'Annualization is nonlinear, so the order of operations matters.',
      },
      {
        id: 'pool_averages',
        reason:
          'Average characteristics hide the distribution driving borrower response.',
      },
      {
        id: 'loan_balance',
        reason:
          'Balance affects both refinancing economics and principal weights.',
      },
      {
        id: 'prepayment_model_stability',
        reason:
          'Separate changes in the borrower mix from changes in conditional behavior.',
      },
    ],
    sources: ['cohort'],
  },
  {
    id: 'refinance_transition',
    branch: 'prepayment',
    topic: 'prepayment_response',
    title: 'Refinance transitions',
    subtitle: 'Track the old loan and its replacement',
    aliases: [
      'old-to-new refinance',
      'product transition',
      'term transition',
      'cash-out transition',
    ],
    summary:
      'Refinancing replaces an old loan with a new one, but the replacement need not preserve the old loan’s purpose, product, term, balance or note rate. A rate-and-term refinance may change the rate or repayment term; a cash-out refinance may retire a first lien while extracting equity. Mapping matched old-to-new loans therefore shows a payoff channel that a same-product rate comparison can miss.',
    distinction:
      'A transition report conditions on completed, matched refinances. Its shares describe composition within the report’s defined matched population, not market-wide refinance volume, application propensity, pool CPR or the borrower’s causal motive. Enterprise samples, matching rules, product buckets and balance weights are not universal. A home-equity loan or HELOC may provide equity access while preserving the existing first lien; a cash-out refinance replaces that first lien. Compare purpose, product, term, balance and note rate together, and state the population and time window.',
    question:
      'A borrower pays off a low-rate 30-year fixed first lien with a new 30-year fixed mortgage and receives cash. Does the weak rate incentive mean the payoff cannot be a refinance?',
    answer:
      'No. A cash-out refinance can replace the first lien even when lowering the note rate is not the main observed benefit. The matched transition confirms replacement, but it does not establish the borrower’s motive or measure pool CPR.',
    links: [
      {
        id: 'incentive',
        reason:
          'Rate incentive is one signal, not a complete description of purpose, product or term changes.',
      },
      {
        id: 'prepayments',
        reason:
          'A completed refinance can pay off the old loan and return unscheduled principal.',
      },
      {
        id: 'fixed_arm',
        reason:
          'The replacement loan may retain or change the fixed-rate or ARM product.',
      },
      {
        id: 'second_lien',
        reason:
          'A second lien or HELOC may access equity without replacing the first lien.',
      },
      {
        id: 'prepayment_aggregation',
        reason:
          'Transition shares describe a matched subgroup, not the pool’s balance-weighted SMM or CPR.',
      },
    ],
    sources: [
      'fannie_refinance_transition_2026',
      'freddie_refinance_product_transition',
      'fhfa_refinance_2q26',
      'cfpb_cash_out_nmdb',
    ],
  },
  {
    id: 'prepayment_model_stability',
    branch: 'prepayment',
    topic: 'prepayment_response',
    title: 'Prepayment model stability',
    subtitle: 'A good historical fit can miss a changing response',
    aliases: [
      'prepayment model drift',
      'regime change',
      'out-of-time validation',
      'AI prepayment modeling',
    ],
    summary:
      'The mapping from refinancing incentive to prepayment can change as costs, borrower attention, lender capacity or eligibility change. First distinguish a new borrower mix from a changed response within comparable groups. Historical FinTech research supports studying these channels; it does not establish the effect of today’s AI tools on a particular pool.',
    distinction:
      'For a practical validation check, freeze the forecast date and data then available, test on later months, and inspect errors by incentive, balance, loan age and servicer. Separate refinance, turnover and buyout definitions where the data allow. A single aggregate CPR match can hide offsetting group errors. A random split alone does not test an unseen rate regime, and better prediction does not by itself establish causation.',
    question:
      'Pool CPR rises after the borrower mix changes. Does that prove refinancing behavior changed?',
    answer:
      'No. Compare like-for-like groups and information dates first. Then test conditional responses and alternative assumptions. Treat AI-driven friction reductions as a scenario until relevant outcomes support them.',
    links: [
      {
        id: 'frictions',
        reason:
          'Changes in time, cost or attention can alter completion at the same incentive.',
      },
      {
        id: 'prepayment_aggregation',
        reason:
          'Composition and within-group response can move the same aggregate statistic.',
      },
      {
        id: 'burnout',
        reason:
          'Survivor selection can mimic a change in refinancing responsiveness.',
      },
      {
        id: 'model_calibration',
        reason:
          'Fitting today’s inputs differs from validating future borrower outcomes.',
      },
      {
        id: 'oas',
        reason:
          'Changing projected payments can change fitted OAS at an unchanged price.',
      },
      {
        id: 'duration',
        reason:
          'Sensitivity also depends on how payments respond in shocked rate paths.',
      },
    ],
    sources: [
      'mortgage_technology',
      'refinancing_structural_change',
      'model_validation_2026',
      'fed_spreads',
    ],
  },
];

function relation(
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

export const response_relationships = [
  relation(
    'oas',
    'duration',
    'comparison',
    'separates price fit from sensitivity',
    'OAS fits the base price, while effective duration compares prices after rate shocks with reprojected payments.',
    'A conventional effective-duration comparison holds OAS fixed across shocks; disclose any recalibration instead.',
    ['fed_spreads', 'cfa_risk'],
  ),
  relation(
    'smm',
    'prepayment_aggregation',
    'measurement',
    'combines exposed balances',
    'Pool speed follows total prepaid principal divided by total post-scheduled principal, not an equal-weight loan average.',
    'Use a common month, disjoint groups and consistent principal-event definitions.',
    ['cohort'],
  ),
  relation(
    'loan_balance',
    'refinance_transition',
    'measurement',
    'can change at replacement',
    'A completed refinance can replace the old balance with a different new balance, including additional borrowing in a cash-out transaction.',
    'Matched balance changes are descriptive within the provider-defined population; they do not establish borrower motive, causality or pool prepayment speed.',
    ['fannie_refinance_transition_2026', 'cfpb_cash_out_nmdb'],
  ),
  relation(
    'incentive',
    'refinance_transition',
    'comparison',
    'is only one transition signal',
    'Matched old-to-new loans can differ in purpose, product, term, balance and note rate, so a same-product rate gap does not describe every completed refinance.',
    'Matched transitions are descriptive and population-specific; they do not establish borrower motive or a causal response to rates.',
    [
      'fannie_refinance_transition_2026',
      'freddie_refinance_product_transition',
    ],
  ),
  relation(
    'refinance_transition',
    'prepayments',
    'definition',
    'identifies a payoff channel',
    'A completed refinance retires the matched old loan and can return unscheduled principal to its MBS.',
    'The matched population is report-specific and non-causal; it does not cover every payoff or determine pool prepayment speed.',
    [
      'fannie_refinance_transition_2026',
      'freddie_refinance_product_transition',
    ],
  ),
  relation(
    'fixed_arm',
    'refinance_transition',
    'comparison',
    'can change at refinance',
    'The replacement loan can retain or change the old loan’s fixed-rate or adjustable-rate product and term.',
    'Product buckets and matched populations are provider-specific and descriptive, not proof of motive or causality.',
    [
      'fannie_refinance_transition_2026',
      'freddie_refinance_product_transition',
    ],
  ),
  relation(
    'second_lien',
    'refinance_transition',
    'comparison',
    'may preserve or replace the first lien',
    'A home-equity loan or HELOC can preserve the first lien, while a cash-out refinance replaces it.',
    'Matched refinance data are descriptive within a defined population; they do not cover every equity-access choice or establish motive or causality.',
    ['cfpb_cash_out_nmdb'],
  ),
  relation(
    'refinance_transition',
    'prepayment_aggregation',
    'measurement',
    'segments completed payoff principal',
    'Purpose, product and term transitions can segment completed refinance payoffs before principal is aggregated.',
    'A transition share is population-specific and descriptive, not SMM, CPR, market-wide volume or a causal estimate. Aggregate principal with aligned balance weights and event definitions.',
    [
      'fannie_refinance_transition_2026',
      'freddie_refinance_product_transition',
      'fhfa_refinance_2q26',
    ],
  ),
  relation(
    'prepayment_aggregation',
    'cpr',
    'measurement',
    'annualizes after aggregation',
    'Nonlinear annualization makes a weighted average of subgroup CPRs different from the pool’s annualized SMM.',
    'The annualized number describes a repeated monthly rate, not realized next-year repayments.',
    ['cohort'],
  ),
  relation(
    'pool_averages',
    'prepayment_aggregation',
    'measurement',
    'retains the distribution',
    'Equal weighted-average attributes can conceal different borrower groups and different principal repayment totals.',
    'Do not replace a nonlinear borrower response with its value at the average borrower.',
    ['cohort'],
  ),
  relation(
    'loan_balance',
    'prepayment_aggregation',
    'measurement',
    'determines principal weights',
    'Loan size affects the economic cost hurdle and the amount of principal a completed refinancing returns.',
    'Use the remaining balance after scheduled principal for the monthly speed denominator.',
    ['cohort', 'refinance_costs'],
  ),
  relation(
    'prepayment_aggregation',
    'prepayment_model_stability',
    'comparison',
    'separates mix from response',
    'A faster pool can reflect more weight in fast groups without any change in each group’s conditional prepayment rate.',
    'Compare consistent groups, dates and definitions before attributing a regime change.',
    ['cohort', 'model_validation_2026'],
  ),
  relation(
    'frictions',
    'prepayment_model_stability',
    'mechanism',
    'can change the response',
    'Lower application effort or processing constraints can change refinancing completion even with the same quoted rate incentive.',
    'This is conditional on an attractive available offer and borrower eligibility; an AI adoption claim is not proof of an effect.',
    ['mortgage_technology', 'refinancing_structural_change'],
  ),
  relation(
    'prepayment_model_stability',
    'oas',
    'measurement',
    'changes model-implied spread',
    'Holding the observed price fixed, a different projected payment stream can produce a different fitted OAS.',
    'Align curve, volatility, price basis and all other inputs; there is no universal direction across premium and discount claims.',
    ['fed_spreads'],
  ),
  relation(
    'prepayment_model_stability',
    'duration',
    'measurement',
    'changes shocked cash flows',
    'Matching base-case prepayments does not ensure the same response to a rate shock or the same effective duration.',
    'Specify the shock and which model assumptions are held fixed or re-estimated.',
    ['fed_spreads'],
  ),
  relation(
    'model_risk',
    'prepayment_model_stability',
    'definition',
    'includes changing borrower behavior',
    'Prepayment response instability is one specific source of uncertainty within a broader mortgage valuation model.',
    'Validation evidence applies to the tested population, data window and intended use.',
    ['model_validation_2026'],
  ),
];

export const response_paths = [
  {
    id: 'frictions_to_model_risk',
    title: 'When refinancing frictions change',
    description:
      'Connect borrower costs, pool composition and model-dependent MBS risk.',
    premise:
      'A mortgage rate incentive is only the starting point: the borrower must be willing and able to complete a new loan.',
    steps: [
      'frictions',
      'loan_balance',
      'refinance_transition',
      'prepayment_aggregation',
      'prepayment_model_stability',
      'oas',
      'duration',
    ],
    explanations: [
      'Separate the economic offer, eligibility and the effort required to complete refinancing.',
      'Compare the fixed cost burden with the loan balance and test whether that burden has actually fallen.',
      'Separate rate-and-term, cash-out, product and term transitions before treating completed refinance payoffs as one homogeneous response.',
      'Combine principal dollars using consistent monthly denominators before annualizing the pool speed.',
      'Distinguish a new population mix from a changed conditional response, and test on later outcomes.',
      'Interpret a changed fitted spread at the same price as conditional on the changed payment model.',
      'Check shocked cash flows too: matching one base-case speed does not validate a hedge sensitivity.',
    ],
    boundary:
      'This path is an interpretation and validation framework, not a prepayment forecast or pricing engine. Matched enterprise transitions neither cover every payoff nor identify borrower motive. Technology effects require evidence; lower costs do not remove credit constraints. Historical findings do not prescribe a future CPR, pay-up, OAS move or hedge.',
  },
];
