import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';

export const foundation_sources = {
  treasury_family_public: {
    publisher: 'U.S. Treasury',
    title: 'About Treasury Marketable Securities',
    url: 'https://www.treasurydirect.gov/marketable-securities/',
  },
  treasury_borrowing_estimate_2026_11_02: {
    publisher: 'U.S. Treasury',
    title:
      'Treasury Announces Marketable Borrowing Estimates · November 2, 2026',
    url: 'https://home.treasury.gov/news/press-releases/sb0675',
  },
  treasury_refunding_2026_11_04: {
    publisher: 'U.S. Treasury',
    title: 'Treasury Quarterly Refunding Statement · November 4, 2026',
    url: 'https://home.treasury.gov/news/press-releases/sb0678',
  },
  treasurydirect_auction_announcements: {
    publisher: 'TreasuryDirect',
    title: 'Auction announcements, data and results',
    url: 'https://treasurydirect.gov/auctions/auction-announcements/',
  },
  operation_twist_public: {
    publisher: 'Federal Reserve',
    title: 'Maturity Extension Program and Reinvestment Policy · 2011–2012',
    url: 'https://www.federalreserve.gov/monetarypolicy/maturityextensionprogram.htm',
  },
  covenants_public: {
    publisher: 'CFA Institute',
    title: 'Fixed-Income Instrument Features · covenants',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/fixed-income-instrument-features',
  },
  covenant_tests_public: {
    publisher: 'OCC',
    title: 'Leveraged Lending Handbook · covenant terminology',
    url: 'https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/leveraged-lending/pub-ch-leveraged-lending.pdf',
  },
};

export const foundation_topics = [
  {
    id: 'treasury_foundations',
    branch: 'curves',
    title: 'Treasury instruments and policy operations',
    concepts: ['treasury_family', 'treasury_financing_flow', 'operation_twist'],
  },
  {
    id: 'credit_contracts',
    branch: 'credit',
    title: 'Promises and lender protections',
    concepts: ['debt_covenants', 'covenant_testing'],
  },
];

const entries: Omit<MortgageConcept, 'topic' | 'branch'>[] = [
  {
    id: 'treasury_family',
    title: 'Treasury bills, notes and bonds',
    subtitle: 'Term, cash flows and inflation linkage',
    aliases: ['USTs', 'T bills', 'Treasury notes', 'Treasury bonds'],
    summary:
      'Bills mature within a year and pay face value at maturity. Notes are issued at 2, 3, 5, 7 and 10 years; bonds at 20 and 30 years. Notes and bonds pay semiannual coupons. These names describe issuance terms, not today’s remaining maturity or duration.',
    distinction:
      'TIPS adjust principal for inflation; Treasury FRNs reset interest using 13-week bill rates. STRIPS separate eligible coupon and principal payments. A long original term does not make a seasoned bond’s current duration long. These instruments connect mortgage benchmarks to cash-flow and risk definitions.',
    links: [
      {
        id: 'treasury',
        reason: 'Treasury yields provide a benchmark context.',
      },
      { id: 'zero_coupon', reason: 'STRIPS isolate individual payments.' },
      {
        id: 'inflation_linked',
        reason: 'Inflation linkage changes the payment basis.',
      },
      { id: 'macaulay', reason: 'Payment timing affects duration.' },
    ],
    question:
      'A bond was originally issued for 30 years. Must it still have 30 years of duration?',
    answer:
      'No. Remaining payment dates, coupons, yield and the duration definition matter.',
    sources: ['treasury_family_public'],
  },
  {
    id: 'treasury_financing_flow',
    title: 'Treasury financing flow',
    subtitle: 'Borrowing estimates, refunding and auction cash',
    aliases: [
      'Treasury borrowing estimate',
      'quarterly refunding',
      'new cash',
      'auction size',
      'TGA cash balance',
      'SOMA add-on',
    ],
    summary:
      'Treasury’s quarterly borrowing estimate projects privately held net marketable borrowing from expected receipts, outlays, other financing and an assumed quarter-end cash balance. A refunding statement instead identifies a specific package of securities: gross offering less privately held maturities is the package’s new cash. Each auction announcement then states one security’s offering amount, dates and terms.',
    distinction:
      'Match the period, holder basis and cash convention before comparing figures. Gross refunding offering includes the amount used to refinance maturing privately held debt; an auction size is security-level, while a quarterly borrowing estimate is broader and depends on the Treasury General Account cash-balance assumption. Treasury’s estimate excludes SOMA rollover add-ons but includes financing needed when SOMA holdings redeem. None of these figures alone determines Treasury yields, agency MBS spreads or OAS.',
    formula: {
      expression:
        'privately held new cash = gross refunding offering − privately held maturities',
      assumptions:
        'All inputs use the same currency, usually USD billions, and the same refunding settlement set. The holder and settlement bases must align. This identity is not the quarterly borrowing estimate, and the TGA cash-balance assumption remains separate.',
      example:
        'Historical snapshot, not a live forecast or pricing signal: on November 4, 2026, Treasury announced a $125 billion refunding offering against about $97 billion of privately held maturities, implying about $28 billion of new cash. That is not the November 2 estimate of $618 billion in privately held net marketable borrowing for the October–December quarter, which assumed an $850 billion end-December cash balance.',
    },
    links: [
      {
        id: 'treasury_family',
        reason: 'Define which securities are issued in the financing package.',
      },
      {
        id: 'qe_qt',
        reason:
          'Separate public financing needs from Federal Reserve portfolio flows.',
      },
      {
        id: 'supply_demand',
        reason:
          'Place issuance beside investor allocation and intermediation capacity.',
      },
      {
        id: 'term_premium',
        reason: 'Connect maturity supply to conditional required compensation.',
      },
      {
        id: 'current_coupon',
        reason:
          'Trace Treasury conditions into, but not through, the MBS basis.',
      },
    ],
    question:
      'Treasury announces a $125 billion refunding offering and $97 billion of privately held maturities. Does that mean quarterly net borrowing is $125 billion?',
    answer:
      'No. That refunding package raises about $28 billion of new cash. The quarterly borrowing estimate covers a broader period and depends on projected cash flows and the assumed TGA balance.',
    sources: [
      'treasury_borrowing_estimate_2026_11_02',
      'treasury_refunding_2026_11_04',
      'treasurydirect_auction_announcements',
    ],
  },
  {
    id: 'operation_twist',
    title: 'Operation Twist',
    subtitle: 'Changing the maturity mix held by the public',
    aliases: ['maturity extension program', 'MEP'],
    summary:
      'In the 2011–2012 maturity extension program, the Federal Reserve sold or redeemed shorter-term Treasuries and bought longer-term Treasuries. It aimed to put downward pressure on longer-term rates by changing the maturity mix available to other investors.',
    distinction:
      'Flattening was an intended influence, not a guaranteed outcome. This historical operation is different from describing every curve twist or a trader’s curve position. Mortgage rates also depend on MBS spreads and primary-market conditions.',
    links: [
      {
        id: 'qe_qt',
        reason: 'Compare maturity composition with balance-sheet size.',
      },
      {
        id: 'curve_slope',
        reason: 'Long-minus-short yields measure curve slope.',
      },
      {
        id: 'term_premium',
        reason: 'Duration supply can affect required compensation.',
      },
      {
        id: 'current_coupon',
        reason: 'Connect Treasury conditions to MBS benchmarks.',
      },
    ],
    question:
      'Does a maturity extension program guarantee that mortgage rates fall by the same amount as Treasury yields?',
    answer:
      'No. Policy effects are conditional, and mortgage spreads and lender pricing can change.',
    sources: ['operation_twist_public', 'primary_secondary_public'],
  },
  {
    id: 'debt_covenants',
    title: 'Affirmative and negative covenants',
    subtitle: 'What a borrower must do or may not do',
    aliases: [
      'covenants',
      'affirmative covenant',
      'negative covenant',
      'bond indenture',
    ],
    summary:
      'Covenants are contractual promises. Affirmative covenants require actions, such as providing financial reports. Negative covenants restrict actions, such as additional borrowing or asset transfers, subject to the agreement’s exceptions.',
    distinction:
      'A covenant regulates conduct; subordination governs relative claim priority. Neither label guarantees recovery. The actual documents determine definitions, exceptions, testing, cure rights and remedies.',
    links: [
      {
        id: 'covenant_testing',
        reason: 'The testing trigger is a separate question.',
      },
      {
        id: 'subordination',
        reason: 'Claim priority differs from contractual restrictions.',
      },
      {
        id: 'corporate',
        reason: 'An indenture specifies bondholder protections.',
      },
    ],
    question:
      'Does calling a bond senior tell you whether the borrower can incur more debt?',
    answer:
      'No. Priority and restrictions on additional borrowing are separate contract terms.',
    sources: ['covenants_public'],
  },
  {
    id: 'covenant_testing',
    title: 'Maintenance and incurrence tests',
    subtitle: 'When a financial condition is checked',
    aliases: [
      'maintenance covenant',
      'incurrence covenant',
      'covenant lite',
      'cov-lite',
      'covenant-lite',
    ],
    summary:
      'A maintenance covenant tests a financial condition at specified reporting dates. An incurrence covenant tests a condition when the borrower proposes a covered action, such as raising more debt. Deteriorating earnings can breach a maintenance test even without new borrowing.',
    distinction:
      'Covenant-lite usually means weaker or absent traditional financial maintenance tests, not necessarily no covenants. Read each facility’s documents, including any springing tests. In a CLO, loan-level borrower covenants are distinct from the CLO’s own coverage tests.',
    links: [
      {
        id: 'debt_covenants',
        reason: 'Separate required or prohibited conduct from test timing.',
      },
      {
        id: 'clo',
        reason: 'Loan protections matter within the collateral pool.',
      },
      { id: 'oc', reason: 'Deal-level coverage tests govern another layer.' },
    ],
    question:
      'Must a covenant-lite loan be free of all reporting duties and restrictions on new debt?',
    answer:
      'No. The term concerns financial maintenance protection; other covenants can remain.',
    sources: ['covenant_tests_public'],
  },
];

export const foundation_concepts: MortgageConcept[] = entries.map((entry) => {
  const topic = foundation_topics.find((item) =>
    item.concepts.includes(entry.id),
  )!;
  return { ...entry, topic: topic.id, branch: topic.branch };
});
const concept_relationships: MortgageRelationship[] =
  foundation_concepts.flatMap((concept) =>
    concept.id === 'treasury_financing_flow'
      ? []
      : concept.links.map((link) => ({
          id: `foundation_${concept.id}__${link.id}`,
          source: concept.id,
          target: link.id,
          label: link.reason,
          reason: link.reason,
          kind: 'comparison' as const,
          conditions:
            'Compare the stated instrument, contract and measurement conventions; shared terminology does not make the exposures identical.',
          sources: concept.sources,
        })),
  );
export const foundation_paths = [
  {
    id: 'duration_to_dollars',
    title: 'From payment timing to dollar risk',
    description:
      'Connect the three duration definitions with quotation and hedge size.',
    premise:
      'Name the cash-flow assumptions and rate shock before converting sensitivity into dollars.',
    steps: [
      'treasury_family',
      'macaulay',
      'modified_duration',
      'duration',
      'dv01',
      'price_32nds',
      'hedging',
    ],
    explanations: [
      'Identify the payment structure.',
      'Weight payment times by present value.',
      'Hold cash flows fixed for a yield sensitivity.',
      'Reproject mortgage payments under a curve shock.',
      'Scale the sensitivity by market value.',
      'Keep a price tick separate from a yield basis point.',
      'Size a hedge while retaining residual risks.',
    ],
  },
  {
    id: 'covenants_to_clo',
    title: 'From a loan covenant to a CLO',
    description: 'Follow contractual protections into structured credit.',
    premise:
      'Borrower obligations and deal-level protections sit at different layers.',
    steps: [
      'debt_covenants',
      'covenant_testing',
      'clo',
      'oc',
      'subordination',
      'waterfall',
    ],
    explanations: [
      'Read the borrower’s promises.',
      'Identify when a financial condition is tested.',
      'Place the loan inside its collateral pool.',
      'Distinguish the deal’s coverage tests.',
      'Identify the first-loss protection.',
      'Trace the deal’s payment priorities.',
    ],
  },
];
export const foundation_checks = {
  treasury_family: {
    choices: [
      'Yes. The original term fixes duration until maturity.',
      'No. Remaining payments and the duration definition matter.',
      'Yes. All Treasury securities have identical duration.',
    ] as [string, string, string],
    correct: 1,
  },
  operation_twist: {
    choices: [
      'Yes. Mortgage rates must follow Treasuries one for one.',
      'Yes. The operation fixes MBS spreads.',
      'No. Mortgage spreads and lender pricing can also change.',
    ] as [string, string, string],
    correct: 2,
  },
  treasury_financing_flow: {
    choices: [
      'Yes. Gross offering and quarterly net borrowing are the same measure.',
      'No. The refunding set raises about $28 billion of new cash; the quarterly estimate is broader and depends on projected cash flows and the TGA assumption.',
      'Yes. Privately held maturities do not affect new cash.',
    ] as [string, string, string],
    correct: 1,
  },
  debt_covenants: {
    choices: [
      'No. Priority and borrowing restrictions are separate terms.',
      'Yes. Senior debt prohibits all additional borrowing.',
      'Yes. Seniority guarantees full recovery.',
    ] as [string, string, string],
    correct: 0,
  },
  covenant_testing: {
    choices: [
      'Yes. Covenant-lite eliminates every contractual promise.',
      'No. Reporting duties and incurrence restrictions can remain.',
      'Yes. Only the coupon obligation survives.',
    ] as [string, string, string],
    correct: 1,
  },
};

export const foundation_relationships: MortgageRelationship[] = [
  ...concept_relationships,
  {
    id: 'foundation_treasury_financing_flow__treasury_family',
    source: 'treasury_financing_flow',
    target: 'treasury_family',
    label: 'financing package uses Treasury instruments',
    reason:
      'Refunding and auction announcements identify bills, notes, bonds, TIPS or FRNs with security-specific terms.',
    conditions:
      'Instrument type and offering amount do not by themselves state the package’s privately held new cash.',
    kind: 'definition',
    sources: ['treasurydirect_auction_announcements'],
  },
  {
    id: 'foundation_treasury_financing_flow__qe_qt',
    source: 'treasury_financing_flow',
    target: 'qe_qt',
    label: 'public borrowing differs from SOMA flows',
    reason:
      'Treasury separates privately held borrowing from Federal Reserve rollover add-ons and financing associated with SOMA redemptions.',
    conditions:
      'Use the announced holder convention: rollover add-ons are excluded while redemption financing is included.',
    kind: 'measurement',
    sources: ['treasury_borrowing_estimate_2026_11_02'],
  },
  {
    id: 'foundation_treasury_financing_flow__supply_demand',
    source: 'treasury_financing_flow',
    target: 'supply_demand',
    label: 'issuance meets investor balance sheets',
    reason:
      'Auction supply becomes one input to investor allocation, dealer intermediation and cross-asset balance-sheet decisions.',
    conditions:
      'An announced financing amount does not identify the buyer mix or mechanically widen Treasury or agency MBS spreads.',
    kind: 'mechanism',
    sources: [
      'treasury_refunding_2026_11_04',
      'treasurydirect_auction_announcements',
    ],
  },
  {
    id: 'foundation_treasury_financing_flow__term_premium',
    source: 'treasury_financing_flow',
    target: 'term_premium',
    label: 'maturity supply can alter duration absorption',
    reason:
      'The maturity composition of issuance can change how much duration private investors must absorb.',
    conditions:
      'The effect is conditional on demand, expected policy, inflation risk, liquidity and the existing maturity mix; issuance is not a term-premium forecast.',
    kind: 'mechanism',
    sources: ['treasury_refunding_2026_11_04'],
  },
  {
    id: 'foundation_treasury_financing_flow__current_coupon',
    source: 'treasury_financing_flow',
    target: 'current_coupon',
    label: 'Treasury financing enters the mortgage basis indirectly',
    reason:
      'Treasury yields and balance-sheet conditions can influence the benchmark and intermediation environment around agency MBS current coupon.',
    conditions:
      'Agency MBS spreads and OAS also depend on mortgage supply, prepayment-option value, volatility, liquidity and investor demand; no one-for-one pass-through is implied.',
    kind: 'comparison',
    sources: [
      'treasury_refunding_2026_11_04',
      'treasurydirect_auction_announcements',
    ],
  },
  {
    id: 'foundation_dv01__price_32nds',
    source: 'dv01',
    target: 'price_32nds',
    label: 'yield sensitivity versus price increment',
    reason:
      'DV01 is dollars per yield basis point; a thirty-second is a quoted price increment.',
    conditions:
      'Use current face for quoted price movements and consistent market value for DV01.',
    kind: 'comparison',
    sources: ['dv01', 'treasury_futures'],
  },
  {
    id: 'foundation_price_32nds__hedging',
    source: 'price_32nds',
    target: 'hedging',
    label: 'quote units precede hedge sizing',
    reason:
      'Quoted prices must be converted into position values before applying the chosen risk measure.',
    conditions: 'Tick notation does not specify a yield sensitivity.',
    kind: 'measurement',
    sources: ['dv01', 'treasury_futures'],
  },
  {
    id: 'foundation_oc__subordination',
    source: 'oc',
    target: 'subordination',
    label: 'coverage tests and loss priority differ',
    reason:
      'Coverage tests can redirect cash; subordination determines which claims absorb losses first.',
    conditions:
      'Read the deal-specific coverage definitions and payment priorities.',
    kind: 'comparison',
    sources: ['clo'],
  },
];
