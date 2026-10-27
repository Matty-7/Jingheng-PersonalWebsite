Warning: truncated output (original token count: 44440)
Total output lines: 4758

import {
  response_topics,
  response_sources,
  response_concepts,
  response_relationships,
  response_paths,
} from './mortgage_prepayment_response.ts';
import {
  foundation_topics,
  foundation_sources,
  foundation_concepts,
  foundation_relationships,
  foundation_paths,
} from './fixed_income_foundations.ts';
import {
  valuation_topics,
  valuation_sources,
  valuation_concepts,
  valuation_relationships,
  valuation_paths,
} from './mortgage_valuation.ts';
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
  contract_topics,
  contract_sources,
  contract_concepts,
  contract_relationships,
  contract_paths,
} from './mortgage_contracts.ts';
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
import {
  convention_topics,
  convention_sources,
  convention_concepts,
  convention_relationships,
  convention_paths,
} from './mortgage_conventions.ts';
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
    concepts: [
      'tba',
      'tba_analytics_mapping',
      'specified',
      'pay_up',
      'cheapest_deliverable',
    ],
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
    concepts: ['io_po', 'io', 'po', 'floater', 'inverse_floater'],
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
    concepts: ['rent_roll', 'data_center_cre', 'occupancy', 'noi'],
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
  ...response_topics,
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
  ...valuation_topics,
  ...foundation_topics,
  ...convention_topics,
  ...contract_topics,
];

export const mortgage_sources: Record<
  string,
  { publisher: string; title: string; url: string }
> = {
  ...response_sources,
  ...atlas_sources,
  ...mechanism_sources,
  ...spread_sources,
  ...context_sources,
  ...analytics_sources,
  ...expansion_sources,
  ...valuation_sources,
  ...foundation_sources,
  ...convention_sources,
  ...contract_sources,
  agency_remic_guarantee: {
    publisher: 'Fannie Mae',
    title:
      'Single-Family REMIC Prospectus · May 1, 2023 · guarantee, pp. 4 and 34; class definitions, Exhibit A',
    url: 'https://capitalmarkets.fanniemae.com/sites/capmrkt/files/syndicated/mbs/remicpros/FNM_REMIC_Base_20230501.pdf',
  },
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
  tba_analytics_public: {
    publisher: 'Federal Reserve Bank of New York',
    title:
      'Understanding Mortgage Spreads · Staff Report No. 674, revised June 2018 · sections 4.2–4.3',
    url: 'https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr674.pdf',
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
      'The initial cap limits the first adjustment, the subsequent cap limits each later adjustment and the lifetime cap limits the rate over the loan’s term; cap changes are measured in percentage points from the contract’s comparison rate. Floors and limits on downward adjustments also depend on the contract. The fully indexed rate is a calculation reference, not a promise that the note rate or payment moves there. For affordability, assess the highest payment permitted by the loan terms, not only the initial payment. A plan to refinance before the first reset does not remove this check: a replacement loan may not be available. A fixed note rate still does not freeze taxes or insurance.',
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
        id: 'factor_vintage',
        reason:
          'The applicable month and publication date identify the balance being reported.',
      },
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
        id: 'prepayment_aggregation',
        reason:
          'Combine subgroup principal payments rather than modeling only the average borrower.',
      },
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
      {
        id: 'tba_analytics_mapping',
        reason:
          'Generic analytics need an explicit collateral proxy before final pools are known.',
      },
    ],
    question: 'Is every mortgage deliverable?',
    answer:
      'No. Trade characteristics and eligibility rules constrain delivery.',
    sources: ['tba'],
    topic: 'pool_selection',
  },
  {
    id: 'tba_analytics_mapping',
    branch: 'trading',
    title: 'TBA analytics & collateral proxies',
    subtitle: 'From a generic contract to model inputs',
    aliases: ['TBA proxy', 'generic TBA analytics', 'TBA mapping', 'TBA OAD'],
    summary:
      'A TBA contract fixes standardized trade and delivery terms, but the actual delivered pools are identified later. Before allocation, an analytics system can map the contract to representative collateral assumptions, possibly a composite rather than one real pool. That proxy is an analytical input—not a delivery promise or evidence of the pools ultimately delivered.',
    distinction:
      'Keep three layers separate: contract terms, actual delivered collateral and the analytics proxy. Proxy WALA and weighted-average loan-balance measures describe the representative collateral; loan balance here is not the trade notional. OAS and option-adjusted duration are outputs derived from projected cash flows and the selected model. If only the proxy changes, displayed statistics and derived analytics can step to new values without loans aging overnight or the market price moving. The direction is not determined by WALA or loan balance alone.',
    question:
      'The TBA contract, price, dates and model settings are unchanged, but the representative collateral proxy changes. Must OAS and option-adjusted duration remain identical?',
    answer:
      'No. Different collateral assumptions can change projected cash flows and the resulting analytics. First reconcile the proxy mapping, as-of and settlement dates, then compare outputs under aligned curve, volatility, prepayment-model and valuation conventions.',
    links: [
      {
        id: 'tba',
        reason:
          'Defines the generic contract whose actual pools are allocated later.',
      },
      {
        id: 'pool_averages',
        reason:
          'WALA and weighted-average loan balance summarize the assumed collateral population.',
      },
      {
        id: 'oas',
        reason:
          'OAS is re-solved from price using the cash flows produced by the proxy and model.',
      },
      {
        id: 'duration',
        reason:
          'Option-adjusted duration depends on reprojected cash flows under a stated shock convention.',
      },
      {
        id: 'model_risk',
        reason:
          'A precise output remains conditional on collateral selection and model assumptions.',
      },
    ],
    sources: ['tba', 'tba_analytics_public', 'fannie_mbs_basics'],
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
      'No. A base case is one selected set of assumptions. A probability-weighted expectation requires an explicit treatment of possible outcomes and their probabilities.',
    sources: ['freddie_factor', 'embedded_options'],
    topic: 'payment_timing',
  },
  {
    id: 'wal',
    branch: 'valuation',
    title: 'WAL',
    subtitle: 'Weighted-average life',
    aliases: ['average life', 'principal timing'],
    summary:
      'WAL summarizes when principal is received under a specified payment path. It weights each principal payment by its time of receipt.',
    formula: {
      expression: 'WAL = Σ(t × principalₜ) ÷ Σ(principalₜ)',
      assumptions:
        't is years from measurement. Full recovery and no capitalized interest are assumed; accrual classes need specific conventions.',
      example:
        '$40 after one year and $60 after three years: (1 × 40 + 3 × 60) ÷ 100 = 2.2 years.',
    },
    distinction:
      'WAL is not duration or a promised maturity. It excludes interest weighting and can change with prepayments.',
    links: [
      {
        id: 'cash_flows',
        reason: 'Provides the projected principal schedule.',
      },
      {
        id: 'duration',
        reason: 'Measures rate sensitivity rather than principal timing.',
      },
      {
        id: 'z_class',
        reason: 'Accreted principal needs special average-life treatment.',
      },
    ],
    question: 'Can a security have different WALs?',
    answer: 'Yes. Different principal paths produce different average lives.',
    sources: ['formulas'],
    topic: 'payment_timing',
  },
  {
    id: 'price',
    branch: 'valuation',
    title: 'Clean & full price',
    subtitle: 'Quotation versus settlement value',
    aliases: ['clean price', 'dirty price', 'full price', 'settlement amount'],
    summary:
      'Multiply current face by price per 100 to obtain principal value. Accrued interest affects the settlement invoice.',
    formula: {
      expression: 'Quoted principal value = current face × price ÷ 100',
      assumptions:
        'Price is points per 100 of current face. Excludes accrued interest and settlement adjustments.',
      example:
        '$72,000 current face at 101.5 gives $73,080 before accrued interest.',
    },
    distinction: '101.5 is a price quote, not a yield.',
    links: [
      {
        id: 'pool_factor',
        reason: 'Converts original face into the current principal amount.',
      },
      {
        id: 'pv',
        reason: 'Connects price with a cash-flow and discount-rate convention.',
      },
    ],
    question: 'Can identical prices produce different invoices?',
    answer:
      'Yes: face amount, accrued interest or settlement terms may differ.',
    sources: ['cfa_valuation', 'formulas'],
    topic: 'quotation',
  },
  {
    id: 'pv',
    branch: 'valuation',
    title: 'Present value',
    subtitle: 'Future cash in today’s terms',
    aliases: ['PV', 'discount rate', 'yield to maturity', 'compounding'],
    summary:
      'Present value discounts specified cash flows. Yield reconciles that payment path with price using stated timing and compounding.',
    formula: {
      expression: 'P = Σ CFₜ ÷ (1 + i)ᵗ',
      assumptions:
        'CFₜ is a payment at period t; i is the decimal yield per matching period. Settlement adjustments are omitted.',
      example:
        '$105 paid in one year discounted at 5% has a present value of $100.',
    },
    distinction:
      'Yield from assumed cash flows is not a guaranteed realized return.',
    links: [
      {
        id: 'cash_flows',
        reason: 'Supplies the payment path being discounted.',
      },
      {
        id: 'spreads',
        reason:
          'Adds a benchmark curve and model convention to the comparison.',
      },
      {
        id: 'z_spread',
        reason:
          'Z-spread solves a price match under a chosen curve and cash-flow schedule.',
      },
    ],
    question: 'Why match the rate and payment periods?',
    answer:
      'An annual rate applied to monthly periods without conversion discounts incorrectly.',
    sources: ['cfa_valuation'],
    topic: 'discounting',
  },
  {
    id: 'spreads',
    branch: 'curves',
    title: 'Choosing a spread',
    subtitle: 'Different comparisons answer different questions',
    aliases: [
      'option adjusted spread',
      'zero volatility spread',
      'I-spread',
      'benchmark curve',
    ],
    summary:
      'A yield spread compares yields. Z-spread adds one constant spread to a reference zero-coupon curve to fit a specified payment path to price. OAS fits price using rate paths and option-sensitive cash flows.',
    distinction:
      'OAS depends on rate, volatility and prepayment assumptions; different models can disagree.',
    links: [
      {
        id: 'pv',
        reason: 'Defines discounting.',
      },
      {
        id: 'incentive',
        reason: 'Changes modeled payments.',
      },
      {
        id: 'convexity',
        reason: 'Shows rate-dependent payment behavior.',
      },
    ],
    question: 'Is OAS observed independently of a model?',
    answer: 'No. A model infers it from price.',
    sources: ['fed_spreads', 'cohort'],
    topic: 'spread_measures',
  },
  {
    id: 'duration',
    branch: 'risk',
    title: 'Effective duration',
    subtitle: 'Sensitivity after cash flows respond',
    aliases: ['rate sensitivity', 'option adjusted duration'],
    summary:
      'Effective duration estimates local price sensitivity to a defined rate shock, allowing option-sensitive payments to change in the repricing.',
    formula: {
      expression: 'Dₑff ≈ (P₋ − P₊) ÷ (2P₀Δy)',
      assumptions:
        'P₋ and P₊ are modeled prices after equal down/up rate shocks. P₀ is the base price; Δy is a positive decimal rate shift. Re-estimate cash flows consistently.',
      example:
        'P₀ = 100, P₋ = 100.4, P₊ = 99.6 and Δy = 0.001 imply duration ≈ 4.',
    },
    distinction:
      'Holding cash flows fixed measures a different sensitivity. For a constant-OAS curve shock, hold OAS fixed and reprice option-sensitive payments consistently. WAL does not substitute for duration.',
    links: [
      {
        id: 'dv01',
        reason: 'Converts percentage sensitivity into dollars per basis point.',
      },
      {
        id: 'convexity',
        reason: 'Explains why duration itself changes as rates move.',
      },
    ],
    question: 'Why re-estimate mortgage payments after a rate shock?',
    answer:
      'The shock can change borrower exercise and therefore the timing of the cash flows being valued.',
    sources: ['cfa_risk'],
    topic: 'sensitivities',
  },
  {
    id: 'dv01',
    branch: 'risk',
    title: 'DV01',
    subtitle: 'Dollars per one-basis-point move',
    aliases: ['dollar duration', 'basis point', 'BPV', 'PV01'],
    summary:
      'DV01 expresses local rate exposure in dollars per basis point. For a positive-duration position, a small upward rate move generally reduces price.',
    formula: {
      expression: 'DV01 ≈ market value × duration × 0.0001',
      assumptions:
        'A first-order magnitude for the same rate-shock convention used in duration. Market value is dollars; one basis point = 0.0001 in decimal rate.',
      example: '$100,000 × 4 × 0.0001 = about $40 per basis point.',
    },
    distinction:
      'With a positive loss-per-bp convention, dollar P&L ≈ −DV01 × yield change in bp. Use the position’s dollar market value, not a price quoted per 100. Matching DV01 does not neutralize convexity, spread or curve-shape changes.',
    links: [
      {
        id: 'duration',
        reason: 'Provides the underlying rate sensitivity.',
      },
      {
        id: 'hedging',
        reason: 'Scales the local interest-rate exposure of a hedge.',
      },
    ],
    question: 'Does $40 DV01 predict exactly a $4,000 loss for a 100 bp rise?',
    answer:
      'No. That extrapolates a local approximation across a large move; duration and cash flows can change.',
    sources: ['dv01'],
    topic: 'sensitivities',
  },
  {
    id: 'convexity',
    branch: 'risk',
    title: 'Negative convexity',
    subtitle: 'When rate sensitivity bends',
    aliases: ['prepayment option', 'convexity risk'],
    summary:
      'In relevant rate ranges, refinancing can shorten MBS cash flows as rates fall and limit price gains. As rates rise, slower prepayments can lengthen exposure. Duration then changes with the rate level.',
    distinction:
      'Not every MBS or structured class has negative convexity in every market state.',
    links: [
      {
        id: 'incentive',
        reason: 'Rate changes affect the borrower’s incentive to exercise.',
      },
      {
        id: 'extension',
        reason: 'Shows the timing consequences on either side of a rate move.',
      },
      {
        id: 'hedging',
        reason: 'A changing duration can require a hedge adjustment.',
      },
    ],
    question: 'Why might a hedge that matched yesterday be too small today?',
    answer:
      'A rate increase can extend MBS duration, raising its rate exposure relative to the old hedge.',
    sources: ['convexity'],
    topic: 'embedded_option',
  },
  {
    id: 'extension',
    branch: 'risk',
    title: 'Extension risk',
    subtitle: 'Principal stays outstanding longer',
    aliases: ['contraction risk', 'extension risk', 'reinvestment risk'],
    summary:
      'Slower-than-expected principal return lengthens the investment’s cash-flow horizon. When rates rise, reduced refinancing can extend exposure just as discount rates are higher.',
    distinction:
      'Extension concerns slower principal return. Contraction concerns faster return; the two affect securities differently.',
    links: [
      {
        id: 'prepayments',
        reason: 'Changes the speed of principal return.',
      },
      {
        id: 'wal',
        reason: 'Summarizes the resulting principal timing.',
      },
      {
        id: 'pac',
        reason: 'Redistributes some timing variability across classes.',
      },
      {
        id: 'duration',
        reason:
          'Slower refinancing can leave principal outstanding longer when rates rise; magnitude depends on the instrument.',
      },
    ],
    question: 'Why can early repayment be unwelcome when rates fall?',
    answer:
      'Principal comes back when replacement investments may offer lower yields.',
    sources: ['investor'],
    topic: 'embedded_option',
  },
  {
    id: 'hedging',
    branch: 'risk',
    title: 'Rebalancing a hedge',
    subtitle: 'The exposure changes with the asset',
    aliases: ['hedge ratio', 'Treasury futures', 'curve risk', 'spread risk'],
    summary:
      'A rate hedge offsets a chosen measure of interest-rate exposure. The mortgage position and hedge can still respond differently to spreads, curve shape, volatility and borrower behavior.',
    formula: {
      expression: 'Hedge units ≈ exposure DV01 ÷ hedge-unit DV01',
      assumptions:
        'Use consistent dollars-per-basis-point measures and the opposite exposure direction. This is a local sizing relationship, not a trade recommendation.',
    },
    distinction: 'A zero net DV01 is not a risk-free portfolio.',
    links: [
      {
        id: 'dv01',
        reason: 'Provides a comparable local exposure unit.',
      },
      {
        id: 'convexity',
        reason: 'Changes exposure after the hedge is put on.',
      },
      {
        id: 'spreads',
        reason: 'Mortgage and benchmark prices need not move together.',
      },
    ],
    question:
      'Can a rate-hedged MBS lose value when Treasury yields do not move?',
    answer:
      'Yes. Mortgage spreads, liquidity or modeled borrower behavior can change independently.',
    sources: ['hedge'],
    topic: 'hedge_choices',
  },
  {
    id: 'cmo',
    branch: 'structure',
    title: 'CMO',
    subtitle: 'Separate collateral, guarantee and payment rules',
    aliases: [
      'collateralized mortgage obligation',
      'Agency CMO',
      'real estate mortgage investment conduit',
      'tranche',
    ],
    summary:
      'A CMO divides mortgage cash flows into classes with different payment rules. In a guaranteed Agency CMO class, the guarantor supports payments defined by the deal documents. That does not fix the class’s market value or modeled repayment path. REMIC describes a tax framework, not a principal-allocation rule.',
    distinction:
      'Fannie Mae’s single-family REMIC guarantee covers required distributions and remaining principal by the class’s final distribution date, subject to the prospectus supplement. A projected five-year WAL is not that final date. The guarantee is Fannie Mae’s, not a U.S. government guarantee. Corporate CLOs instead hold business loans and use subordination and coverage tests to allocate credit exposure. Compare collateral, class-specific guarantee and waterfall separately; CMO alone does not mean Agency-guaranteed.',
    links: [
      {
        id: 'sequential',
        reason: 'Uses one possible principal-allocation rule.',
      },
      {
        id: 'pass_through',
        reason: 'Can supply the underlying mortgage cash flows.',
      },
      {
        id: 'clo',
        reason:
          'Contrasts mortgage payment timing with corporate loan credit allocation.',
      },
      {
        id: 'agency',
        reason: 'Distinguishes the guarantor and the scope of its promise.',
      },
    ],
    question: 'Does an Agency guarantee lock in a projected five-year WAL?',
    answer:
      'No. The guarantee supports contractual payments, not a modeled WAL. Borrower prepayments and class allocation rules can change the repayment path even when every guaranteed payment is made.',
    sources: ['agency_remic_guarantee', 'remic', 'irs', 'clo'],
    topic: 'deal_rules',
  },
  {
    id: 'sequential',
    branch: 'structure',
    title: 'Sequential pay',
    subtitle: 'Principal in a specified order',
    aliases: ['waterfall', 'payment priority'],
    summary:
      'In a simple sequential structure, available principal first retires class A, then class B. Ordinary interest-paying classes can receive interest while waiting for principal. Faster collateral paydowns bring the queue forward; slower paydowns keep later classes outstanding longer.',
    distinction:
      'Payment order changes timing; it does not automatically establish credit subordination.',
    formula: {
      expression: 'Q_A = min(Q, B_A); Q_B = min(B_B, max(0, Q − Q_A))',
      assumptions:
        'One distribution date, two principal-bearing classes and nonnegative beginning balances. Q is principal available to this group, with 0 ≤ Q ≤ B_A + B_B. All amounts use the same currency. No other classes, reserves, losses, accretion or allocation caps. Interest is allocated separately.',
      example:
        'Illustrative amounts in $ millions: A begins at 30, B at 70, and available principal is 40. A receives 30 and B receives 10; closing balances are 0 and 60. If only 20 arrives instead, A receives 20 an…14440 tokens truncated…sury hedge leaves mortgage spread and prepayment differences.',
    question: 'Is equal face amount a reliable hedge ratio?',
    answer:
      'No. Compare sensitivity, including the futures contract’s own exposure.',
    sources: ['hedge', 'dv01'],
    links: [
      {
        id: 'dv01',
        reason: 'Dollar sensitivity is a starting point for hedge sizing.',
      },
      {
        id: 'basis_risk',
        reason: 'MBS and Treasury prices do not have to move together.',
      },
    ],
    aliases: [],
    topic: 'hedge_choices',
    branch: 'risk',
  },
  {
    id: 'swap_hedge',
    title: 'Swap hedge',
    subtitle: 'Exchanging interest-rate exposure',
    summary:
      'An interest-rate swap can add or reduce fixed-rate exposure. A payer-fixed position commonly offsets some positive duration.',
    distinction:
      'The appropriate direction and size depend on the portfolio and contract.',
    question: 'Does matching swap DV01 eliminate all MBS risk?',
    answer:
      'No. The mortgage’s spread, option and changing principal profile remain.',
    sources: ['arrc', 'cfa_risk'],
    links: [
      {
        id: 'ois',
        reason: 'The swap’s index and curve define its rate exposure.',
      },
      {
        id: 'hedging',
        reason: 'Hedge exposures need updating as the mortgage changes.',
      },
      {
        id: 'basis_risk',
        reason:
          'A swap does not reproduce the mortgage’s collateral, liquidity and borrower option.',
      },
    ],
    aliases: [],
    topic: 'hedge_choices',
    branch: 'risk',
  },
  {
    id: 'basis_risk',
    title: 'Basis risk',
    subtitle: 'The asset and hedge diverge',
    summary:
      'A hedge can offset one driver while the asset and hedge move differently because of spreads, liquidity, collateral or other exposures.',
    distinction:
      'Zero net DV01 does not mean zero total risk: the hedge offsets only the specified local rate exposure, not spread exposure.',
    question:
      'Does higher spread volatility alone prove that a DV01-neutral MBS position lost money?',
    answer:
      'No. The realized spread move, residual exposure and other P&L components determine the outcome; volatility is not the same as widening.',
    sources: ['convexity', 'hedge'],
    links: [
      {
        id: 'liquidity',
        reason: 'Liquidity differences can change relative pricing.',
      },
      {
        id: 'oas',
        reason: 'Spread changes can matter even after rate exposure is hedged.',
      },
    ],
    aliases: [],
    topic: 'hedge_choices',
    branch: 'risk',
  },
  {
    id: 'model_risk',
    title: 'Model risk',
    subtitle: 'A result is conditional on assumptions',
    summary:
      'Prepayment, interest-rate and credit assumptions influence projected cash flows and model-based risk measures.',
    distinction:
      'A precise numerical output is not proof of a precise forecast.',
    question: 'How should two model outputs be compared?',
    answer:
      'First compare assumptions and definitions, then inspect sensitivity to plausible alternatives.',
    sources: ['cfa_risk', 'fed_spreads'],
    links: [
      {
        id: 'prepayment_model_stability',
        reason:
          'Test whether a borrower-response relationship survives a new period and population.',
      },
      {
        id: 'oas',
        reason: 'The fitted spread inherits the model’s assumptions.',
      },
      {
        id: 'duration',
        reason: 'Scenario-based sensitivity depends on reprojected cash flows.',
      },
    ],
    aliases: [],
    topic: 'hedge_choices',
    branch: 'risk',
  },
  {
    id: 'remic',
    title: 'REMIC',
    subtitle: 'A tax structure for mortgage assets',
    summary:
      'A REMIC is a tax election and legal framework for qualifying mortgage investment conduits, subject to specific requirements.',
    distinction:
      'CMO describes a structured security arrangement; REMIC describes a tax framework.',
    question: 'Are CMO and REMIC interchangeable definitions?',
    answer:
      'No. They frequently appear together but refer to different aspects of a transaction.',
    sources: ['irs', 'remic'],
    links: [
      {
        id: 'cmo',
        reason: 'A CMO can be issued using a REMIC structure.',
      },
    ],
    aliases: ['real estate mortgage investment conduit'],
    topic: 'deal_rules',
    branch: 'structure',
  },
  {
    id: 'waterfall',
    title: 'Waterfall',
    subtitle: 'The order in which cash is used',
    summary:
      'A waterfall specifies how available cash is allocated among fees, interest, principal and classes, including any applicable triggers.',
    distinction:
      'A rule for distributing cash does not create additional collateral cash flow.',
    question: 'Why can identical collateral support different class risks?',
    answer:
      'Payment priorities can send the same cash to different classes at different times.',
    sources: ['structure', 'guide'],
    links: [
      {
        id: 'sequential',
        reason: 'Sequential priority is one way to direct principal.',
      },
      {
        id: 'seniority',
        reason:
          'Credit structures can prioritize classes in payments and losses.',
      },
    ],
    aliases: [],
    topic: 'deal_rules',
    branch: 'structure',
  },
  {
    id: 'seniority',
    title: 'Payment & loss priority',
    subtitle: 'First in line is a contractual rule',
    summary:
      'Classes can have different priorities for receiving cash and absorbing losses. Their rights come from the transaction documents.',
    distinction:
      'Early principal priority is not automatically the same as credit seniority.',
    question:
      'Must the first principal-paying class be the only protected class?',
    answer:
      'No. Principal timing and loss allocation are distinct design choices.',
    sources: ['guide', 'investor'],
    links: [
      {
        id: 'subordination',
        reason: 'Junior loss absorption can protect senior claims.',
      },
      {
        id: 'sequential',
        reason: 'Principal timing can be ordered separately.',
      },
    ],
    aliases: [],
    topic: 'deal_rules',
    branch: 'structure',
  },
  {
    id: 'io',
    title: 'Interest-only class',
    subtitle: 'Exposure to interest that remains',
    summary:
      'An IO receives designated interest cash flows. Faster principal paydown can remove the balance that generates those payments.',
    distinction:
      'An IO’s response to rates can differ from an ordinary principal-and-interest bond.',
    question: 'Why can lower rates hurt an IO?',
    answer:
      'Refinancing can destroy future interest faster than discounting helps it.',
    sources: ['smbs'],
    links: [
      {
        id: 'prepayments',
        reason:
          'Faster paydown reduces the base that generates future interest.',
      },
      {
        id: 'convexity',
        reason: 'Optionality can produce unusual price sensitivity.',
      },
    ],
    aliases: ['interest only'],
    topic: 'cashflow_slices',
    branch: 'structure',
  },
  {
    id: 'po',
    title: 'Principal-only class',
    subtitle: 'Exposure to principal timing',
    summary:
      'A PO receives designated principal payments. For a discounted PO, earlier principal receipt can improve value, all else equal.',
    distinction:
      'An IO and a PO do not share the same response to faster prepayments.',
    question: 'Why can an early payoff help a PO?',
    answer: 'It brings forward principal bought at a discount.',
    sources: ['smbs'],
    links: [
      {
        id: 'wal',
        reason: 'Principal timing is central to a PO’s valuation.',
      },
      {
        id: 'pv',
        reason: 'Earlier receipt changes present value.',
      },
    ],
    aliases: ['principal only'],
    topic: 'cashflow_slices',
    branch: 'structure',
  },
  {
    id: 'floater',
    title: 'Floating-rate class',
    subtitle: 'A coupon linked to an index',
    summary:
      'A floater’s coupon resets using an index and contractual terms. Caps, floors and principal timing still affect its value.',
    distinction:
      'A resetting coupon does not eliminate spread, cap or prepayment exposure.',
    question: 'Can a floater retain risk after its coupon resets?',
    answer:
      'Yes. Its spread, contractual limits and principal schedule can still change in value.',
    sources: ['structure'],
    links: [
      {
        id: 'sofr',
        reason: 'A floating coupon can reference an overnight-rate framework.',
      },
      {
        id: 'basis_risk',
        reason:
          'The coupon index may not track every relevant funding or valuation rate.',
      },
    ],
    aliases: [],
    topic: 'cashflow_slices',
    branch: 'structure',
  },
  {
    id: 'inverse_floater',
    title: 'Inverse floater',
    subtitle: 'The residual side of a paired coupon split',
    aliases: [
      'inverse floating-rate class',
      'inverse floating rate class',
      'floater inverse pair',
    ],
    summary:
      'A floater coupon rises with its reference index while a paired inverse-floater coupon falls. In a simplified two-class split, the parent coupon budget is allocated across both balances: concentrating the floater’s index exposure into a smaller inverse balance magnifies the inverse coupon slope without creating additional collateral interest.',
    distinction:
      'Coupon leverage is not principal leverage or a guaranteed multiple of total return. The identity conserves stated-period coupon interest, not market value, yield, duration or realized return. Caps and floors make the allocation piecewise; clamping one leg independently can violate the parent interest budget. Actual class formulas, applicable balances or notionals, index observation, reset lag, day count, fees, shortfalls and principal rules come from the transaction documents. Prepayments can shrink future coupon capacity, and the short-rate index need not track mortgage rates or borrower incentives.',
    formula: {
      expression:
        'B_F c_F(L) + B_I c_I(L) = B_P c_P; M = B_F ÷ B_I; c_I(L) = [B_P c_P − B_F(L + s)] ÷ B_I = K − ML',
      assumptions:
        'One accrual period with B_P = B_F + B_I. B_P, B_F and B_I are current parent, floater and inverse balances or applicable notionals in the same currency. c_P, c_F, c_I, L, s and K are annual decimal rates; M is dimensionless. Period interest is B × c × α using the same stated accrual fraction α. The parent is fixed-coupon and its interest is split only between these two classes, with no fees, shortfalls, other interest classes or differing accrual conventions. The linear form applies only where no cap or floor binds; use the deal’s piecewise rules otherwise.',
      example:
        'Hypothetical annualized amounts: a $100m parent paying 5.00% is split into an $80m floater at L + 0.50% and a $20m inverse. Then M = 4 and K = 23.00%. At L = 4.00%, the floater pays 4.50% × $80m = $3.60m and the inverse pays 7.00% × $20m = $1.40m, totaling the parent’s $5.00m. At L = 6.00%, the unconstrained inverse coupon is −1.00%. Flooring only that coupon at zero while leaving the floater at 6.50% would produce $5.20m, which exceeds the budget. In this simplified pair, a 6.25% floater cap when the inverse reaches zero restores $5.00m. This illustrates allocation, not a market quote, pricing result or forecast.',
    },
    question:
      'Why can a 20% inverse class have a 4× index multiplier when paired with an 80% floater class?',
    answer:
      'The floater’s index exposure on 80 of balance is concentrated into 20 of inverse balance, so 80 ÷ 20 = 4. No additional collateral interest is created, and the multiplier does not promise four times the principal exposure or total return.',
    sources: ['structure'],
    links: [
      {
        id: 'floater',
        reason: 'Supplies the complementary rising-index coupon leg.',
      },
      {
        id: 'caps_floors',
        reason: 'Binding limits make the paired coupon allocation piecewise.',
      },
      {
        id: 'sofr',
        reason:
          'Can identify the reference-rate family without specifying the full reset convention.',
      },
      {
        id: 'prepayments',
        reason: 'Balance runoff can reduce future coupon-generating capacity.',
      },
      {
        id: 'basis_risk',
        reason:
          'The short-rate index can diverge from mortgage rates and borrower behavior.',
      },
      {
        id: 'cmo',
        reason:
          'Places the paired interest allocation inside a multiclass mortgage structure.',
      },
      {
        id: 'cash_flows',
        reason:
          'Shows that the pair reallocates the parent interest budget rather than creating collateral cash flow.',
      },
      {
        id: 'duration',
        reason:
          'Separates the coupon/index multiplier from model-dependent price duration.',
      },
    ],
    topic: 'cashflow_slices',
    branch: 'structure',
  },
  {
    id: 'subordination',
    title: 'Subordination',
    subtitle: 'A dated, class-specific loss cushion',
    summary:
      'A senior-subordinate structure allocates specified losses to junior classes before a named protected class, under its governing rules. Quote support with its reporting date, protected class, junior balances included in the numerator and current balance used in the denominator; subordination is only one possible form of credit enhancement.',
    distinction:
      'The percentage is a snapshot, not a permanent shield. Start with a hypothetical two-class structure of $94 million senior plus $6 million junior. Path A has no loss and pays $10 million of principal entirely to senior, ending at $84 million senior plus $6 million junior: about 6.67% support on $90 million and a $6 million cushion. Path B first allocates a $4 million realized loss to junior and pays $6 million of principal to senior, ending at $88 million senior plus $2 million junior: about 2.22% support on the same $90 million total and only a $2 million cushion. These paths are explicit toy assumptions, not universal RMBS or CRT rules. Principal allocation, write-downs, write-ups, definitions and triggers come from the transaction documents.',
    formula: {
      expression: 'Supportₜ = Jₜ ÷ (Pₜ + Jₜ)',
      assumptions:
        'A two-class snapshot only. Jₜ includes the current junior balances that the stated transaction definition places below the named protected class; Pₜ is that protected class’s current balance. Both are measured on one reporting date in the same currency. Real deals may use a different denominator or include additional classes, enhancement, write-down, write-up and payment rules.',
      example:
        'Path A: $6m ÷ ($84m + $6m) = 6.67%. Path B: $2m ÷ ($88m + $2m) = 2.22%. The ending total is $90m in both paths, but the realized loss consumed $4m of Path B’s junior protection.',
    },
    question:
      'Do the two paths have the same credit support because both end with $90 million of total class balance?',
    answer:
      'No. Path A retains $6 million of junior protection and 6.67% support, while Path B retains $2 million and about 2.22% after the junior write-down. Equal ending totals do not erase the principal-and-loss path. Neither percentage establishes a breakeven CDR: a first-dollar principal-loss threshold also requires a horizon, default path, severity, recovery lag, prepayments and the applicable waterfall. It is not a price, yield, IRR breakeven or forecast.',
    sources: [
      'guide',
      'investor',
      'stacr_structure',
      'stacr_deleveraging',
      'stacr_loss_allocation',
      'cas_performance_tests',
    ],
    links: [
      {
        id: 'severity',
        reason: 'Larger collateral losses can consume enhancement.',
      },
      {
        id: 'waterfall',
        reason: 'Contractual rules determine loss and payment allocation.',
      },
      {
        id: 'recovery_lag',
        reason:
          'A conditional loss threshold depends on when recoveries become available.',
      },
    ],
    aliases: [],
    topic: 'loss_protection',
    branch: 'structure',
  },
  {
    id: 'oc',
    title: 'Overcollateralization',
    subtitle: 'Assets supporting fewer liabilities',
    summary:
      'Overcollateralization compares supporting collateral with the debt it protects. Certain structured deals test an adjusted collateral amount against a specified liability group.',
    distinction:
      'An OC trigger and its haircut rules are deal-specific, not universal MBS conventions.',
    question: 'Does an OC test use unadjusted collateral in every deal?',
    answer:
      'No. Defaults and other contract-defined adjustments may reduce the numerator.',
    sources: ['clo'],
    links: [
      {
        id: 'subordination',
        reason: 'Excess asset coverage can contribute to credit protection.',
      },
      {
        id: 'waterfall',
        reason:
          'A failed coverage test can redirect cash when documents require it.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'OC ratio = adjusted collateral ÷ covered debt',
      assumptions:
        'Illustrative coverage-test form. Definitions of collateral, covered classes and haircuts are transaction-specific.',
    },
    topic: 'loss_protection',
    branch: 'structure',
  },
  {
    id: 'ic',
    title: 'Interest coverage',
    subtitle: 'Cash available for required interest',
    summary:
      'An interest-coverage test compares defined interest collections with required interest payments for the covered classes.',
    distinction:
      'Interest coverage concerns current servicing capacity; OC concerns asset coverage.',
    question: 'Can one coverage test pass while another fails?',
    answer: 'Yes. Income and collateral-value measures need not move together.',
    sources: ['clo'],
    links: [
      {
        id: 'oc',
        reason:
          'Income coverage and asset coverage measure different protection.',
      },
      {
        id: 'waterfall',
        reason:
          'A breach may divert cash away from junior claims under the deal rules.',
      },
    ],
    aliases: [],
    formula: {
      expression: 'IC ratio = available interest ÷ covered interest due',
      assumptions:
        'Illustrative test form for structures that use IC triggers; deal definitions govern.',
    },
    topic: 'loss_protection',
    branch: 'structure',
  },
  {
    id: 'delinquency',
    title: 'Delinquency',
    subtitle: 'A scheduled payment is late',
    summary:
      'Delinquency records missed or late contractual payments, often grouped by days past due.',
    distinction: 'A late payment is not automatically a final loss.',
    question: 'Can a delinquent loan recover without principal loss?',
    answer:
      'Yes. It may cure or be resolved with recovery; outcomes depend on circumstances.',
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
    expression: 'ΔP / P₀ ≈ −Dₛ × Δs',
    assumptions:
      'Use a consistent full-price basis and annual decimal units for the small signed spread change Δs: widening is positive and tightening is negative. Hold the benchmark curve, valuation date, collateral, projected cash flows and option-model assumptions fixed. If the spread is OAS, name its benchmark and model convention.',
    example:
      'Hypothetical long position: Dₛ = 4 and a +25 bp widening means Δs = +0.0025, so the local spread-only price contribution is about −1%. On an initial full market value of $10 million, that is about −$100,000. A tightening gives the opposite local sign. This is not guaranteed total return: carry, convexity, funding, hedge P&L and model changes are excluded.',
  },
};
export const mortgage_concepts: MortgageConcept[] = [
  ...response_concepts,
  ...valuation_concepts,
  ...foundation_concepts,
  ...analytics_concepts,
  ...expansion_concepts,
  ...context_concepts,
  ...convention_concepts,
  ...contract_concepts,
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
  ...response_relationships,
  ...valuation_relationships,
  ...foundation_relationships,
  ...convention_relationships,
  ...contract_relationships,
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
  ...valuation_paths,
  ...response_paths,
  ...foundation_paths,
  ...analytics_paths,
  ...expansion_paths,
  ...context_paths,
  ...convention_paths,
  ...mechanism_models,
  ...atlas_paths,
  ...contract_paths,
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
  ...response_paths,
  ...valuation_paths,
  ...analytics_paths,
  ...expansion_paths,
  ...convention_paths,
  ...mechanism_models,
];

export const learning_path = mortgage_paths[0].steps.map((id) => ({ id }));
