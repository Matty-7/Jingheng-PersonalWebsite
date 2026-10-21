import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const response_sources = {
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
    concepts: ['prepayment_aggregation', 'prepayment_model_stability'],
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
      'prepayment_aggregation',
      'prepayment_model_stability',
      'oas',
      'duration',
    ],
    explanations: [
      'Separate the economic offer, eligibility and the effort required to complete refinancing.',
      'Compare the fixed cost burden with the loan balance and test whether that burden has actually fallen.',
      'Combine principal dollars using consistent monthly denominators before annualizing the pool speed.',
      'Distinguish a new population mix from a changed conditional response, and test on later outcomes.',
      'Interpret a changed fitted spread at the same price as conditional on the changed payment model.',
      'Check shocked cash flows too: matching one base-case speed does not validate a hedge sensitivity.',
    ],
    boundary:
      'This path is an interpretation and validation framework, not a prepayment forecast or pricing engine. Technology effects require evidence; lower costs do not remove credit constraints. Historical findings do not prescribe a future CPR, pay-up, OAS move or hedge.',
  },
];
