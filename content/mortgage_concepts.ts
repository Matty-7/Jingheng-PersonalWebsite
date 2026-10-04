Warning: truncated output (original token count: 38356)
Total output lines: 4374

import {
  expansion_topics,
  expansion_sources,
  expansion_concepts,
  expansion_relationships,
  expansion_paths,
} from './fixed_income_expansion.ts';
import {
  spread_topics,
  spread_sources,
  spread_concepts,
  spread_relationships,
} from './mortgage_spreads.ts';
import { foundational_relationships } from './mortgage_relationships.ts';
import {
  context_topics,
  context_sources,
  context_concepts,
  context_relationships,
  context_paths,
} from './mortgage_context.ts';
import {
  analytics_topics,
  analytics_sources,
  analytics_concepts,
  analytics_relationships,
  analytics_paths,
} from './mortgage_analytics.ts';
import {
  atlas_topics,
  atlas_sources,
  atlas_concepts,
  atlas_relationships,
  atlas_paths,
} from './atlas_extensions.ts';
import {
  mechanism_topics,
  mechanism_sources,
  mechanism_concepts,
  mechanism_relationships,
  mechanism_models,
} from './mortgage_mechanisms.ts';
// Original public educational summaries. No employer data or implementation details.
export type MortgageConcept = {
  id: string;
  branch: string;
  topic: string;
  title: string;
  subtitle: string;
  aliases: string[];
  summary: string;
  distinction: string;
  formula?: { expression: string; assumptions: string; example?: string };
  links: { id: string; reason: string }[];
  question: string;
  answer: string;
  sources: string[];
};
export type MortgageRelationship = {
  id: string;
  source: string;
  target: string;
  label: string;
  reason: string;
  kind: 'mechanism' | 'definition' | 'measurement' | 'comparison';
  conditions?: string;
  sources?: string[];
};

export { mortgage_domains as mortgage_branches } from './mortgage_domains.ts';

const original_topics = [
  {
    id: 'loan_contract',
    branch: 'basics',
    title: 'The loan contract',
    concepts: ['principal_interest', 'amortization', 'fixed_arm', 'balloon'],
  },
  {
    id: 'pool_profile',
    branch: 'basics',
    title: 'Reading the collateral',
    concepts: ['pool_averages', 'wac', 'wam', 'wala', 'loan_balance'],
  },
  {
    id: 'pool_accounting',
    branch: 'basics',
    title: 'From borrower to investor',
    concepts: ['pool_factor', 'servicing', 'net_coupon'],
  },
  {
    id: 'speed',
    branch: 'prepayment',
    title: 'Measuring a speed',
    concepts: ['prepayments', 'smm', 'cpr', 'psa'],
  },
  {
    id: 'refinancing',
    branch: 'prepayment',
    title: 'The refinancing decision',
    concepts: ['incentive', 'frictions', 'burnout', 'lock_in'],
  },
  {
    id: 'other_paydowns',
    branch: 'prepayment',
    title: 'More than refinancing',
    concepts: ['turnover', 'curtailment', 'seasonality', 'buyouts'],
  },
  {
    id: 'guarantees',
    branch: 'trading',
    title: 'Issuance & guarantees',
    concepts: ['pass_through', 'agency', 'ginnie', 'non_agency'],
  },
  {
    id: 'pool_selection',
    branch: 'trading',
    title: 'Generic versus specific',
    concepts: ['tba', 'specified', 'pay_up', 'cheapest_deliverable'],
  },
  {
    id: 'market_mechanics',
    branch: 'trading',
    title: 'Delivery & financing',
    concepts: ['settlement', 'rolls', 'liquidity'],
  },
  {
    id: 'payment_timing',
    branch: 'valuation',
    title: 'Amounts and dates',
    concepts: ['cash_flows', 'wal', 'final_maturity', 'payment_delay'],
  },
  {
    id: 'discounting',
    branch: 'valuation',
    title: 'Discounting future money',
    concepts: ['pv', 'discount_factor', 'yield', 'reinvestment'],
  },
  {
    id: 'quotation',
    branch: 'valuation',
    title: 'What the price includes',
    concepts: ['price', 'accrual', 'day_count', 'price_32nds'],
  },
  {
    id: 'term_structure',
    branch: 'curves',
    title: 'A family of rates',
    concepts: ['par_curve', 'spot_curve', 'forward_curve', 'tenor'],
  },
  {
    id: 'benchmarks',
    branch: 'curves',
    title: 'Choosing a reference',
    concepts: ['treasury', 'sofr', 'ois', 'benchmark_matching'],
  },
  {
    id: 'spread_measures',
    branch: 'curves',
    title: 'What a spread holds fixed',
    concepts: ['spreads', 'nominal_spread', 'z_spread', 'oas'],
  },
  {
    id: 'sensitivities',
    branch: 'risk',
    title: 'Measuring exposure',
    concepts: ['duration', 'macaulay', 'modified_duration', 'dv01', 'key_rate'],
  },
  {
    id: 'embedded_option',
    branch: 'risk',
    title: 'The borrower’s option',
    concepts: ['convexity', 'extension', 'contraction', 'volatility'],
  },
  {
    id: 'hedge_choices',
    branch: 'risk',
    title: 'Managing a moving exposure',
    concepts: [
      'hedging',
      'treasury_hedge',
      'swap_hedge',
      'basis_risk',
      'model_risk',
    ],
  },
  {
    id: 'deal_rules',
    branch: 'structure',
    title: 'The rules of the deal',
    concepts: ['cmo', 'remic', 'waterfall', 'seniority'],
  },
  {
    id: 'principal_priority',
    branch: 'structure',
    title: 'Redirecting principal',
    concepts: ['sequential', 'pac', 'support', 'z_class'],
  },
  {
    id: 'cashflow_slices',
    branch: 'structure',
    title: 'Separating payment streams',
    concepts: ['io_po', 'io', 'po', 'floater'],
  },
  {
    id: 'loss_protection',
    branch: 'structure',
    title: 'Credit enhancement',
    concepts: ['subordination', 'oc', 'ic'],
  },
  {
    id: 'credit_events',
    branch: 'credit',
    title: 'From delinquency to loss',
    concepts: ['delinquency', 'default', 'severity', 'recovery_lag'],
  },
  {
    id: 'property_income',
    branch: 'credit',
    title: 'Property operating income',
    concepts: ['rent_roll', 'occupancy', 'noi'],
  },
  {
    id: 'debt_capacity',
    branch: 'credit',
    title: 'How much debt can it carry?',
    concepts: ['dscr', 'ltv', 'cap_rate', 'debt_yield'],
  },
  {
    id: 'refinance_exit',
    branch: 'credit',
    title: 'The maturity exit',
    concepts: ['refinance_risk', 'cmbs', 'conduit_sasb'],
  },
];

export const mortgage_topics = [
  ...original_topics
    .map((t) => ({
      ...t,
      concepts: t.concepts.filter(
        (id) => !atlas_concepts.some((c) => c.id === id),
      ),
    }))
    .filter((t) => t.concepts.length),
  ...atlas_topics,
  ...mechanism_topics,
  ...spread_topics,
  ...context_topics,
  ...analytics_topics,
  ...expansion_topics,
];

export const mortgage_sources: Record<
  string,
  { publisher: string; title: string; url: string }
> = {
  ...atlas_sources,
  ...mechanism_sources,
  ...spread_sources,
  ...context_sources,
  ...analytics_sources,
  ...expansion_sources,
  loan_performance_glossary: {
    publisher: 'Fannie Mae',
    title:
      'Single-Family Loan Performance Dataset and CRT Glossary · payment history and loan exits',
    url: 'https://capitalmarkets.fanniemae.com/media/6931/display',
  },
  trace_transactions: {
    publisher: 'FINRA',
    title:
      'Trade Activity and Trade History Data · executed trades and reporting times',
    url: 'https://www.finra.org/finra-data/fixed-income/about-trade-activity',
  },
  evaluated_pricing: {
    publisher: 'Bloomberg',
    title:
      'Evaluated Pricing Solutions · observations, comparables and valuation',
    url: 'https://professional.bloomberg.com/products/data/enterprise-catalog/pricing/evaluated-pricing/',
  },
  second_lien_case: {
    publisher: 'Structured Finance Association',
    title: 'From Revival to Scale: Second-Lien RMBS · September 17, 2026',
    url: 'https://structuredfinance.org/resources/sfa-research-corner-from-revival-to-scale-second-lien-rmbs-moves-into-a-new-phase/',
  },
  rate_transmission_case: {
    publisher: 'Apollo',
    title: 'Higher for Longer Hits the Lowest Rated · September 25, 2026',
    url: 'https://www.apollo.com/wealth/insights-news/insights/daily-spark/higher-for-longer-hits-the-lowest-rated',
  },
  yield_spread_case: {
    publisher: 'Apollo',
    title:
      'Recent Rates Volatility: Risks and Opportunities in Credit · September 26, 2026',
    url: 'https://www.apollo.com/wealth/insights-news/insights/daily-spark/recent-rates-volatility-risks-and-opportunities-in-credit',
  },
  score_disclosure_case: {
    publisher: 'Fannie Mae',
    title:
      'CRT Disclosure Updates to Support Credit Score Changes · August 17, 2026',
    url: 'https://capitalmarkets.fanniemae.com/credit-risk-transfer/single-family-credit-risk-transfer/crt-disclosure-updates-credit-score-changes',
  },
  cfpb: {
    publisher: 'CFPB',
    title: 'How does paying down a mortgage work?',
    url: 'https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/',
  },
  arm: {
    publisher: 'CFPB',
    title: 'Fixed-rate and adjustable-rate mortgages',
    url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-fixed-rate-and-adjustable-rate-mortgage-arm-loan-en-100/',
  },
  arm_charm: {
    publisher: 'CFPB',
    title:
      'Consumer Handbook on Adjustable-Rate Mortgages · index, margin and adjustment terms',
    url: 'https://files.consumerfinance.gov/f/documents/cfpb_charm_booklet.pdf',
  },
  arm_caps: {
    publisher: 'CFPB',
    title:
      'ARM rate caps · initial, subsequent and lifetime adjustment limits · January 21, 2025',
    url: 'https://www.consumerfinance.gov/ask-cfpb/what-are-rate-caps-with-an-adjustable-rate-mortgage-arm-and-how-do-they-work-en-1951/',
  },
  basics: {
    publisher: 'Fannie Mae',
    title: 'Basics of Single-Family MBS · cash flows, factors and guarantees',
    url: 'https://capitalmarkets.fanniemae.com/media/4271/display',
  },
  cohort: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Asset Pricing with Cohort-Based Trading · pp. 35–36',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr931.pdf#page=37',
  },
  burnout_history: {
    publisher: 'Federal Reserve Bank of New York',
    title:
      'Asset Pricing with Cohort-Based Trading · Appendix IA.3, refinancing history · revised October 2021',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr931.pdf#page=88',
  },
  burnout_constraints: {
    publisher: 'Federal Reserve Board',
    title:
      'First Lien Mortgage Model · loan age, updated LTV and burnout, pp. 159–161 · January 2026',
    url: 'https://www.federalreserve.gov/supervisionreg/files/credit-risk-models.pdf#page=159',
  },
  guide: {
    publisher: 'SIFMA',
    title: 'Investor’s Guide to Mortgage Securities · hosted by Fifth Third',
    url: 'https://www.53.com/content/dam/fifth-third/docs/legal/fts-sifma-investors-guide.pdf',
  },
  formulas: {
    publisher: 'SIFMA',
    title: 'Standard Formulas · SF-47–57, yield and average-life conventions',
    url: 'https://www.sifma.org/wp-content/uploads/2017/08/chsf.pdf',
  },
  tba: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'TBA Trading and Liquidity in the Agency MBS Market',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/epr/2013/1212vick.pdf',
  },
  specified_pool_pricing: {
    publisher: 'Federal Reserve Bank of New York',
    title:
      'The Implementation of Current Asset Purchases · TBA and specified-pool pricing · March 27, 2013',
    url: 'https://www.newyorkfed.org/newsevents/speeches/2013/pot130327.html',
  },
  fannie_mbs_basics: {
    publisher: 'Fannie Mae',
    title:
      'Basics of Fannie Mae Single-Family MBS · TBA and specified pools, p. 5 · 2025',
    url: 'https://capitalmarkets.fanniemae.com/resources/file/mbs/pdf/basics-sf-mbs.pdf#page=5',
  },
  dollar_roll_faq: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Agency MBS FAQs · August 2014 archive, dollar-roll mechanics',
    url: 'https://www.newyorkfed.org/markets/ambs/ambs_faq.html',
  },
  convexity: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Convexity Event Risks in a Rising Interest Rate Environment',
    url: 'https://libertystreeteconomics.newyorkfed.org/2014/03/convexity-event-risks-in-a-rising-interest-rate-environment/',
  },
  dv01: {
    publisher: 'CME Group',
    title: 'Treasury Analytics · DV01 and yield sensitivity',
    url: 'https://www.cmegroup.com/tools-information/quikstrike/quikstrike-treasury-analytics-user-guide.html',
  },
  hedge: {
    publisher: 'CME Group',
    title: 'Hedging 3-Year Note Issuance · DV01 hedge ratio',
    url: 'https://www.cmegroup.com/education/articles-and-reports/hedging-3-year-note-issuance',
  },
  structure: {
    publisher: 'Fannie Mae',
    title: 'Basics of Structured Transactions · class types and payment rules',
    url: 'https://capitalmarkets.fanniemae.com/media/4396/display',
  },
  glossary: {
    publisher: 'FINRA',
    title: 'Mortgage-Backed Securities Data Glossary',
    url: 'https://www.finra.org/finra-data/fixed-income/mbs/glossary',
  },
  investor: {
    publisher: 'SEC · Investor.gov',
    title: 'Mortgage-Backed Securities and Collateralized Mortgage Obligations',
    url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/mortgage-backed-securities-and-collateralized',
  },
  disclosure: {
    publisher: 'FINRA',
    title: 'Regulatory Notice 12-56 · pool-characteristic definitions',
    url: 'https://www.finra.org/rules-guidance/notices/12-56',
  },
  freddie_factor: {
    publisher: 'Freddie Mac',
    title:
      'Calculation of Interest and Principal Payments · applicable factors',
    url: 'https://capitalmarkets.freddiemac.com/mbs/docs/fs_paymentcalc.pdf',
  },
  freddie_cpr: {
    publisher: 'Freddie Mac',
    title: 'Daily Prepayment Report Guide · CPR annualization, p. 13',
    url: 'https://capitalmarkets.freddiemac.com/mbs/docs/dpr_guide.pdf',
  },
  freddie_faq: {
    publisher: 'Freddie Mac',
    title: 'Mortgage Securities FAQs · support and accrual classes',
    url: 'https://capitalmarkets.freddiemac.com/mbs/products/faq',
  },
  fed_spreads: {
    publisher: 'Federal Reserve Board',
    title: 'FEDS 2014-112 · spread definitions, Appendix B.3',
    url: 'https://www.federalreserve.gov/econresdata/feds/2014/files/2014112pap.pdf#page=45',
  },
  cfa_valuation: {
    publisher: 'CFA Institute',
    title: 'Fixed-Income Bond Valuation: Prices and Yields · public overview',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/fixed-income-bond-valuation-prices-and-yields',
  },
  cfa_risk: {
    publisher: 'CFA Institute',
    title:
      'Curve-Based and Empirical Fixed-Income Risk Measures · public overview',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/curve-based-and-empirical-fixed-income-risk-measures',
  },
  remic: {
    publisher: 'Fannie Mae',
    title: 'Structured Transactions: REMICs and Grantor Trusts',
    url: 'https://capitalmarkets.fanniemae.com/mortgage-backed-securities/structured-transactions-products/structured-transactions-products-remics-and-grantor-trusts',
  },
  irs: {
    publisher: 'IRS',
    title: 'Form 1066 Instructions · REMIC requirements under Who Must File',
    url: 'https://www.irs.gov/instructions/i1066',
  },
  smbs: {
    publisher: 'Fannie Mae',
    title:
      'SMBS Prospectus · stripped cash flows and prepayment risk, pp. 2 and 8',
    url: 'https://capitalmarkets.fanniemae.com/sites/capmrkt/files/syndicated/mbs/smbspros/FNM_SMBS_Base_20230501.pdf',
  },
  sofr: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Secured Overnight Financing Rate',
    url: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  },
  treasury_curve: {
    publisher: 'U.S. Treasury',
    title: 'Treasury Yield Curve Methodology',
    url: 'https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics/treasury-yield-curve-methodology',
  },
  cre: {
    publisher: 'OCC',
    title:
      'Commercial Real Estate Lending · income, debt capacity and repayment risk',
    url: 'https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf',
  },
  ginnie: {
    publisher: 'Ginnie Mae',
    title: 'Our Guaranty',
    url: 'https://www.ginniemae.gov/about-us/who-we-are/funding-government-lending',
  },
  arrc: {
    publisher: 'Federal Reserve Bank of New York · ARRC',
    title: 'An Updated User’s Guide to SOFR',
    url: 'https://www.newyorkfed.org/medialibrary/Microsites/arrc/files/2021/users-guide-to-sofr2021-update.pdf',
  },
  lockin: {
    publisher: 'FHFA',
    title: 'The Lock-In Effect of Rising Mortgage Rates',
    url: 'https://www.fhfa.gov/research/papers/wp2403',
  },
  lockin_mobility: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Mortgage Rate Lock-In and Homeowners’ Moving Plans',
    url: 'https://libertystreeteconomics.newyorkfed.org/2024/05/mortgage-rate-lock-in-and-homeowners-moving-plans/',
  },
  clo: {
    publisher: 'Guggenheim Investments',
    title: 'Understanding Collateralized Loan Obligations',
    url: 'https://www.guggenheiminvestments.com/perspectives/portfolio-strategy/understanding-collateralized-loan-obligations-clo',
  },
  treasury_futures: {
    publisher: 'CME Group',
    title: 'Understanding Treasury Futures · Quotation Practices, p. 3',
    url: 'https://www.cmegroup.com/content/dam/cmegroup/education/files/understanding-treasury-futures.pdf#page=4',
  },
  prepayment_macro: {
    publisher: 'MSCI · Yihai Yu',
    title: 'MBS prepayment in 2020: Looking back, looking ahead',
    url: 'https://www.msci.com/research-and-insights/blog-post/mbs-prepayment-in-2020-looking-back-looking-ahead',
  },
  crefc_c: {
    publisher: 'CRE Finance Council',
    title: 'CMBS Glossary · Conduit',
    url: 'https://www.crefc.org/cre/cre/content/learn/Glossary/CREFC_Glossary.aspx?GlossaryTabs=3',
  },
  crefc_s: {
    publisher: 'CRE Finance Council',
    title: 'CMBS Glossary · Single Asset Single Borrower',
    url: 'https://www.crefc.org/cre/cre/content/learn/Glossary/CREFC_Glossary.aspx?GlossaryTabs=19',
  },
};

const original_concepts: MortgageConcept[] = [
  {
    id: 'principal_interest',
    branch: 'basics',
    title: 'Principal & interest',
    subtitle: 'Balance versus borrowing cost',
    aliases: ['P&I', 'UPB', 'unpaid principal balance'],
    summary:
      'Principal is the unpaid loan balance. Interest is the cost of borrowing it. A payment can contain both, but only the principal portion reduces the balance.',
    formula: {
      expression: 'Interest = opening balance × monthly rate',
      assumptions:
        'A simplified monthly fixed-rate loan; monthly rate = annual note rate ÷ 12. Taxes, insurance and fees are separate.',
    },
    distinction:
      'A borrower’s full monthly bill can exceed the principal-and-interest payment.',
    links: [
      {
        id: 'amortization',
        reason: 'Splits each scheduled payment into these two parts.',
      },
      {
        id: 'cash_flows',
        reason: 'Carries principal and interest through to investors.',
      },
    ],
    question: 'Does paying interest reduce what is owed?',
    answer:
      'No. Principal repayment reduces the balance; interest pays for the time the money was borrowed.',
    sources: ['cfpb'],
    topic: 'loan_contract',
  },
  {
    id: 'amortization',
    branch: 'basics',
    title: 'Amortization',
    subtitle: 'Scheduled principal repayment',
    aliases: ['scheduled principal', 'level payment'],
    summary:
      'Amortization pays down principal over the loan’s schedule. With a level fixed-rate payment, interest falls as the balance declines, leaving more of each payment for principal.',
    distinction:
      'Scheduled amortization and an early payoff are different components of principal return.',
    links: [
      {
        id: 'principal_interest',
        reason: 'Explains the two parts of the payment.',
      },
      {
        id: 'smm',
        reason:
          'Scheduled principal must be removed before measuring monthly prepayments.',
      },
      {
        id: 'cash_flows',
        reason:
          'Scheduled amortization contributes principal independently of unscheduled payoffs.',
      },
    ],
    question:
      'Why does the principal share grow even when the payment is unchanged?',
    answer:
      'The smaller outstanding balance produces less interest, so more of the same payment repays principal.',
    sources: ['cfpb'],
    topic: 'loan_contract',
  },
  {
    id: 'fixed_arm',
    branch: 'basics',
    title: 'Fixed rate & ARM',
    subtitle: 'How the note rate changes',
    aliases: ['adjustable rate mortgage', 'index', 'margin', 'reset', 'caps'],
    summary:
      'A fixed-rate loan keeps its note rate. A hybrid adjustable-rate mortgage (ARM) holds an initial rate for a stated period, then resets at contract intervals. A 5/1 ARM has a five-year initial period followed by annual resets.',
    formula: {
      expression: 'Fully indexed rate = contract index observation + margin',
      assumptions:
        'Both inputs are annual rates. The contract specifies the observation date, lookback and rounding. This reference calculation is not necessarily the actual reset rate or the payment change because contractual limits and amortization still apply.',
      example:
        'Hypothetical: 4% index + 2% margin = 6% fully indexed rate. From a 3% initial rate, a 2-percentage-point initial cap limits the first reset to at most 5%, assuming no other limit binds. Even an unchanged index can allow a rise when the initial rate was below the fully indexed rate.',
    },
    distinction:
      'The initial cap limits the first adjustment, the subsequent cap limits each later adjustment and the lifetime cap limits the rate over the loan’s term; cap changes are measured in percentage points from the contract’s comparison rate. Floors and limits on downward adjustments also depend on the contract. The fully indexed rate is a calculation reference, not a promise that the note rate or payment moves there. A fixed note rate still does not freeze taxes or insurance.',
    links: [
      {
        id: 'principal_interest',
        reason: 'The note rate determines interest owed.',
      },
      {
        id: 'incentive',
        reason: 'The existing loan’s terms affect the benefit of refinancing.',
      },
      {
        id: 'caps_floors',
        reason:
          'Coupon limits create asymmetric exposure to changes in a reference rate.',
      },
      {
        id: 'reset_payment_dates',
        reason:
          'The contract clock separates rate observation, reset, accrual and payment.',
      },
    ],
    question:
      'An ARM starts at 3%. At its first reset, the index is 4%, the margin is 2% and the initial cap is 2 percentage points. If no other limit binds, what do these figures establish?',
    answer:
      'The fully indexed reference rate is 6%, but the initial cap limits the first reset to at most 5%. The contract’s reset date and other terms still govern when and how the actual rate changes.',
    sources: ['arm', 'arm_charm', 'arm_caps'],
    topic: 'loan_contract',
  },
  {
    id: 'pool_factor',
    branch: 'basics',
    title: 'Pool factor',
    subtitle: 'Original face → current face',
    aliases: ['current face', 'original face', 'factor'],
    summary:
      'A pool factor expresses remaining principal as a share of original principal. It translates the original face amount of a holding into its current face amount.',
    formula: {
      expression: 'Current face = original face × factor',
      assumptions:
        'Use the factor for the correct pool and reporting month; face amounts are dollars.',
      example: '$100,000 original face × 0.72 factor = $72,000 current face.',
    },
    distinction:
      'A factor is a principal ratio, not a bond price or an investment return.',
    links: [
      {
        id: 'prepayments',
        reason: 'Unscheduled paydowns change the factor.',
      },
      {
        id: 'price',
        reason:
          'Current face is used to convert a price quote into a dollar amount.',
      },
    ],
    question: 'Does a 0.72 factor mean the holding lost 28% in market value?',
    answer:
      'No. It says principal has paid down; market value also depends on the price of the remaining balance.',
    sources: ['freddie_factor'],
    topic: 'pool_accounting',
  },
  {
    id: 'pool_averages',
    branch: 'basics',
    title: 'Pool composition',
    subtitle: 'An average hides a distribution',
    aliases: ['pool characteristics', 'weighted averages'],
    summary:
      'WAC summarizes loan rates, WAM remaining contractual maturity, and WALA elapsed loan age. Weights and dates follow the disclosure convention; these averages hide variation inside a pool.',
    distinction:
      'WAC is not the investor’s security coupon. WAM is not the expected timing of principal repayment.',
    links: [
      {
        id: 'pass_through',
        reason:
          'Fees help explain the difference between loan rates and the security coupon.',
      },
      {
        id: 'psa',
        reason: 'Loan age matters to the benchmark prepayment ramp.',
      },
      {
        id: 'wal',
        reason: 'Measures principal timing rather than contractual maturity.',
      },
    ],
    question: 'Can two pools with the same WAC repay at different speeds?',
    answer:
      'Yes. Their loan ages, balances and borrower characteristics can differ even when the average coupon matches.',
    sources: ['disclosure', 'glossary'],
    topic: 'pool_profile',
  },
  {
    id: 'prepayments',
    branch: 'prepayment',
    title: 'Prepayments',
    subtitle: 'Principal returned ahead of schedule',
    aliases: ['voluntary', 'involuntary', 'refinance', 'curtailment', 'buyout'],
    summary:
      'Refinancing, home sales and extra payments can return principal early. Certain removals of delinquent loans can also create unscheduled principal payments to security holders.',
    distinction:
      'Unscheduled principal does not always mean a borrower chose to refinance. Deal and reporting rules matter.',
    links: [
      {
        id: 'smm',
        reason:
          'Measures monthly unscheduled principal relative to the eligible balance.',
      },
      {
        id: 'cash_flows',
        reason:
          'Changes when investors receive principal and stop earning interest on it.',
      },
      {
        id: 'pool_factor',
        reason:
          'Unscheduled principal repayment reduces the remaining balance alongside amortization.',
      },
      {
        id: 'duration',
        reason:
          'Effective duration revalues cash flows after rate shocks, including the modeled prepayment response.',
      },
      {
        id: 'contraction',
        reason:
          'Faster-than-assumed principal return can shorten cash-flow timing and hurt a premium buyer.',
      },
      {
        id: 'io',
        reason:
          'Faster paydown removes principal that would otherwise generate interest for the IO.',
      },
      {
        id: 'po',
        reason:
          'Earlier repayment can improve the value of a discounted PO, holding other assumptions fixed.',
      },
    ],
    question: 'Can principal return early even without falling mortgage rates?',
    answer:
      'Yes. Borrowers move or make extra payments, and some loan removals are unrelated to refinancing incentives.',
    sources: ['basics'],
    topic: 'speed',
  },
  {
    id: 'smm',
    branch: 'prepayment',
    title: 'SMM',
    subtitle: 'Single monthly mortality',
    aliases: ['monthly prepayment rate'],
    summary:
      'SMM measures monthly prepayments against principal remaining after scheduled principal has been repaid.',
    formula: {
      expression: 'SMM = prepayments ÷ (opening balance − scheduled principal)',
      assumptions: 'Use same-month amounts and a positive denominator.',
    },
    distinction: 'Opening balance alone is the wrong denominator.',
    links: [
      {
        id: 'amortization',
        reason: 'Defines scheduled principal.',
      },
      {
        id: 'cpr',
        reason: 'Annualizes monthly survival.',
      },
    ],
    question: 'What is the closing balance?',
    answer:
      'After scheduled principal, multiply the remaining balance by (1 − SMM).',
    sources: ['cohort'],
    topic: 'speed',
  },
  {
    id: 'cpr',
    branch: 'prepayment',
    title: 'CPR',
    subtitle: 'Conditional prepayment rate',
    aliases: ['constant prepayment rate', 'annualized prepayment'],
    summary:
      'CPR expresses a monthly prepayment speed on an annualized basis by compounding survival over twelve months.',
    formula: {
      expression: 'CPR = 1 − (1 − SMM)¹²\nSMM = 1 − (1 − CPR)^(1/12)',
      assumptions:
        'Enter rates as decimals. The annualization assumes the same monthly speed for twelve months.',
      example: '6% CPR corresponds to about 0.5143% SMM.',
    },
    distinction:
      'CPR ÷ 12 is an approximation. An annualized observation is not a forecast of the next year.',
    links: [
      {
        id: 'smm',
        reason: 'Translates the annualized rate back into a monthly rate.',
      },
      {
        id: 'psa',
        reason: 'Specifies a changing CPR benchmark as loans age.',
      },
    ],
    question: 'Does 6% CPR mean 6% of principal prepays every month?',
    answer:
      'No. Its monthly equivalent is roughly half a percent, applied after scheduled principal.',
    sources: ['freddie_cpr'],
    topic: 'speed',
  },
  {
    id: 'psa',
    branch: 'prepayment',
    title: 'PSA',
    subtitle: 'An age-based prepayment benchmark',
    aliases: ['Public Securities Association', '100 PSA', 'seasoning ramp'],
    summary:
      '100 PSA ramps annualized prepayments from 0.2% CPR in loan month one to 6% in month thirty, then holds that benchmark speed. Other PSA percentages scale the path.',
    formula: {
      expression: 'CPRₘ = k × min(0.002m, 0.06)',
      assumptions:
        'm is loan age in months starting at 1. k = PSA percentage ÷ 100; 150 PSA means k = 1.5. CPR is a decimal; use only valid rates below 100%.',
      example: '150 PSA at month 10 gives 1.5 × 2% = 3% CPR.',
    },
    distinction:
      'The ramp starts at origination, not at the day an investor buys a seasoned pool.',
    links: [
      {
        id: 'cpr',
        reason: 'Provides the annualized rate at each loan age.',
      },
      {
        id: 'pool_averages',
        reason: 'Loan age helps locate collateral along the benchmark.',
      },
    ],
    question: 'Is 100 PSA the same as a constant 6% CPR from month one?',
    answer:
      'No. They match only from loan month thirty onward under the standard ramp.',
    sources: ['guide'],
    topic: 'speed',
  },
  {
    id: 'incentive',
    branch: 'prepayment',
    title: 'Refinancing incentive',
    subtitle: 'The benefit of replacing a loan',
    aliases: ['refinancing incentive', 'borrower option'],
    summary:
      'A borrower compares the existing mortgage with the terms available on a replacement loan. Potential payment savings depend on the rate difference, balance, costs and expected time in the home.',
    distinction:
      'An attractive rate difference does not make every borrower refinance.',
    links: [
      {
        id: 'prepayments',
        reason: 'Borrower choices become unscheduled principal.',
      },
      {
        id: 'specified',
        reason:
          'Collateral characteristics can change the value of prepayment protection.',
      },
      {
        id: 'convexity',
        reason:
          'Rate-sensitive exercise changes the shape of price sensitivity.',
      },
    ],
    question: 'Why can equal-coupon pools repay differently?',
    answer:
      'Borrower constraints, refinancing histories and transaction costs can differ.',
    sources: ['cohort'],
    topic: 'refinancing',
  },
  {
    id: 'pass_through',
    branch: 'trading',
    title: 'Pass-through MBS',
    subtitle: 'From loan pool to security',
    aliases: [
      'mortgage backed security',
      'securitization',
      'servicing',
      'guarantee fee',
    ],
    summary:
      'A pass-through security channels mortgage-pool payments to investors. Loan interest supports the investor coupon after applicable servicing and guarantee fees.',
    distinction:
      'The security coupon and the borrowers’ note rates describe different cash flows.',
    links: [
      {
        id: 'pool_averages',
        reason: 'WAC describes the loans behind the security.',
      },
      {
        id: 'cash_flows',
        reason:
          'Separates interest, scheduled principal and unscheduled principal.',
      },
      {
        id: 'cmo',
        reason: 'Further redistributes these payments among classes.',
      },
    ],
    question: 'Does a 6% loan coupon imply a 6% security coupon?',
    answer:
      'No. Fees and the security’s terms affect the amount of interest passed through.',
    sources: ['basics'],
    topic: 'guarantees',
  },
  {
    id: 'agency',
    branch: 'trading',
    title: 'Agency & non-agency',
    subtitle: 'Guarantees and credit exposure',
    aliases: [
      'Fannie Mae',
      'Freddie Mac',
      'Ginnie Mae',
      'private label',
      'credit risk',
    ],
    summary:
      'Agency MBS carry guarantees under the issuer’s program. Non-agency securities rely on their collateral and structural protections. Guarantee coverage and legal backing differ across programs.',
    distinction:
      'Credit protection does not remove interest-rate, prepayment or liquidity risk. Not every agency guarantee is the same sovereign obligation.',
    links: [
      {
        id: 'tba',
        reason: 'Standard agency collateral supports forward trading.',
      },
      {
        id: 'extension',
        reason:
          'Principal timing remains uncertain even with credit protection.',
      },
    ],
    question: 'What can rising rates do to expected principal timing?',
    answer:
      'If refinancing slows, principal can stay outstanding longer and the investment can become more rate-sensitive. The response depends on the collateral and structure.',
    sources: ['investor'],
    topic: 'guarantees',
  },
  {
    id: 'tba',
    branch: 'trading',
    title: 'TBA',
    subtitle: 'To-be-announced trading',
    aliases: ['forward', 'pool allocation'],
    summary:
      'A TBA trade agrees standardized security characteristics and settlement terms before the individual eligible pools are allocated.',
    distinction:
      'The buyer knows the agreed trade characteristics, but not the final pool identities at trade time.',
    links: [
      {
        id: 'specified',
        reason: 'Identifies the collateral at trade time instead.',
      },
      {
        id: 'rolls',
        reason:
          'Uses two settlement months to transfer an exposure through time.',
      },
      {
        id: 'liquidity',
        reason:
          'Fungible delivery conventions can concentrate trading in a broader market.',
      },
    ],
    question: 'Is every mortgage deliverable?',
    answer:
      'No. Trade characteristics and eligibility rules constrain delivery.',
    sources: ['tba'],
    topic: 'pool_selection',
  },
  {
    id: 'specified',
    branch: 'trading',
    title: 'Specified pools',
    subtitle: 'Collateral characteristics and pay-ups',
    aliases: ['specified pool', 'payup', 'pay-up', 'loan balance'],
    summary:
      'A specified-pool trade identifies its collateral. A pay-up is a price difference relative to a comparable TBA position, reflecting characteristics investors value.',
    distinction: 'A pay-up is a price premium, not an extra coupon payment.',
    links: [
      {
        id: 'tba',
        reason: 'Supplies the comparison used for a pay-up.',
      },
      {
        id: 'incentive',
        reason: 'Borrower behavior helps explain why collateral can matter.',
      },
      {
        id: 'pay_up',
        reason:
          'Specified collateral can command a premium over comparable generic TBA delivery.',
      },
    ],
    question: 'Why can equal-coupon pools have different prices?',
    answer: 'Their collateral and expected payment patterns differ.',
    sources: ['tba'],
    topic: 'pool_selection',
  },
  {
    id: 'rolls',
    branch: 'trading',
    title: 'Dollar rolls',
    subtitle: 'A price drop is not a financing rate',
    aliases: [
      'dollar roll',
      'roll drop',
      'drop',
      'settlement',
      'implied financing',
    ],
    summary:
      'From the sell-near / buy-far perspective, a dollar roll sells TBA securities for earlier settlement and buys similar eligible securities for later settlement. The seller gives up the intervening principal and interest entitlement; the returning pools can differ. The drop is the near-month price minus the far-month price.',
    distinction:
      'The drop is a price difference, not a return or annualized financing rate. A financing comparison needs expected prepayments, payment timing, accrued interest, the settlement interval and a comparable funding alternative. Principal received by a holder reduces the remaining balance; it is not all profit.',
    formula: {
      expression: 'D = P_near − P_far',
      assumptions:
        'Both prices use clean-price points per $100 current face for comparable eligible TBA contracts. A negative drop is possible. This quotation identity excludes accrued interest and does not calculate settlement cash or financing cost.',
      example:
        'Illustrative: 99.625 − 99.375 = 0.250 price points. That is not a 0.25% investment return.',
    },
    links: [
      {
        id: 'tba',
        reason: 'Defines the deliverable exposure in each leg.',
      },
      {
        id: 'cash_flows',
        reason: 'Payments forgone between settlements affect the comparison.',
      },
      {
        id: 'repo',
        reason:
          'Compare financing while retaining the collateral’s economic cash flows.',
      },
      {
        id: 'cheapest_deliverable',
        reason: 'Later allocation can change the collateral received.',
      },
    ],
    question: 'Does a positive drop alone prove attractive financing?',
    answer:
      'No. Forgone payments can outweigh the drop and any funding benefit. Prepayment assumptions and the characteristics of the pools delivered later also affect the comparison.',
    sources: ['tba', 'dollar_roll_faq', 'basics', 'repo_public'],
    topic: 'market_mechanics',
  },
  {
    id: 'cash_flows',
    branch: 'valuation',
    title: 'Cash-flow components',
    subtitle: 'Interest + scheduled + unscheduled principal',
    aliases: ['cash flow', 'principal distribution', 'payment delay'],
    summary:
      'For a simple pass-through, investor payments combine interest, scheduled principal and unscheduled principal. Timing follows the security’s distribution rules.',
    distinction:
      'Contractual cash flows follow the loan terms. Scenario cash flows add a particular set of prepayment, default and recovery assumptions. Expected cash flows require probabilities across possible outcomes; a single base case is not automatically a probability-weighted expectation. Principal returned is not all investment income.',
    links: [
      {
        id: 'prepayments',
        reason: 'Changes the unscheduled-principal component.',
      },
      {
        id: 'wal',
        reason: 'Summarizes the timing of principal payments.',
      },
      {
        id: 'pv',
        reason: 'Discounts the payment stream into a present amount.',
      },
    ],
    question:
      'An analyst labels one projected cash-flow path “base case.” Is it necessarily the probability-weighted expected cash flow?',
    answer:
      'No. A base case is one selected set of assumptions. A probability-weighted expectation requires an explicit treatment of possible outcomes and their probabi…18356 tokens truncated…overy; outcomes depend on circumstances.',
    sources: ['cre'],
    links: [
      {
        id: 'default',
        reason: 'Persistent payment problems can develop into default.',
      },
      {
        id: 'buyouts',
        reason: 'Applicable agency rules can link delinquency to pool removal.',
      },
    ],
    aliases: [],
    topic: 'credit_events',
    branch: 'credit',
  },
  {
    id: 'default',
    title: 'Default',
    subtitle: 'Failure under the loan contract',
    summary:
      'Default depends on contractual obligations and triggers. It can lead to restructuring, enforcement or collateral recovery.',
    distinction: 'Default frequency and loss severity are separate dimensions.',
    question: 'Does every default produce a 100% loss?',
    answer: 'No. Recoveries can offset part or all of the principal exposure.',
    sources: ['cre'],
    links: [
      {
        id: 'severity',
        reason: 'Recovery outcomes determine the loss on a defaulted balance.',
      },
      {
        id: 'recovery_lag',
        reason: 'Recovering cash can take time.',
      },
    ],
    aliases: [],
    topic: 'credit_events',
    branch: 'credit',
  },
  {
    id: 'severity',
    title: 'Loss severity',
    subtitle: 'How much is lost after default',
    summary:
      'Loss severity measures loss relative to the defaulted exposure under a stated recovery and cost convention.',
    distinction:
      'A default probability is not a loss percentage conditional on default.',
    question: 'Why do collateral values matter after default?',
    answer: 'Sale proceeds and recovery costs affect how much remains unpaid.',
    sources: ['cre'],
    links: [
      {
        id: 'subordination',
        reason: 'Realized collateral losses consume available protection.',
      },
      {
        id: 'ltv',
        reason: 'A smaller equity cushion can leave more debt exposed.',
      },
    ],
    aliases: ['LGD', 'loss given default'],
    topic: 'credit_events',
    branch: 'credit',
  },
  {
    id: 'recovery_lag',
    title: 'Recovery lag',
    subtitle: 'Loss is also a timing problem',
    summary:
      'Recoveries may arrive after workouts, foreclosure or sale. Even an ultimately recovered dollar can have a lower present value when delayed.',
    distinction:
      'Recovery amount and recovery timing are distinct assumptions.',
    question: 'Can equal recoveries have different present values?',
    answer:
      'Yes. Later payment is discounted for longer under a positive discount rate.',
    sources: ['cre', 'cfa_valuation'],
    links: [
      {
        id: 'pv',
        reason: 'Delayed recovery changes the date of a valued cash flow.',
      },
      {
        id: 'cash_flows',
        reason: 'Credit scenarios change both amounts and dates.',
      },
    ],
    aliases: [],
    topic: 'credit_events',
    branch: 'credit',
  },
  {
    id: 'rent_roll',
    title: 'Rent roll',
    subtitle: 'The leases behind property income',
    summary:
      'A rent roll records tenants and lease economics, including rent, space and expirations.',
    distinction:
      'A full building today can still face clustered future lease expirations.',
    question: 'Why inspect the expiry schedule?',
    answer:
      'Tenant departures or renegotiations can change future rental income.',
    sources: ['cre'],
    links: [
      {
        id: 'occupancy',
        reason: 'Lease events affect how much space earns rent.',
      },
      {
        id: 'noi',
        reason: 'Rent receipts contribute to property operating income.',
      },
    ],
    aliases: [],
    topic: 'property_income',
    branch: 'credit',
  },
  {
    id: 'occupancy',
    title: 'Occupancy',
    subtitle: 'Space occupied versus rent earned',
    summary:
      'Physical occupancy measures occupied space; economic occupancy reflects income relative to an appropriate potential-rent measure.',
    distinction:
      'Occupied space can still produce reduced cash income because of concessions or collection problems.',
    question: 'Can occupancy look healthy while income weakens?',
    answer:
      'Yes. Rent reductions and collection shortfalls can reduce cash income.',
    sources: ['cre'],
    links: [
      {
        id: 'noi',
        reason: 'Rent-generating occupancy affects operating income.',
      },
    ],
    aliases: [],
    topic: 'property_income',
    branch: 'credit',
  },
  {
    id: 'noi',
    title: 'NOI',
    subtitle: 'Net operating income',
    summary:
      'NOI measures property operating income after operating expenses under a stated convention. It is before debt service.',
    distinction:
      'Underwritten NOI and current reported NOI may use different adjustments.',
    question: 'Does lower NOI always mean immediate default?',
    answer: 'No. Debt service, reserves and borrower support also matter.',
    sources: ['cre'],
    links: [
      {
        id: 'dscr',
        reason: 'Less NOI lowers coverage if debt service is unchanged.',
      },
      {
        id: 'cap_rate',
        reason: 'Income is an input to a capitalized property value.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'NOI = property operating revenue − operating expenses',
      assumptions:
        'Use consistent periods and a defined expense convention; financing costs are separate.',
    },
    topic: 'property_income',
    branch: 'credit',
  },
  {
    id: 'dscr',
    title: 'DSCR',
    subtitle: 'Debt-service coverage ratio',
    summary:
      'DSCR compares available income with the debt service it must cover.',
    distinction:
      'Origination DSCR reflects the underwriting snapshot. A current or re-underwritten ratio needs updated income and debt service measured over aligned periods. Rental-loan and commercial-property programs can define eligible income and debt service differently; preserve the stated calculation basis.',
    question:
      'A loan had a 1.4× DSCR at origination. Does that establish its coverage today?',
    answer:
      'No. Recheck current income, the relevant debt service and their measurement periods. Falling income or a higher refinancing rate can weaken coverage even when the original ratio was strong.',
    sources: ['cre'],
    links: [
      {
        id: 'refinance_risk',
        reason:
          'Weaker income coverage can limit the size of a replacement loan.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'DSCR = NOI ÷ debt service',
      assumptions:
        'Both amounts cover the same period. Underwriting and covenant definitions can differ.',
    },
    topic: 'debt_capacity',
    branch: 'credit',
  },
  {
    id: 'ltv',
    title: 'LTV',
    subtitle: 'Loan-to-value ratio',
    summary: 'LTV compares debt with property value.',
    distinction:
      'A lower property value raises LTV when the loan balance is unchanged.',
    question: 'What does a value decline do to the equity cushion?',
    answer:
      'It reduces the value beneath the debt and can constrain refinancing.',
    sources: ['cre'],
    links: [
      {
        id: 'refinance_risk',
        reason: 'A higher LTV can limit available replacement financing.',
      },
      {
        id: 'severity',
        reason: 'Less collateral value can worsen recoveries after default.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'LTV = loan balance ÷ property value',
      assumptions: 'Use the intended debt balance and valuation date.',
    },
    topic: 'debt_capacity',
    branch: 'credit',
  },
  {
    id: 'cap_rate',
    title: 'Capitalization rate',
    subtitle: 'Income in relation to property value',
    summary:
      'Direct capitalization relates a stabilized income measure to value using an assumed capitalization rate.',
    distinction:
      'A cap rate is not a mortgage coupon or a full forecast of investment return.',
    question: 'With unchanged NOI, what does a higher cap rate imply?',
    answer: 'A lower value in the simple direct-capitalization relationship.',
    sources: ['cre'],
    links: [
      {
        id: 'ltv',
        reason: 'A lower estimated value raises LTV if debt is unchanged.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'Property value ≈ annual stabilized NOI ÷ cap rate',
      assumptions:
        'A simplified direct-capitalization relationship. Use annual stabilized NOI and a positive annual cap rate as a decimal; this is not a full appraisal.',
    },
    topic: 'debt_capacity',
    branch: 'credit',
  },
  {
    id: 'debt_yield',
    title: 'Debt yield',
    subtitle: 'Property income relative to debt',
    summary:
      'Debt yield compares NOI with loan balance, without placing the interest rate in the denominator.',
    distinction: 'Debt yield and DSCR measure different relationships.',
    question:
      'Can changing a loan’s interest rate change DSCR but leave debt yield unchanged?',
    answer: 'Yes, when NOI and debt balance remain the same.',
    sources: ['cre'],
    links: [
      {
        id: 'dscr',
        reason: 'Debt yield complements coverage of contractual debt service.',
      },
      {
        id: 'refinance_risk',
        reason: 'Income relative to debt can constrain new loan sizing.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'Debt yield = annual NOI ÷ loan balance',
      assumptions:
        'Use annual NOI and the relevant outstanding or proposed balance. The ratio is a decimal; multiply by 100 to express a percentage.',
    },
    topic: 'debt_capacity',
    branch: 'credit',
  },
  {
    id: 'refinance_risk',
    title: 'Refinancing risk',
    subtitle: 'Finding financing at maturity',
    summary:
      'A borrower may need new financing to repay a balloon. Lower income, lower value or tighter lending terms can leave a funding gap.',
    distinction:
      'Making today’s payments does not guarantee a successful maturity refinance.',
    question: 'Why inspect value and income together?',
    answer:
      'Replacement debt can be constrained by both collateral leverage and cash-flow coverage.',
    sources: ['cre'],
    links: [
      {
        id: 'default',
        reason:
          'A maturity funding gap can lead to default without prior payment delinquency.',
      },
      {
        id: 'balloon',
        reason: 'The remaining maturity balance determines the financing need.',
      },
    ],
    aliases: [],
    topic: 'refinance_exit',
    branch: 'credit',
  },
  {
    id: 'cmbs',
    title: 'CMBS',
    subtitle: 'Commercial mortgages in securities',
    summary:
      'CMBS exposes investors to commercial mortgage cash flows through contractual payment and loss allocations. Property income and refinancing are central inputs.',
    distinction:
      'Commercial mortgage behavior differs from household refinancing in residential pools.',
    question: 'Why start with leases and property income?',
    answer:
      'They help explain the borrower’s ability to service and refinance the loan.',
    sources: ['cre', 'investor'],
    links: [
      {
        id: 'rent_roll',
        reason: 'Leases connect property operations to future income.',
      },
      {
        id: 'waterfall',
        reason:
          'The deal translates collateral performance into class cash flows.',
      },
    ],
    aliases: ['commercial mortgage-backed securities'],
    topic: 'refinance_exit',
    branch: 'credit',
  },
  {
    id: 'conduit_sasb',
    title: 'Conduit & SASB',
    subtitle: 'Diversification and concentration',
    summary:
      'Conduit transactions commonly combine loans from multiple borrowers. Single-asset/single-borrower transactions concentrate exposure in one asset or borrower relationship.',
    distinction:
      'Many properties under one borrower are not the same as many independent borrower exposures.',
    question: 'Why examine concentration alongside average metrics?',
    answer:
      'A single tenant, property or sponsor event can dominate a concentrated transaction.',
    sources: ['crefc_c', 'crefc_s'],
    links: [
      {
        id: 'cmbs',
        reason: 'Transaction design changes the mix of commercial collateral.',
      },
      {
        id: 'rent_roll',
        reason: 'Tenant concentration can matter beneath the loan structure.',
      },
    ],
    aliases: ['single asset single borrower', 'conduit'],
    topic: 'refinance_exit',
    branch: 'credit',
  },
];

const formula_additions: Record<
  string,
  NonNullable<MortgageConcept['formula']>
> = {
  amortization: {
    expression: 'Monthly payment = original balance × r(1+r)^N / ((1+r)^N − 1)',
    assumptions:
      'Level-payment, fully amortizing fixed-rate loan. r is the monthly decimal rate, N is months. At zero interest, payment is balance divided by months. Excludes taxes, insurance and fees.',
  },
  z_spread: {
    expression:
      'Dirty price equals the sum of fixed projected cash flows discounted on the zero curve plus a constant spread.',
    assumptions:
      'Illustrative continuous compounding. Use one stated cash-flow scenario and a consistent zero curve. The formula does not itself model prepayment options.',
  },
  oas: {
    expression:
      'Dirty price equals the model-expected value of path-dependent cash flows discounted with the option-adjusted spread.',
    assumptions:
      'Schematic pricing-model expectation, not a forecast. Rate dynamics, prepayment or exercise behavior and the curve must be specified consistently.',
  },
  g_spread: {
    expression:
      'G-spread = bond yield minus the stated government benchmark yield.',
    assumptions:
      'Use a named same-currency government reference and comparable conventions.',
  },
  i_spread: {
    expression:
      'General bond-market I-spread = bond yield minus an interpolated swap par rate.',
    assumptions:
      'This is the map’s general bond-market convention. State the swap family, currency and comparison tenor; other product/provider labels require their own definitions. It is not cash-flow-by-cash-flow zero-curve discounting.',
  },
  swap_spread: {
    expression:
      'Swap spread = swap fixed rate minus comparable government yield.',
    assumptions:
      'Same currency and comparable maturity and quotation conventions.',
  },
  quoted_margin: {
    expression: 'Coupon rate = reference rate plus contractual margin.',
    assumptions:
      'Simplified uncapped, unfloored coupon before day-count accrual. Observation and reset rules follow the contract.',
  },
  spread_duration: {
    expression:
      'Spread duration is approximately minus the proportional price change divided by the decimal spread change.',
    assumptions:
      'Local sensitivity with the benchmark curve fixed. State which cash-flow and option assumptions are held constant.',
  },
};
export const mortgage_concepts: MortgageConcept[] = [
  ...analytics_concepts,
  ...expansion_concepts,
  ...context_concepts,
  ...mechanism_concepts,
  ...spread_concepts,
  ...original_concepts.filter(
    (c) => !atlas_concepts.some((n) => n.id === c.id),
  ),
  ...atlas_concepts.map((c) => {
    const prior = original_concepts.find((n) => n.id === c.id);
    return {
      ...c,
      aliases: [...new Set([...(prior?.aliases ?? []), ...c.aliases])],
    };
  }),
].map((c) => ({
  ...c,
  ...(formula_additions[c.id] ? { formula: formula_additions[c.id] } : {}),
}));

export const mortgage_relationships: MortgageRelationship[] = [
  ...analytics_relationships,
  ...expansion_relationships,
  ...context_relationships,
  ...foundational_relationships,
  {
    id: 'spreads__nominal_spread',
    source: 'spreads',
    target: 'nominal_spread',
    label: 'compares two yields',
    reason:
      'A nominal spread subtracts a stated benchmark yield from the security yield under aligned conventions.',
    kind: 'definition',
  },
  {
    id: 'nominal_spread__i_spread',
    source: 'nominal_spread',
    target: 'i_spread',
    label: 'uses the stated swap convention',
    reason:
      'In the general bond-market convention used here, I-spread compares yield with an interpolated swap par rate. Check another product or provider’s definition before transferring this label.',
    kind: 'definition',
    sources: ['interpolated_swap_spread'],
  },
  {
    id: 'spreads__z_spread',
    source: 'spreads',
    target: 'z_spread',
    label: 'discounts a fixed payment path',
    reason:
      'Z-spread fits price with every projected cash flow under a stated scenario and zero curve.',
    kind: 'definition',
  },
  {
    id: 'spreads__oas',
    source: 'spreads',
    target: 'oas',
    label: 'models option-sensitive payments',
    reason:
      'OAS fits price while allowing modeled payment behavior to change across rate paths.',
    kind: 'definition',
  },
  {
    id: 'spreads__asset_swap',
    source: 'spreads',
    target: 'asset_swap',
    label: 'values a bond and swap package',
    reason:
      'Asset-swap spread depends on the package cash flows and upfront convention rather than simple yield subtraction.',
    kind: 'comparison',
  },
  {
    id: 'spreads__discount_margin',
    source: 'spreads',
    target: 'discount_margin',
    label: 'solves a floater margin',
    reason:
      'Discount margin matches a floater price under stated reference-rate and discounting assumptions.',
    kind: 'comparison',
  },
  {
    id: 'spreads__excess_spread',
    source: 'spreads',
    target: 'excess_spread',
    label: 'distinguishes deal income',
    reason:
      'Excess spread describes income after specified expenses and losses, not a valuation premium over a rate curve.',
    kind: 'comparison',
  },

  ...mechanism_relationships,
  ...spread_relationships,
  ...atlas_relationships,
  {
    id: 'prepayments__reinvestment',
    source: 'prepayments',
    target: 'reinvestment',
    label: 'returns cash to reinvest',
    reason:
      'Faster paydown returns principal sooner, potentially when replacement yields are lower.',
    kind: 'mechanism',
  },
  {
    id: 'non_agency__subordination',
    source: 'non_agency',
    target: 'subordination',
    label: 'relies on deal protection',
    reason:
      'Without an agency guarantee, a transaction may use junior loss absorption to protect senior claims.',
    kind: 'definition',
  },
  {
    id: 'sequential__wal',
    source: 'sequential',
    target: 'wal',
    label: 'redistributes principal timing',
    reason:
      'Changing principal priority changes the weighted timing of principal returned to individual classes.',
    kind: 'mechanism',
  },
  {
    id: 'wam__wal',
    source: 'wam',
    target: 'wal',
    label: 'separates schedule from expectation',
    reason:
      'WAM summarizes contractual loan maturities; WAL measures the projected timing of principal after amortization and prepayments.',
    kind: 'comparison',
  },
  {
    id: 'specified__model_risk',
    source: 'specified',
    target: 'model_risk',
    label: 'requires collateral assumptions',
    reason:
      'A specified pool’s value depends on how its known characteristics are translated into projected borrower behavior.',
    kind: 'mechanism',
  },
  {
    id: 'cmbs__noi',
    source: 'cmbs',
    target: 'noi',
    label: 'starts with property income',
    reason:
      'Commercial property income helps assess the borrower’s capacity to service debt.',
    kind: 'definition',
  },
  {
    id: 'principal_interest__amortization',
    source: 'principal_interest',
    target: 'amortization',
    label: 'splits the payment',
    reason:
      'A scheduled payment covers interest and repays principal under the loan contract.',
    kind: 'definition',
  },
  {
    id: 'amortization__cash_flows',
    source: 'amortization',
    target: 'cash_flows',
    label: 'returns scheduled principal',
    reason:
      'Scheduled amortization contributes principal independently of unscheduled payoffs.',
    kind: 'mechanism',
  },
  {
    id: 'wac__incentive',
    source: 'wac',
    target: 'incentive',
    label: 'sets the starting rate',
    reason:
      'Underlying note rates enter the comparison with currently available refinancing terms.',
    kind: 'mechanism',
  },
  {
    id: 'loan_balance__frictions',
    source: 'loan_balance',
    target: 'frictions',
    label: 'changes relative costs',
    reason:
      'Fixed refinancing costs can be larger relative to the savings on a smaller balance.',
    kind: 'mechanism',
  },
  {
    id: 'incentive__prepayments',
    source: 'incentive',
    target: 'prepayments',
    label: 'can encourage refinancing',
    reason:
      'Potential savings can increase payoffs when borrowers qualify and benefits exceed costs.',
    kind: 'mechanism',
  },
  {
    id: 'frictions__prepayments',
    source: 'frictions',
    target: 'prepayments',
    label: 'can slow refinancing',
    reason:
      'Costs and qualification constraints can prevent an attractive rate difference from becoming a payoff.',
    kind: 'mechanism',
  },
  {
    id: 'burnout__prepayments',
    source: 'burnout',
    target: 'prepayments',
    label: 'can dampen the response',
    reason:
      'After responsive borrowers leave, the remaining pool may refinance less for the same incentive.',
    kind: 'mechanism',
  },
  {
    id: 'lock_in__turnover',
    source: 'lock_in',
    target: 'turnover',
    label: 'can discourage a move',
    reason:
      'A borrower may avoid surrendering a low-rate mortgage when replacement financing costs more.',
    kind: 'mechanism',
    conditions:
      'Compare available and existing annual rates for the same borrower and financing context. A positive gap can discourage a move but does not prevent one.',
    sources: ['lockin', 'lockin_mobility'],
  },
  {
    id: 'turnover__prepayments',
    source: 'turnover',
    target: 'prepayments',
    label: 'can trigger a payoff',
    reason: 'A home sale commonly repays the existing mortgage.',
    kind: 'mechanism',
    conditions:
      'Most financed sales repay the old loan, but program rules and an eligible assumption can allow the debt to remain. Turnover also varies over time and across borrowers.',
    sources: ['basics', 'lockin_mobility'],
  },
  {
    id: 'seasonality__turnover',
    source: 'seasonality',
    target: 'turnover',
    label: 'shapes the calendar',
    reason:
      'Housing activity can vary seasonally; the pattern is not a fixed forecast.',
    kind: 'mechanism',
  },
  {
    id: 'buyouts__prepayments',
    source: 'buyouts',
    target: 'prepayments',
    label: 'returns principal',
    reason:
      'Applicable loan-removal rules can cause early principal return without a borrower refinance.',
    kind: 'mechanism',
  },
  {
    id: 'prepayments__cash_flows',
    source: 'prepayments',
    target: 'cash_flows',
    label: 'changes payment timing',
    reason:
      'Early principal return ends future interest on that balance and changes cash-flow dates.',
    kind: 'mechanism',
  },
  {
    id: 'prepayments__pool_factor',
    source: 'prepayments',
    target: 'pool_factor',
    label: 'reduces remaining face',
    reason:
      'Unscheduled principal repayment reduces the remaining balance alongside amortization.',
    kind: 'mechanism',
  },
  {
    id: 'smm__cpr',
    source: 'smm',
    target: 'cpr',
    label: 'annualizes survival',
    reason:
      'CPR = 1 − (1 − SMM)^12 assumes the same monthly speed for annualization.',
    kind: 'definition',
  },
  {
    id: 'wala__psa',
    source: 'wala',
    target: 'psa',
    label: 'summarizes seasoning',
    reason:
      'WALA summarizes a pool’s loan age, which helps interpret a PSA assumption. Individual loan ages locate loans on the standard CPR ramp.',
    kind: 'measurement',
    sources: ['formulas', 'guide'],
    conditions:
      'A weighted-average age can hide a mixed-age pool. Applying the nonlinear capped ramp to WALA need not reproduce loan-level aggregation.',
  },
  {
    id: 'cash_flows__wal',
    source: 'cash_flows',
    target: 'wal',
    label: 'determines average life',
    reason:
      'WAL weights the dates of projected principal repayments, excluding interest and discounting.',
    kind: 'measurement',
  },
  {
    id: 'wal__duration',
    source: 'wal',
    target: 'duration',
    label: 'answers a different timing question',
    reason:
      'WAL averages undiscounted principal-payment dates; effective duration estimates local price sensitivity after cash flows are reprojected under rate shocks.',
    kind: 'comparison',
    conditions:
      'Compare measures under a stated cash-flow and valuation model. A longer WAL does not mechanically imply an equal increase in effective duration.',
    sources: ['formulas', 'yield_duration_public'],
  },
  {
    id: 'cash_flows__pv',
    source: 'cash_flows',
    target: 'pv',
    label: 'supplies amounts and dates',
    reason:
      'Valuation discounts the chosen cash-flow amounts at their respective payment dates.',
    kind: 'measurement',
  },
  {
    id: 'payment_delay__pv',
    source: 'payment_delay',
    target: 'pv',
    label: 'shifts receipt dates',
    reason:
      'A longer delay reduces present value when positive discount rates and payment amounts are held fixed.',
    kind: 'mechanism',
  },
  {
    id: 'servicing__net_coupon',
    source: 'servicing',
    target: 'net_coupon',
    label: 'deducts applicable fees',
    reason:
      'Servicing and other applicable fees separate loan interest from investor interest.',
    kind: 'mechanism',
  },
  {
    id: 'net_coupon__cash_flows',
    source: 'net_coupon',
    target: 'cash_flows',
    label: 'sets investor interest',
    reason:
      'Interest is computed under the security coupon, balance and accrual conventions.',
    kind: 'mechanism',
  },
  {
    id: 'pool_factor__price',
    source: 'pool_factor',
    target: 'price',
    label: 'scales dollar value',
    reason:
      'Current face equals original face times the applicable factor; price per 100 then scales that balance.',
    kind: 'measurement',
  },
  {
    id: 'day_count__accrual',
    source: 'day_count',
    target: 'accrual',
    label: 'defines the time fraction',
    reason:
      'The applicable convention determines the interest fraction between the relevant dates.',
    kind: 'definition',
  },
  {
    id: 'accrual__price',
    source: 'accrual',
    target: 'price',
    label: 'completes the invoice',
    reason:
      'Applicable accrued interest is added to clean value to arrive at full settlement value.',
    kind: 'definition',
  },
  {
    id: 'specified__pay_up',
    source: 'specified',
    target: 'pay_up',
    label: 'prices known collateral',
    reason:
      'Specified collateral can command a premium over comparable generic TBA delivery.',
    kind: 'mechanism',
  },
  {
    id: 'cheapest_deliverable__pay_up',
    source: 'cheapest_deliverable',
    target: 'pay_up',
    label: 'makes selection valuable',
    reason:
      'The seller’s eligible-pool delivery choice helps explain why selected pools can trade at a premium.',
    kind: 'mechanism',
  },
  {
    id: 'tba__liquidity',
    source: 'tba',
    target: 'liquidity',
    label: 'supports standardization',
    reason:
      'Fungible delivery conventions can concentrate trading in a broader market.',
    kind: 'mechanism',
  },
  {
    id: 'loan_balance__specified',
    source: 'loan_balance',
    target: 'specified',
    label: 'distinguishes collateral',
    reason:
      'Loan balance is one disclosed characteristic investors can use when selecting a pool.',
    kind: 'comparison',
  },
  {
    id: 'pay_up__tba',
    source: 'pay_up',
    target: 'tba',
    label: 'uses a generic reference',
    reason:
      'A pay-up is measured against an appropriately comparable TBA execution.',
    kind: 'comparison',
  },
  {
    id: 'treasury__nominal_spread',
    source: 'treasury',
    target: 'nominal_spread',
    label: 'provides a reference',
    reason:
      'A Treasury yield may be the chosen reference for a nominal spread.',
    kind: 'definition',
  },
  {
    id: 'spot_curve__discount_factor',
    source: 'spot_curve',
    target: 'discount_factor',
    label: 'expresses dated value',
    reason:
      'Spot rates translate into discount factors using their timing and compounding convention.',
    kind: 'definition',
  },
  {
    id: 'discount_factor__pv',
    source: 'discount_factor',
    target: 'pv',
    label: 'discounts each payment',
    reason:
      'Each projected cash flow is multiplied by the factor for its payment date.',
    kind: 'measurement',
  },
  {
    id: 'spot_curve__z_spread',
    source: 'spot_curve',
    target: 'z_spread',
    label: 'provides the base curve',
    reason:
      'A Z-spread shifts the selected spot curve to fit price for fixed assumed cash flows.',
    kind: 'definition',
  },
  {
    id: 'z_spread__oas',
    source: 'z_spread',
    target: 'oas',
    label: 'changes option treatment',
    reason:
      'OAS uses option-sensitive cash flows across modeled rate scenarios rather than one fixed schedule.',
    kind: 'comparison',
  },
  {
    id: 'sofr__ois',
    source: 'sofr',
    target: 'ois',
    label: 'supplies the overnight index',
    reason:
      'A SOFR OIS exchanges fixed interest against contractual accrual linked to SOFR.',
    kind: 'definition',
  },
  {
    id: 'tenor__benchmark_matching',
    source: 'tenor',
    target: 'benchmark_matching',
    label: 'qualifies the comparison',
    reason:
      'Original tenor, actual remaining maturity and curve labels must not be silently treated as identical.',
    kind: 'comparison',
  },
  {
    id: 'prepayments__duration',
    source: 'prepayments',
    target: 'duration',
    label: 'changes rate exposure',
    reason:
      'Effective duration revalues cash flows after rate shocks, including the modeled prepayment response.',
    kind: 'mechanism',
  },
  {
    id: 'prepayments__contraction',
    source: 'prepayments',
    target: 'contraction',
    label: 'can shorten the investment',
    reason:
      'Faster-than-assumed principal return can shorten cash-flow timing and hurt a premium buyer.',
    kind: 'mechanism',
  },
  {
    id: 'incentive__convexity',
    source: 'incentive',
    target: 'convexity',
    label: 'creates rate-dependent exercise',
    reason:
      'Rate-sensitive refinancing can limit price gains as rates fall for ordinary pass-through MBS.',
    kind: 'mechanism',
  },
  {
    id: 'extension__duration',
    source: 'extension',
    target: 'duration',
    label: 'can lengthen exposure',
    reason:
      'Slower refinancing can leave principal outstanding longer when rates rise; magnitude depends on the instrument.',
    kind: 'mechanism',
  },
  {
    id: 'duration__dv01',
    source: 'duration',
    target: 'dv01',
    label: 'scales into dollar exposure',
    reason:
      'For a small parallel move, dollar sensitivity can be approximated from duration and market value.',
    kind: 'measurement',
  },
  {
    id: 'dv01__hedging',
    source: 'dv01',
    target: 'hedging',
    label: 'guides hedge size',
    reason:
      'Matching opposite dollar sensitivities offsets a chosen small rate move, not every risk.',
    kind: 'measurement',
  },
  {
    id: 'key_rate__treasury_hedge',
    source: 'key_rate',
    target: 'treasury_hedge',
    label: 'guides maturity selection',
    reason:
      'Localized sensitivities help choose hedge maturities rather than matching total duration alone.',
    kind: 'measurement',
  },
  {
    id: 'volatility__oas',
    source: 'volatility',
    target: 'oas',
    label: 'changes the option valuation',
    reason:
      'Changing assumed rate volatility can alter model value and the OAS fitted to a fixed price.',
    kind: 'mechanism',
  },
  {
    id: 'model_risk__oas',
    source: 'model_risk',
    target: 'oas',
    label: 'makes results conditional',
    reason:
      'Prepayment and rate-model assumptions can produce different fitted spreads for the same security.',
    kind: 'mechanism',
  },
  {
    id: 'treasury_hedge__basis_risk',
    source: 'treasury_hedge',
    target: 'basis_risk',
    label: 'leaves relative-price exposure',
    reason:
      'An MBS can cheapen relative to Treasuries even when an aggregate rate exposure is offset.',
    kind: 'mechanism',
  },
  {
    id: 'swap_hedge__basis_risk',
    source: 'swap_hedge',
    target: 'basis_risk',
    label: 'leaves mortgage exposure',
    reason:
      'A swap does not reproduce the mortgage’s collateral, liquidity and borrower option.',
    kind: 'mechanism',
  },
  {
    id: 'convexity__hedging',
    source: 'convexity',
    target: 'hedging',
    label: 'requires rebalancing',
    reason:
      'Changing rate sensitivity can require hedge adjustments after the market moves.',
    kind: 'mechanism',
  },
  {
    id: 'support__pac',
    source: 'support',
    target: 'pac',
    label: 'absorbs timing variation',
    reason:
      'Companion principal absorbs variability to help preserve the PAC schedule while support and effective protection remain.',
    kind: 'mechanism',
  },
  {
    id: 'pac__extension',
    source: 'pac',
    target: 'extension',
    label: 'has conditional protection',
    reason:
      'A PAC schedule is not guaranteed: depleted support or out-of-range paths can expose it to extension.',
    kind: 'comparison',
  },
  {
    id: 'waterfall__sequential',
    source: 'waterfall',
    target: 'sequential',
    label: 'orders principal',
    reason: 'The deal specifies which class receives principal first.',
    kind: 'definition',
  },
  {
    id: 'z_class__sequential',
    source: 'z_class',
    target: 'sequential',
    label: 'can redirect cash',
    reason:
      'During an accrual period, interest added to a Z-class balance can free cash for other principal-paying classes under the structure.',
    kind: 'mechanism',
  },
  {
    id: 'prepayments__io',
    source: 'prepayments',
    target: 'io',
    label: 'shrinks future interest',
    reason:
      'Faster paydown removes principal that would otherwise generate interest for the IO.',
    kind: 'mechanism',
  },
  {
    id: 'prepayments__po',
    source: 'prepayments',
    target: 'po',
    label: 'brings principal forward',
    reason:
      'Earlier repayment can improve the value of a discounted PO, holding other assumptions fixed.',
    kind: 'mechanism',
  },
  {
    id: 'rent_roll__occupancy',
    source: 'rent_roll',
    target: 'occupancy',
    label: 'reveals lease exposure',
    reason:
      'The rent roll records lease expirations and tenant exposure that help assess future occupancy.',
    kind: 'measurement',
  },
  {
    id: 'occupancy__noi',
    source: 'occupancy',
    target: 'noi',
    label: 'affects rental income',
    reason:
      'Lost rent can lower NOI when expenses do not fall enough to offset it.',
    kind: 'mechanism',
  },
  {
    id: 'noi__dscr',
    source: 'noi',
    target: 'dscr',
    label: 'sets income coverage',
    reason: 'With debt service fixed, lower NOI produces a lower DSCR.',
    kind: 'mechanism',
  },
  {
    id: 'noi__cap_rate',
    source: 'noi',
    target: 'cap_rate',
    label: 'enters capitalized value',
    reason: 'At a fixed cap rate, lower stabilized NOI implies a lower value.',
    kind: 'measurement',
  },
  {
    id: 'cap_rate__ltv',
    source: 'cap_rate',
    target: 'ltv',
    label: 'changes value beneath debt',
    reason:
      'A higher cap rate implies a lower value at fixed NOI, raising LTV if loan balance is unchanged.',
    kind: 'mechanism',
  },
  {
    id: 'dscr__refinance_risk',
    source: 'dscr',
    target: 'refinance_risk',
    label: 'constrains new debt',
    reason:
      'Weaker income coverage can limit the debt a replacement lender will advance.',
    kind: 'mechanism',
  },
  {
    id: 'ltv__refinance_risk',
    source: 'ltv',
    target: 'refinance_risk',
    label: 'constrains leverage',
    reason:
      'A lower property value can limit replacement financing against the same collateral.',
    kind: 'mechanism',
  },
  {
    id: 'refinance_risk__default',
    source: 'refinance_risk',
    target: 'default',
    label: 'can create a funding gap',
    reason:
      'A borrower unable to refinance or otherwise repay a balloon can default at maturity.',
    kind: 'mechanism',
  },
  {
    id: 'default__severity',
    source: 'default',
    target: 'severity',
    label: 'requires a recovery estimate',
    reason:
      'Defaulted exposure can lead to partial loss, depending on collateral proceeds, costs and other recoveries.',
    kind: 'measurement',
  },
  {
    id: 'severity__subordination',
    source: 'severity',
    target: 'subordination',
    label: 'consumes the loss cushion',
    reason:
      'Larger collateral losses can exhaust junior protection before reaching senior classes.',
    kind: 'mechanism',
  },
  {
    id: 'recovery_lag__pv',
    source: 'recovery_lag',
    target: 'pv',
    label: 'delays value recovery',
    reason:
      'The same recovery received later has a lower present value under positive discount rates.',
    kind: 'mechanism',
  },
  {
    id: 'oc__waterfall',
    source: 'oc',
    target: 'waterfall',
    label: 'can redirect cash',
    reason:
      'Where the deal uses an OC trigger, a breach can redirect cash under its stated rules.',
    kind: 'mechanism',
  },
  {
    id: 'ic__waterfall',
    source: 'ic',
    target: 'waterfall',
    label: 'can redirect cash',
    reason:
      'Where an IC trigger applies, insufficient defined interest coverage can change payment priorities.',
    kind: 'mechanism',
  },
  {
    id: 'pv__z_spread',
    source: 'pv',
    target: 'z_spread',
    label: 'fits the observed price',
    reason:
      'Z-spread solves a price match under a chosen curve and cash-flow schedule.',
    kind: 'measurement',
  },
];

export const mortgage_paths = [
  ...analytics_paths,
  ...expansion_paths,
  ...context_paths,
  ...mechanism_models,
  ...atlas_paths,
  {
    id: 'quote_to_model',
    title: 'From a yield quote to an option model',
    description:
      'Change the benchmark, then the calculation, and see why the numbers answer different questions.',
    steps: [
      'g_spread',
      'nominal_spread',
      'i_spread',
      'z_spread',
      'oas',
      'model_risk',
    ],
  },
  {
    id: 'borrower_to_hedge',
    title: 'From a borrower to a hedge',
    description:
      'Follow a refinancing decision into cash flows, risk and portfolio action.',
    steps: ['frictions', 'prepayments', 'duration', 'dv01', 'hedging'],
  },
  {
    id: 'collateral_to_price',
    title: 'Why one pool costs more',
    description: 'Connect the collateral you select with the price you pay.',
    steps: ['loan_balance', 'specified', 'pay_up', 'tba', 'liquidity'],
  },
  {
    id: 'pac_protection',
    title: 'Where PAC protection ends',
    description:
      'Follow the support mechanism, its limits and the resulting rate exposure.',
    steps: ['support', 'pac', 'extension', 'duration', 'dv01'],
  },
  {
    id: 'property_to_loss',
    title: 'From a tenant to a bond loss',
    description:
      'Trace weaker property income into refinancing and the loss waterfall.',
    steps: [
      'occupancy',
      'noi',
      'dscr',
      'refinance_risk',
      'default',
      'severity',
      'subordination',
    ],
  },
  {
    id: 'which_rate',
    title: 'Which rate are we comparing?',
    description:
      'Separate dated discounting, a fixed-path spread and option-adjusted value.',
    steps: [
      'spot_curve',
      'discount_factor',
      'pv',
      'z_spread',
      'oas',
      'model_risk',
    ],
  },
];

export const mortgage_path_models = [
  ...analytics_paths,
  ...expansion_paths,
  ...mechanism_models,
];

export const learning_path = mortgage_paths[0].steps.map((id) => ({ id }));
