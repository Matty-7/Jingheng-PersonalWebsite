import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const spread_topics = [
  {
    id: 'credit_prices',
    branch: 'curves',
    title: 'Credit across markets',
    concepts: ['credit_spread', 'cds_spread', 'cds_bond_basis'],
  },
  {
    id: 'income_protection',
    branch: 'structure',
    title: 'Income available for protection',
    concepts: ['excess_spread'],
  },
];

export const spread_sources = {
  credit_components: {
    publisher: 'CFA Institute',
    title: 'Components of credit spreads',
    url: 'https://rpc.cfainstitute.org/blogs/enterprising-investor/2012/components-of-credit-spreads-and-their-importance',
  },
  credit_basis: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Trends in arbitrage-based measures of bond liquidity',
    url: 'https://libertystreeteconomics.newyorkfed.org/2017/01/trends-in-arbitrage-based-measures-of-bond-liquidity/',
  },
  credit_basis_research: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Trends in credit basis spreads',
    url: 'https://www.newyorkfed.org/research/epr/2018/epr_2018_trends-in-credit-basis-spreads_boyarchenko.html',
  },
  excess_monitoring: {
    publisher: 'Basel Committee on Banking Supervision',
    title: 'Securitisation risk monitoring · SRP32.53–32.59',
    url: 'https://www.bis.org/committees/bcbs/basel-framework/standard/srp/32/inforce/2019-12-15/published/2019-12-15',
  },
  excess_income: {
    publisher: 'Basel Committee on Banking Supervision',
    title: 'Securitisation definitions · CRE40.13',
    url: 'https://www.bis.org/committees/bcbs/basel-framework/standard/cre/40/inforce/2023-01-01/published/2020-11-26',
  },
};

export const spread_concepts: MortgageConcept[] = [
  {
    id: 'credit_spread',
    branch: 'curves',
    topic: 'credit_prices',
    title: 'Credit spread',
    subtitle: 'A risk comparison that still needs a method',
    aliases: ['credit premium', 'default risk premium'],
    summary:
      'Credit spread describes the additional yield or valuation spread on a credit-risky claim relative to a stated benchmark. It is an umbrella description: G-spread, Z-spread and OAS specify different calculations. A wider spread can reflect expected losses, risk compensation, liquidity and other market effects.',
    distinction:
      'Credit spread is neither a default probability nor a uniquely defined formula. State the benchmark, currency, maturity and option treatment before comparing two numbers.',
    links: [
      {
        id: 'expected_loss',
        reason:
          'Expected losses are one contributor to the compensation investors require.',
      },
      {
        id: 'liquidity',
        reason:
          'Trading difficulty can widen a bond spread even without new default information.',
      },
      {
        id: 'z_spread',
        reason:
          'Z-spread specifies a cash-flow valuation method for quoting a spread.',
      },
      {
        id: 'oas',
        reason:
          'An embedded option requires explicit modeling before interpreting the residual spread.',
      },
      {
        id: 'cds_spread',
        reason:
          'Credit protection supplies a related price in a different market.',
      },
    ],
    question: 'Does a 200 bp credit spread mean a 2% probability of default?',
    answer:
      'No. The quote also depends on recovery, timing, risk compensation, liquidity and the chosen benchmark. Converting it into a probability requires additional assumptions.',
    sources: ['credit_components'],
  },
  {
    id: 'cds_spread',
    branch: 'curves',
    topic: 'credit_prices',
    title: 'CDS spread',
    subtitle: 'The price of contractual credit protection',
    aliases: ['credit default swap', 'CDS premium', 'par CDS spread'],
    summary:
      'A credit default swap transfers specified credit-event risk. The protection buyer pays a premium; the seller owes the contractually defined payment if a covered event occurs. A par CDS spread expresses the premium rate that balances those legs at inception, subject to the contract and valuation assumptions.',
    distinction:
      'A CDS quote concerns protection on a specified reference obligation. It is not the yield on a cash bond; contractual premium and price conventions must also be checked.',
    links: [
      {
        id: 'default',
        reason:
          'The contract defines the credit events that trigger protection.',
      },
      {
        id: 'severity',
        reason:
          'Recovery assumptions affect the size of the protection payment.',
      },
      {
        id: 'credit_spread',
        reason:
          'Both markets price credit exposure, but their cash flows and trading conditions differ.',
      },
      {
        id: 'cds_bond_basis',
        reason:
          'The basis compares the protection quote with a comparable bond spread.',
      },
    ],
    question: 'Can I compare any bond spread with a five-year CDS quote?',
    answer:
      'First align issuer, seniority, currency, maturity and contractual coverage. Differences in funding, liquidity and the deliverable obligations can remain.',
    sources: ['credit_basis', 'credit_basis_research'],
  },
  {
    id: 'cds_bond_basis',
    branch: 'curves',
    topic: 'credit_prices',
    title: 'CDS–bond basis',
    subtitle: 'Related credit exposures, different market prices',
    aliases: ['negative basis', 'cash CDS basis'],
    summary:
      'Under the convention here, the basis is the CDS spread minus a comparable cash-bond spread. A negative value means the bond spread is wider. Funding costs, liquidity, balance-sheet constraints and contract differences can keep the gap from closing.',
    distinction:
      'A negative basis does not establish a risk-free profit. The bond-spread method, matching terms and the costs of holding and hedging the position matter.',
    formula: {
      expression: 'Basis = CDS spread − comparable bond spread.',
      assumptions:
        'Both inputs are in basis points, under aligned reference-entity, currency, seniority and maturity conventions. State the bond-spread method.',
      example:
        'CDS at 120 bp and a comparable bond spread at 150 bp give a basis of −30 bp.',
    },
    links: [
      {
        id: 'cds_spread',
        reason:
          'The CDS quote supplies the protection-market leg of the comparison.',
      },
      {
        id: 'repo',
        reason:
          'Financing a cash bond changes the economics of a basis position.',
      },
      {
        id: 'liquidity',
        reason:
          'Unequal trading costs can sustain a difference between the two markets.',
      },
      {
        id: 'basis_risk',
        reason: 'A hedge can leave mismatches between related exposures.',
      },
    ],
    question:
      'If CDS is 120 bp and the bond spread is 150 bp, what is the basis?',
    answer:
      '−30 bp using CDS minus bond. That arithmetic alone does not establish an executable arbitrage.',
    sources: ['credit_basis_research'],
  },
  {
    id: 'excess_spread',
    branch: 'structure',
    topic: 'income_protection',
    title: 'Excess spread',
    subtitle: 'Deal income after specified costs and losses',
    aliases: ['future margin income', 'excess interest'],
    summary:
      'In securitization, excess spread is income left after the deal’s specified interest costs, servicing and other senior expenses, and charge-offs. Available income can provide credit support under the waterfall. Its definition, permitted use and any trapping triggers depend on the transaction.',
    distinction:
      'This is a deal-income measure, not a yield premium over a benchmark. It can shrink or turn negative; future excess spread is not cash already reserved.',
    formula: {
      expression:
        'Excess spread income = collected income − certificate interest − fees and senior expenses − charge-offs.',
      assumptions:
        'A simplified period-income convention. All inputs use the same currency and period; include each item once. A percentage requires a stated balance denominator and annualization rule.',
      example:
        '$8 of income − $3 interest − $1 expenses − $2 charge-offs leaves $2 for the period.',
    },
    links: [
      {
        id: 'abs',
        reason:
          'Asset income funds the securitization’s expenses and promised payments.',
      },
      {
        id: 'card_abs',
        reason:
          'Revolving receivables make income, losses and early-amortization triggers particularly relevant.',
      },
      {
        id: 'waterfall',
        reason:
          'Payment priorities determine whether remaining income is trapped or released.',
      },
      {
        id: 'subordination',
        reason: 'Subordination provides a separate layer of credit protection.',
      },
      {
        id: 'default',
        reason: 'Higher charge-offs can erode the available income cushion.',
      },
    ],
    question: 'Is excess spread the same number as the bond’s OAS?',
    answer:
      'No. Excess spread measures deal income under an accounting convention. OAS is a price-implied valuation spread under an option model.',
    sources: ['excess_income', 'excess_monitoring'],
  },
];

export const spread_relationships: MortgageRelationship[] = [
  ['credit_spread', 'expected_loss', 'compensates for loss risk'],
  ['credit_spread', 'liquidity', 'also reflects trading conditions'],
  ['credit_spread', 'z_spread', 'needs a measurement method'],
  ['credit_spread', 'oas', 'needs option treatment'],
  ['credit_spread', 'cds_spread', 'compares credit markets'],
  ['cds_spread', 'default', 'prices covered credit events'],
  ['cds_spread', 'severity', 'depends on recovery'],
  ['cds_spread', 'cds_bond_basis', 'supplies the protection quote'],
  ['cds_bond_basis', 'repo', 'must cover funding costs'],
  ['cds_bond_basis', 'basis_risk', 'can leave hedge mismatches'],
  ['excess_spread', 'abs', 'comes from asset income'],
  ['excess_spread', 'card_abs', 'supports revolving structures'],
  ['excess_spread', 'waterfall', 'follows payment priorities'],
  ['excess_spread', 'subordination', 'complements funded protection'],
  ['excess_spread', 'default', 'is eroded by charge-offs'],
].map(([source, target, label]) => ({
  id: `${source}__${target}`,
  source,
  target,
  label,
  reason:
    spread_concepts
      .find((c) => c.id === source)
      ?.links.find((l) => l.id === target)?.reason ??
    spread_concepts
      .find((c) => c.id === target)!
      .links.find((l) => l.id === source)!.reason,
  kind: source === 'excess_spread' ? 'mechanism' : 'comparison',
}));

export const spread_groups = [
  { id: 'all', title: 'All measures', concepts: [] as string[] },
  {
    id: 'yield',
    title: 'Yield comparisons',
    concepts: ['credit_spread', 'nominal_spread', 'g_spread', 'i_spread'],
  },
  {
    id: 'valuation',
    title: 'Price & coupon',
    concepts: [
      'z_spread',
      'oas',
      'asset_swap',
      'discount_margin',
      'quoted_margin',
    ],
  },
  {
    id: 'markets',
    title: 'Across markets',
    concepts: [
      'swap_spread',
      'cross_currency_basis',
      'cds_spread',
      'cds_bond_basis',
    ],
  },
  {
    id: 'mortgages',
    title: 'Mortgages & ABS',
    concepts: ['primary_secondary_spread', 'excess_spread'],
  },
];
