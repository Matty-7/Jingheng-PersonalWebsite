import type {
  MortgageConcept,
  MortgageRelationship,
} from './mortgage_concepts.ts';
import { context_comparisons } from './mortgage_context.ts';
import { analytics_comparisons } from './mortgage_analytics.ts';

// Public financial concepts only. Currency, collateral, guarantee and coupon are
// separate dimensions, not interchangeable levels in a product taxonomy.
export const atlas_topics = [
  {
    id: 'market_structure',
    branch: 'products',
    title: 'How assets become securities',
    concepts: ['securitization_roles'],
  },
  {
    id: 'household_balance',
    branch: 'basics',
    title: 'Home value and equity',
    concepts: ['home_prices', 'reverse_mortgage'],
  },
  {
    id: 'swap_references',
    branch: 'curves',
    title: 'The swap reference',
    concepts: ['swap_curve'],
  },

  {
    id: 'mortgage_sectors',
    branch: 'products',
    title: 'Residential & commercial',
    concepts: ['rmbs', 'cmbs', 'crt'],
  },
  {
    id: 'other_securitization',
    branch: 'products',
    title: 'Beyond mortgage collateral',
    concepts: ['abs', 'auto_abs', 'card_abs', 'student_abs', 'clo'],
  },
  {
    id: 'bond_families',
    branch: 'products',
    title: 'Other promises to pay',
    concepts: ['sovereign', 'corporate', 'municipal', 'covered_bonds'],
  },
  {
    id: 'bond_features',
    branch: 'products',
    title: 'Contract features',
    concepts: [
      'floater',
      'zero_coupon',
      'inflation_linked',
      'callable',
      'caps_floors',
    ],
  },
  {
    id: 'spread_comparison',
    branch: 'curves',
    title: 'Which spread, exactly?',
    concepts: [
      'g_spread',
      'i_spread',
      'asset_swap',
      'discount_margin',
      'quoted_margin',
      'swap_spread',
      'spread_duration',
    ],
  },
  {
    id: 'currency_references',
    branch: 'currencies',
    title: 'Benchmark families',
    concepts: [
      'usd_rates',
      'eur_rates',
      'gbp_rates',
      'jpy_rates',
      'chf_rates',
      'cny_rates',
    ],
  },
  {
    id: 'currency_mechanics',
    branch: 'currencies',
    title: 'Crossing currencies',
    concepts: [
      'currency_denomination',
      'fx_hedging',
      'cross_currency_basis',
      'term_overnight',
    ],
  },
];

export const atlas_sources = {
  nyfed_swap_spreads: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Negative Swap Spreads',
    url: 'https://www.newyorkfed.org/research/epr/2018/epr_2018_negative-swap-spreads_boyarchenko.html',
  },
  covered_public: {
    publisher: 'European Union',
    title: 'Covered bonds and covered bond public supervision',
    url: 'https://eur-lex.europa.eu/EN/legal-content/summary/covered-bonds-and-covered-bond-public-supervision.html',
  },
  dr007_public: {
    publisher: 'CFETS',
    title: 'Repo reference rates and fixing methodology',
    url: 'https://www.chinamoney.com.cn/english/bmkfrr/',
  },
  treasury_strips: {
    publisher: 'US Treasury',
    title: 'STRIPS',
    url: 'https://www.treasurydirect.gov/marketable-securities/strips/',
  },
  treasury_tips: {
    publisher: 'US Treasury',
    title: 'Treasury Inflation-Protected Securities',
    url: 'https://www.treasurydirect.gov/marketable-securities/tips/',
  },
  fhfa_hpi: {
    publisher: 'FHFA',
    title: 'House Price Index',
    url: 'https://www.fhfa.gov/data/hpi',
  },
  reverse_cfpb: {
    publisher: 'CFPB',
    title: 'What is a reverse mortgage?',
    url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-reverse-mortgage-en-224/',
  },

  bond_families: {
    publisher: 'SEC · Investor.gov',
    title: 'Bonds: corporate, municipal and government debt',
    url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds',
  },
  sec_abs: {
    publisher: 'SEC',
    title: 'Asset-backed securities · background and definitions',
    url: 'https://www.sec.gov/spotlight/dodd-frank/assetbackedsecurities.shtml',
  },
  fannie_crt: {
    publisher: 'Fannie Mae',
    title: 'Credit Risk Transfer',
    url: 'https://capitalmarkets.fanniemae.com/credit-risk-transfer',
  },
  spreads_public: {
    publisher: 'LSEG',
    title: 'Bond analytics · yield, spread and asset-swap definitions',
    url: 'https://developers.lseg.com/en/api-catalog/refinitiv-data-platform/refinitiv-data-platform-apis/documentation/manuals-and-guides/ipa-financial-contracts/ipa-financial-contracts---bond-contracts',
  },
  cfa_floating: {
    publisher: 'CFA Institute',
    title: 'Yield and yield spread measures for floating-rate instruments',
    url: 'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/yield-and-yield-spread-measures-for-floating-rate-instruments',
  },
  atlas_sofr: {
    publisher: 'Federal Reserve Bank of New York',
    title: 'Secured Overnight Financing Rate',
    url: 'https://www.newyorkfed.org/markets/reference-rates/sofr',
  },
  estr: {
    publisher: 'European Central Bank',
    title: 'Euro short-term rate (€STR)',
    url: 'https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate/html/index.en.html',
  },
  euribor: {
    publisher: 'European Money Markets Institute',
    title: 'Euribor · the euro unsecured term benchmark',
    url: 'https://www.emmi-benchmarks.eu/benchmarks/euribor/',
  },
  sonia: {
    publisher: 'Bank of England',
    title: 'SONIA: key features and policies',
    url: 'https://www.bankofengland.co.uk/markets/sonia-benchmark/sonia-key-features-and-policies',
  },
  tona: {
    publisher: 'Bank of Japan',
    title: 'Cross-Industry Committee on Japanese Yen Interest Rate Benchmarks',
    url: 'https://www.boj.or.jp/en/paym/market/jpy_cmte/index.htm',
  },
  saron: {
    publisher: 'SIX',
    title: 'SARON: Swiss Average Rate Overnight',
    url: 'https://www.six-group.com/en/market-data/indices/switzerland/saron.html',
  },
  benchmark_comparison: {
    publisher: 'Swiss National Bank',
    title: 'Life after Libor: a new era of reference interest rates',
    url: 'https://www.snb.ch/public/asset/en/www-snb-ch/publications/communication/speeches/2022/ref_20220331_amrtmo/publications0_en/ref_20220331_amrtmo.en.pdf',
  },
  lpr: {
    publisher: 'China Foreign Exchange Trade System',
    title: 'Loan Prime Rate',
    url: 'https://www.chinamoney.com.cn/english/bmklpr/',
  },
  bis_basis: {
    publisher: 'Bank for International Settlements',
    title:
      'Covered interest parity lost: understanding the cross-currency basis',
    url: 'https://www.bis.org/publications/qr-201609/covered-interest-parity-lost-understanding-cross-currency-basis',
  },
};

type Entry = [
  id: string,
  title: string,
  subtitle: string,
  summary: string,
  distinction: string,
  links: [string, string][],
  sources: string[],
  aliases?: string[],
];
const entries: Entry[] = [
  [
    'swap_curve',
    'Swap par curve',
    'The fixed rate that balances a swap',
    'A swap par curve records fixed rates that give specified interest-rate swaps zero value at inception under their market conventions. It differs from a zero curve used to discount each individual cash flow. The floating reference, collateral convention, currency and maturity belong to the definition.',
    'A five-year swap par rate is a single rate for a multi-payment contract. It is not automatically the five-year zero rate.',
    [
      [
        'par_curve',
        'Par rates make a specified multi-payment instrument price at par or zero initial swap value.',
      ],
      [
        'ois',
        'An OIS exchanges a fixed rate against an overnight-based floating leg.',
      ],
    ],
    ['arrc', 'spreads_public'],
    ['swap curve'],
  ],
  [
    'caps_floors',
    'Caps and floors',
    'Limits on a floating coupon',
    'A cap limits the maximum coupon rate and a floor limits the minimum, subject to the contract definition. These options can make a floating-rate security respond asymmetrically to benchmark-rate changes. Their value depends on strikes, dates and interest-rate volatility.',
    'A floating coupon does not imply an option-free bond. A plain discount-margin calculation does not automatically separate cap, floor or call value.',
    [
      ['floater', 'Caps and floors modify the otherwise floating coupon rule.'],
      ['oas', 'Optional coupon limits may require explicit option modeling.'],
    ],
    ['cfa_floating', 'spreads_public'],
    ['cap', 'floor'],
  ],
  [
    'securitization_roles',
    'Securitization roles',
    'Different jobs around the same pool',
    'The originator makes or acquires the underlying loans. The issuer or special-purpose vehicle issues securities under the transaction structure. The servicer collects payments and handles loan administration. The trustee carries out duties specified in the governing documents, including aspects of payment administration. One firm can perform several roles.',
    'A servicer collects and administers payments; that alone does not make it the guarantor or investor. Legal responsibilities follow the transaction documents.',
    [
      [
        'servicing',
        'Servicing affects administration, fees and the timing of collections.',
      ],
      [
        'waterfall',
        'The governing structure determines how collected cash is allocated.',
      ],
    ],
    ['guide', 'sec_abs'],
    ['originator', 'SPV', 'trustee'],
  ],
  [
    'home_prices',
    'Home prices and equity',
    'HPI is an index; HPA is a change',
    'A house price index measures changes in a defined housing market using a specified methodology. House price appreciation describes a rate of change, historical or assumed. Home prices influence borrower equity, refinancing capacity and potential recovery after default. A broad index is not an appraisal of a particular home.',
    'With an unchanged loan balance, a fall in property value raises LTV. An aggregate HPI and a property-level valuation answer different questions.',
    [
      ['ltv', 'Property value is the denominator of the loan-to-value ratio.'],
      [
        'severity',
        'Collateral value and selling costs influence recoveries after default.',
      ],
    ],
    ['fhfa_hpi'],
    ['HPI', 'HPA', 'house price appreciation', 'equity'],
  ],
  [
    'reverse_mortgage',
    'Reverse mortgages',
    'Borrowing can grow the balance',
    'A reverse mortgage allows eligible homeowners to borrow against home equity under program-specific terms. Unlike a standard forward mortgage, interest and fees can be added to the balance rather than paid through regular principal-and-interest installments. The borrower still has obligations such as property charges and maintenance.',
    'Do not apply a forward-loan amortization schedule without reading the contract. The outstanding balance may increase over time; repayment triggers and guarantees depend on the program.',
    [
      [
        'amortization',
        'Balance growth differs from the scheduled paydown of a forward mortgage.',
      ],
      [
        'ltv',
        'Accrued interest and changing home value affect the balance relative to collateral.',
      ],
    ],
    ['reverse_cfpb'],
    ['HECM', 'reverse mortgage'],
  ],

  [
    'rmbs',
    'Residential MBS',
    'Home loans become bond cash flows',
    'RMBS finance pools of residential mortgages. Borrower interest, scheduled amortization and unscheduled principal payments feed the securities. The collateral label alone does not tell you who guarantees payment, how losses are allocated, or how principal is distributed among classes.',
    'Residential describes the collateral. Agency describes a guarantee or issuance framework; pass-through and CMO describe cash-flow structures. Read all three dimensions.',
    [
      [
        'agency',
        'The guarantee changes which mortgage credit losses the investor bears.',
      ],
      [
        'prepayments',
        'Homeowners can return principal earlier than the contractual schedule.',
      ],
    ],
    ['basics', 'guide'],
    ['RMBS', 'residential mortgage-backed securities'],
  ],
  [
    'cmbs',
    'Commercial MBS',
    'Property income supports the loan',
    'CMBS are backed by loans on commercial properties, including offices, retail, hotels and multifamily buildings. Rental income, operating costs, lease rollover and the ability to refinance a balloon payment drive collateral performance. Loan-level restrictions can limit voluntary prepayment.',
    'CMBS versus RMBS is primarily a collateral distinction. A commercial loan may finance a residential apartment building; this is not the same pool as individual household mortgages.',
    [
      [
        'conduit_sasb',
        'Conduit and SASB describe different concentrations of commercial mortgage collateral.',
      ],
      [
        'noi',
        'Property operating income is an input to debt-service capacity.',
      ],
    ],
    ['crefc_c', 'crefc_s'],
    ['CMBS', 'commercial mortgage-backed securities'],
  ],
  [
    'crt',
    'Mortgage credit risk transfer',
    'A reference pool, a credit-loss exposure',
    'CRT transactions transfer specified mortgage credit losses to investors or counterparties. The attachment point, detachment point, reference-pool performance and transaction terms determine the exposure. CRT can coexist with the guarantor continuing to guarantee its standard MBS.',
    'Owning CRT credit exposure is different from owning an agency pass-through. The familiar mortgage collateral does not make the credit guarantee equivalent.',
    [
      [
        'default',
        'Reference mortgage defaults and realized losses can reduce credit-protection principal.',
      ],
      [
        'subordination',
        'Attachment and detachment points determine which layer of loss is transferred.',
      ],
    ],
    ['fannie_crt'],
    ['CRT', 'CAS', 'credit risk transfer'],
  ],
  [
    'abs',
    'Asset-backed securities',
    'Contractual receivables fund securities',
    'ABS transform pools of receivables into securities with defined payment priorities. Auto loans, credit-card balances, student loans and equipment leases produce different cash-flow patterns. In broad usage, securitization includes mortgages; market desks often use ABS more narrowly for non-mortgage collateral.',
    'ABS is not one homogeneous risk. Identify the assets, whether the pool revolves, its servicing arrangements and the waterfall before comparing yields.',
    [
      [
        'waterfall',
        'Payment priorities turn collateral collections into class-specific cash flows.',
      ],
      [
        'default',
        'Borrower or obligor nonpayment changes the amount collected.',
      ],
    ],
    ['sec_abs'],
    ['ABS', 'asset-backed securities', 'consumer ABS'],
  ],
  [
    'auto_abs',
    'Auto-loan ABS',
    'Amortizing loans, depreciating collateral',
    'Auto-loan ABS receive scheduled principal and interest plus early payoffs. Delinquencies, defaults and proceeds from repossessed vehicles affect collections. Borrower credit quality, loan term and recovery timing matter alongside the value of the vehicle collateral.',
    'Fast principal repayment can be voluntary prepayment or liquidation after default. Similar balance declines can have very different loss outcomes.',
    [
      ['abs', 'Auto loans are one collateral family within non-mortgage ABS.'],
      [
        'severity',
        'Vehicle recoveries affect the fraction of defaulted principal lost.',
      ],
    ],
    ['sec_abs'],
    ['auto loan', 'car loan ABS'],
  ],
  [
    'card_abs',
    'Credit-card ABS',
    'Revolving receivables, staged repayment',
    'Credit-card securitizations commonly replenish receivables during a revolving period, then move into an accumulation or amortization phase. Payment rates, charge-offs and excess spread influence performance. Early-amortization triggers can change how principal is returned.',
    'An open-ended card account is not a level-payment installment loan. Do not carry a mortgage amortization schedule across to revolving credit.',
    [
      [
        'abs',
        'The revolving collateral profile changes the structure of an ABS transaction.',
      ],
      [
        'waterfall',
        'Triggers can redirect principal from reinvestment to repayment.',
      ],
    ],
    ['sec_abs'],
    ['credit card', 'revolving ABS'],
  ],
  [
    'student_abs',
    'Student-loan ABS',
    'Repayment terms shape the cash flows',
    'Student-loan pools may include private loans or loans under distinct government programs. Deferment, forbearance, repayment plans and any applicable guarantee affect cash-flow timing and loss exposure. The exact loan program and vintage matter.',
    'A student-loan label does not establish a universal government guarantee. Verify the specific program and security rather than generalizing across pools.',
    [
      ['abs', 'Education loans are a distinct ABS collateral family.'],
      [
        'payment_delay',
        'Contractual relief or deferment can postpone expected cash receipts.',
      ],
    ],
    ['sec_abs'],
    ['student loan'],
  ],
  [
    'clo',
    'Collateralized loan obligations',
    'Corporate loans, tranched credit',
    'Corporate CLOs hold portfolios of leveraged loans and allocate collections through a waterfall. Senior and junior notes have different loss protection. Reinvestment rules, manager decisions and coverage tests can alter cash flows; many notes pay floating coupons.',
    'Corporate CLO collateral consists of business loans. A CRE CLO instead holds commercial real-estate loans; the shared acronym does not make the collateral identical.',
    [
      [
        'oc',
        'Collateral deterioration can breach coverage tests and redirect cash.',
      ],
      [
        'floater',
        'Floating-rate notes shift attention from a fixed coupon to resets and spread.',
      ],
    ],
    ['clo'],
    ['CLO', 'collateralized loan obligation', 'CRE CLO'],
  ],
  [
    'sovereign',
    'Sovereign bonds',
    'A government is the borrower',
    'Sovereign debt is issued by a national government in its own or another currency. Government curves often serve as valuation and hedging references. Tax treatment, liquidity, currency and sovereign credit quality still differ across issuers.',
    'Government does not mean universally risk-free. A euro government reference must name the issuer or construction: Bunds, OATs and BTPs are not interchangeable.',
    [
      [
        'g_spread',
        'A government benchmark provides the reference yield for a G-spread.',
      ],
      [
        'currency_denomination',
        'The issuer’s nationality does not determine the currency of its debt.',
      ],
    ],
    ['bond_families'],
    ['Treasuries', 'gilts', 'Bund', 'JGB', 'government bond'],
  ],
  [
    'corporate',
    'Corporate bonds',
    'A claim on a company',
    'Corporate bonds finance companies and expose holders to issuer credit, ranking and contractual terms. Investment-grade and high-yield categories describe rating ranges, not different coupon formulas. Seniority, security, covenants, calls and liquidity matter within either category.',
    'A corporate bond is generally a claim against its issuer. A securitization instead allocates specified asset collections through its transaction structure.',
    [
      [
        'default',
        'Issuer failure can interrupt coupons and principal repayment.',
      ],
      [
        'callable',
        'A call provision can cap the upside when refinancing becomes attractive.',
      ],
    ],
    ['bond_families'],
    ['investment grade', 'high yield', 'IG', 'HY'],
  ],
  [
    'municipal',
    'Municipal bonds',
    'Local governments and public projects',
    'Municipal bonds finance states, local governments and related public entities, especially in the US market. General-obligation and revenue bonds rely on different repayment sources. Tax treatment can influence quoted yields and the investor base.',
    'Compare repayment pledges and after-tax conventions before treating a municipal yield as directly comparable with a taxable corporate or Treasury yield.',
    [
      [
        'yield',
        'Tax and quotation conventions affect how investors compare yields.',
      ],
      [
        'default',
        'The repayment pledge and obligor still create credit exposure.',
      ],
    ],
    ['bond_families'],
    ['muni', 'municipals'],
  ],
  [
    'covered_bonds',
    'Covered bonds',
    'Issuer recourse plus a cover pool',
    'Covered bonds are obligations of an issuer, commonly a bank, supported by a designated cover pool. Investors typically have recourse to the issuer and priority rights over cover assets under the applicable framework. The assets and liability remain linked through ongoing requirements.',
    'Dual recourse separates a covered bond from a simple pass-through. Mortgage collateral alone does not make it RMBS; jurisdiction and issuance terms govern the protection.',
    [
      [
        'rmbs',
        'Both may involve home loans, but recourse and payment structures differ.',
      ],
      [
        'corporate',
        'The issuing institution remains part of the credit analysis.',
      ],
    ],
    ['covered_public'],
    ['covered bond', 'Pfandbrief', 'dual recourse'],
  ],
  [
    'floater',
    'Floating-rate notes',
    'A reference rate plus a margin',
    'A floater resets its coupon to a specified reference rate plus a contractual margin. Reset frequency, payment frequency, observation lag and compounding rules matter. Caps, floors or calls can add optionality; a floating coupon does not remove credit or spread risk.',
    'A coupon reset reduces exposure to some benchmark-rate movements. It does not guarantee a stable price or eliminate discount-margin risk.',
    [
      [
        'quoted_margin',
        'The contract determines the coupon add-on at each reset.',
      ],
      [
        'discount_margin',
        'The market-required margin determines whether the note trades above or below par.',
      ],
    ],
    ['cfa_floating'],
    ['FRN', 'floating-rate note'],
  ],
  [
    'zero_coupon',
    'Zero-coupon bonds',
    'One payment at maturity',
    'A plain zero-coupon bond makes no periodic coupon payments and repays a contractual amount at maturity. Its present value depends on the discount factor for that date and its credit terms. Treasury STRIPS separate eligible securities into individual principal and interest claims.',
    'A zero-coupon bond is an instrument. A zero curve is a set of discounting rates across dates; the two are related but not synonyms.',
    [
      ['spot_curve', 'A zero rate discounts a single dated cash flow.'],
      [
        'duration',
        'With one payment, Macaulay duration equals time to maturity; other duration definitions differ.',
      ],
    ],
    ['treasury_strips'],
    ['zero', 'STRIPS', 'zero coupon'],
  ],
  [
    'inflation_linked',
    'Inflation-linked bonds',
    'Payments reference a price index',
    'Inflation-linked bonds adjust principal or coupons using a specified inflation index and lag. US TIPS adjust principal with CPI and have a maturity principal floor. Real yields, indexation and inflation expectations create a different pricing framework from nominal bonds.',
    'Breakeven inflation from nominal versus real yields also reflects liquidity and risk premia. It is not a clean forecast of future inflation.',
    [
      [
        'sovereign',
        'Governments issue both nominal and inflation-linked debt.',
      ],
      [
        'discount_factor',
        'Real and nominal cash flows require consistent discounting conventions.',
      ],
    ],
    ['treasury_tips'],
    ['TIPS', 'linker', 'real yield'],
  ],
  [
    'callable',
    'Callable bonds',
    'The issuer owns an early-redemption option',
    'A callable bond allows the issuer to redeem under specified dates and prices. Refinancing incentives can shorten expected cash flows when rates fall. Valuation therefore depends on the exercise terms and a model of the option, in addition to the scheduled coupons.',
    'An issuer call and homeowner prepayment both change timing, but the decision maker, constraints and exercise behavior differ.',
    [
      ['oas', 'Option-sensitive cash flows motivate a model-adjusted spread.'],
      [
        'prepayments',
        'Mortgage prepayment is another source of early return of principal.',
      ],
    ],
    ['bond_families', 'spreads_public'],
    ['call option', 'callable bond'],
  ],
  [
    'g_spread',
    'G-spread',
    'Bond yield minus a government reference',
    'G-spread compares a bond’s yield with a stated government benchmark yield, often interpolated to a comparison tenor. It is a one-yield comparison. The currency, government issuer, interpolation rule and yield conventions need to be identified.',
    'G-spread is not a spread applied to every dated cash flow. A government curve in one country or currency cannot silently substitute for another.',
    [
      ['nominal_spread', 'G-spread is a benchmark-specific yield comparison.'],
      [
        'sovereign',
        'The chosen government reference anchors the reported number.',
      ],
    ],
    ['spreads_public'],
    ['G spread'],
  ],
  [
    'i_spread',
    'I-spread',
    'The general bond-market swap convention',
    'In the general bond-market convention used here, I-spread compares bond yield with an interpolated swap par rate. State the reference family, currency and comparison tenor.',
    'Product and provider labels need their own definitions; the letter alone is not a calculation contract. A swap par rate is also different from a zero rate.',
    [
      ['swap_curve', 'The swap par curve supplies the comparison rate.'],
      ['spread_conventions', 'The scope of the convention must accompany the name.'],
      [
        'z_spread',
        'Z-spread instead fits price using the full projected cash-flow schedule.',
      ],
    ],
    ['interpolated_swap_spread', 'spreads_public'],
    ['I spread', 'interpolated spread'],
  ],
  [
    'asset_swap',
    'Asset-swap spread',
    'A bond and swap viewed as a package',
    'An asset swap combines bond exposure with an interest-rate swap, commonly converting fixed coupons into floating receipts. The asset-swap spread is the margin on the floating leg under the chosen package convention. Bond price, accrued interest and any upfront payment affect the calculation.',
    'Asset-swap spread is generally not bond yield minus swap rate. Par and market asset-swap conventions can produce different reported margins.',
    [
      [
        'i_spread',
        'A package cash-flow calculation differs from subtracting two yields.',
      ],
      [
        'floater',
        'The swap changes the interest-rate cash-flow profile of the package.',
      ],
    ],
    ['spreads_public'],
    ['ASW', 'asset swap spread'],
  ],
  [
    'discount_margin',
    'Discount margin',
    'The margin the market requires',
    'Discount margin is the spread that reconciles a floater’s price with its projected future payments under specified reset and discount assumptions. It is sensitive to price, the reference curve and the instrument’s terms. Optional caps, floors, calls or prepayments require appropriate modeling.',
    'Discount margin is a valuation output. Quoted margin is a coupon term written into the contract; they need not be equal.',
    [
      [
        'quoted_margin',
        'Comparing required and contractual margin helps explain premium or discount pricing.',
      ],
      [
        'spread_duration',
        'Changing the required margin changes price even if benchmark rates stay fixed.',
      ],
    ],
    ['cfa_floating'],
    ['DM', 'discount margin'],
  ],
  [
    'quoted_margin',
    'Quoted margin',
    'The add-on written into the coupon',
    'The quoted margin is the contractual spread over a floater’s reference rate. It may also be called the coupon or fixed margin. Coupon calculations still depend on reset conventions and any caps or floors; the margin itself is not a current market yield.',
    'For a conventional unoptioned floater at a reset date, quoted margin equal to discount margin is consistent with par, all else equal. Between resets or with options, the relationship needs more care.',
    [
      [
        'floater',
        'The reference rate and contractual margin determine the coupon.',
      ],
      [
        'discount_margin',
        'Market-required compensation can diverge from the contract add-on.',
      ],
    ],
    ['cfa_floating'],
    ['QM', 'coupon margin', 'fixed margin'],
  ],
  [
    'swap_spread',
    'Swap spread',
    'Swap rate minus government yield',
    'A swap spread compares a swap fixed rate with a government yield at a comparable maturity in the same currency. It reflects differences between the two markets, including funding, collateral, balance-sheet demand and liquidity conditions.',
    'Swap spread subtracts government yield from swap rate. I-spread subtracts swap rate from bond yield. The words sound similar, but the operands are different.',
    [
      [
        'swap_curve',
        'Swap-market conditions enter the fixed-rate leg of the comparison.',
      ],
      [
        'g_spread',
        'Changing the benchmark changes a bond’s quoted spread even with unchanged bond yield.',
      ],
    ],
    ['nyfed_swap_spreads'],
    ['swap spread'],
  ],
  [
    'spread_duration',
    'Spread duration',
    'Price sensitivity to a spread change',
    'Spread duration measures the local percentage price response to a change in the specified spread while holding the chosen benchmark curve fixed. The definition must state whether projected cash flows and option assumptions change. It complements sensitivity to benchmark rates.',
    'Benchmark duration and spread duration are different shocks. A hedge that offsets one does not necessarily offset the other.',
    [
      [
        'duration',
        'Both measure local sensitivity, but they perturb different valuation inputs.',
      ],
      [
        'basis_risk',
        'A rate hedge can leave spread or relative-market movements unhedged.',
      ],
    ],
    ['spreads_public'],
    ['spread DV01', 'CS01'],
  ],
  [
    'usd_rates',
    'USD · SOFR',
    'Secured overnight dollar funding',
    'SOFR measures overnight cash borrowing collateralized by US Treasury securities. It is a market reference rate, distinct from the Federal Reserve’s policy target range. Compounded overnight SOFR and forward-looking Term SOFR have different observation and timing conventions.',
    'USD swap, government and SOFR curves describe different instruments. Name the curve, not just “the dollar rate.”',
    [
      [
        'term_overnight',
        'Compounding daily observations differs from fixing a rate in advance for a term.',
      ],
      [
        'swap_curve',
        'Dollar swaps reference specified floating-rate conventions.',
      ],
    ],
    ['atlas_sofr', 'benchmark_comparison'],
    ['SOFR', 'USD', 'dollar'],
  ],
  [
    'eur_rates',
    'EUR · €STR & Euribor',
    'Overnight and term references coexist',
    '€STR reflects wholesale unsecured overnight euro borrowing costs of euro-area banks. Euribor is an unsecured term benchmark with designated tenors. These benchmarks coexist and support distinct contracts; neither is simply the ECB’s policy rate.',
    'The euro has one currency but several sovereign issuers. A EUR government spread must identify the reference government or curve construction.',
    [
      [
        'term_overnight',
        '€STR compounding and a Euribor term fixing are different coupon mechanisms.',
      ],
      [
        'sovereign',
        'Bund, OAT and BTP references embed different issuer and liquidity conditions.',
      ],
    ],
    ['estr', 'euribor'],
    ['EUR', 'euro', 'ESTR', '€STR', 'EURIBOR'],
  ],
  [
    'gbp_rates',
    'GBP · SONIA',
    'Unsecured overnight sterling funding',
    'SONIA measures eligible sterling unsecured overnight wholesale transactions. It is administered by the Bank of England and is distinct from Bank Rate. A coupon referencing compounded SONIA accumulates overnight observations over its specified period.',
    'The administrator being a central bank does not make a transaction-based benchmark identical to its policy rate.',
    [
      [
        'term_overnight',
        'A three-month compounded coupon need not use a forward-looking three-month rate.',
      ],
      [
        'currency_denomination',
        'Sterling cash flows retain sterling exposure regardless of issuer location.',
      ],
    ],
    ['sonia'],
    ['GBP', 'SONIA', 'sterling'],
  ],
  [
    'jpy_rates',
    'JPY · TONA',
    'Uncollateralized overnight yen funding',
    'TONA references Japan’s uncollateralized overnight call market. Overnight compounding, forward-looking term references and Japanese Yen TIBOR are distinct conventions. A yen instrument must identify its actual reference and reset terms.',
    'TONA is not SOFR translated into yen: one is unsecured and the other secured. Currency choice alone does not establish identical market or collateral conventions.',
    [
      [
        'term_overnight',
        'An overnight reference and a forward-looking term rate observe different periods.',
      ],
      [
        'cross_currency_basis',
        'Converting a yen funding exposure to another currency can introduce basis.',
      ],
    ],
    ['tona', 'benchmark_comparison'],
    ['JPY', 'TONA', 'TONAR', 'yen'],
  ],
  [
    'chf_rates',
    'CHF · SARON',
    'Secured overnight Swiss-franc funding',
    'SARON is a secured overnight Swiss-franc reference based on the Swiss repo market, using transactions and eligible quotes. Compounded SARON supports longer interest periods. The SNB policy rate is a separate monetary-policy instrument.',
    'SARON and SOFR are both secured overnight references, but their collateral markets and calculation conventions differ.',
    [
      [
        'term_overnight',
        'Daily overnight rates can be compounded into a period return.',
      ],
      [
        'currency_denomination',
        'CHF denomination defines the currency of the promised payments.',
      ],
    ],
    ['saron', 'benchmark_comparison'],
    ['CHF', 'SARON', 'Swiss franc'],
  ],
  [
    'cny_rates',
    'CNY · DR007 & LPR',
    'Money-market and lending references',
    'China’s onshore rate framework includes policy-operation rates, interbank money-market references and loan references. DR007 is a seven-day repo measure for depository institutions; LPR provides one-year and over-five-year loan prime references. They answer different questions.',
    'DR007 is not an overnight rate, and LPR is not a risk-free OIS rate. Offshore CNH and onshore CNY funding also have distinct market conditions.',
    [
      [
        'term_overnight',
        'The maturity and observation window are part of a rate’s definition.',
      ],
      [
        'currency_denomination',
        'Funding location and market conventions matter alongside the currency label.',
      ],
    ],
    ['lpr', 'dr007_public'],
    ['CNY', 'CNH', 'DR007', 'LPR', 'renminbi'],
  ],
  [
    'currency_denomination',
    'Currency of a bond',
    'Cash-flow currency is not issuer nationality',
    'A bond’s denomination identifies the currency of its contractual payments. The issuer’s home country, the investor’s reporting currency and the collateral currency may differ. Valuation needs consistent cash flows and discounting assumptions; conversion to another reporting currency adds a separate step.',
    'A non-US company can issue a USD bond. It still promises dollar cash flows; issuer nationality does not turn those payments into another currency.',
    [
      [
        'discount_factor',
        'Discount factors must match the currency and valuation convention of the cash flows.',
      ],
      [
        'fx_hedging',
        'An investor with a different base currency faces exchange-rate exposure.',
      ],
    ],
    ['bond_families', 'bis_basis'],
    ['denomination', 'base currency', 'foreign currency bond'],
  ],
  [
    'fx_hedging',
    'Currency hedging',
    'Managing the currency mismatch',
    'Forwards and currency swaps can change the exchange-rate exposure of foreign-currency bond cash flows. Hedge tenor, collateral, refinancing and basis all influence the outcome. A nominally higher foreign yield does not establish a higher return after hedging.',
    'Hedging FX does not remove the bond’s credit risk or guarantee its total return. Cash-flow changes can also make the hedge amount imperfect.',
    [
      [
        'cross_currency_basis',
        'The price of currency conversion reflects more than a simple yield difference.',
      ],
      [
        'basis_risk',
        'Hedge maturity or cash-flow mismatches can leave residual exposure.',
      ],
    ],
    ['bis_basis'],
    ['FX hedge', 'hedged yield'],
  ],
  [
    'cross_currency_basis',
    'Cross-currency basis',
    'A price for exchanging funding exposures',
    'Cross-currency basis is a spread adjustment in currency-swap pricing relative to a stated no-basis reference. Hedging demand, balance-sheet capacity and funding conditions can contribute to its size. Its sign depends on which currency leg and quotation convention are used.',
    'Basis is not a spot exchange-rate move. Do not compare signed basis quotes without first naming the adjusted leg and both reference rates.',
    [
      [
        'fx_hedging',
        'Currency basis contributes to the cost of hedging foreign-currency exposure.',
      ],
      [
        'usd_rates',
        'A cross-currency contract must specify the reference on each currency leg.',
      ],
    ],
    ['bis_basis'],
    ['currency basis', 'cross currency swap', 'CIP'],
  ],
  [
    'term_overnight',
    'Term versus compounded overnight',
    'When is the rate actually known?',
    'A forward-looking term rate is set for a future interval. An overnight rate compounded in arrears accumulates observations during the interest period and is fully known only near its end, subject to lookback, lockout or payment-delay conventions. Identical payment frequency does not make them identical rates.',
    '“Three-month” can describe a reset period, a payment period or a forward-looking tenor. Read the contract’s observation rule before comparing numbers.',
    [
      [
        'payment_delay',
        'Observation timing and settlement timing can require different lags.',
      ],
      [
        'floater',
        'The coupon formula must specify both its benchmark and reset convention.',
      ],
    ],
    ['benchmark_comparison', 'atlas_sofr', 'sonia'],
    ['term rate', 'compounded SOFR', 'in arrears', 'OIS'],
  ],
];

const checks: Record<string, [string, string]> = {
  rmbs: [
    'Can a security be residential, agency, pass-through and fixed-rate at the same time?',
    'Yes. These identify collateral, guarantee framework, cash-flow structure and coupon, respectively.',
  ],
  cmbs: [
    'Why can an apartment building belong in CMBS?',
    'The collateral may be one commercial mortgage on a multifamily property, rather than individual household home loans.',
  ],
  i_spread: [
    'Does subtracting a five-year swap par rate from a bond yield produce a Z-spread?',
    'No. That is a one-yield comparison; Z-spread fits the full dated cash-flow schedule against a zero curve.',
  ],
  asset_swap: [
    'Can asset-swap spread be calculated just by subtracting swap yield from bond yield?',
    'Generally no. The bond price, swap package cash flows and any upfront convention matter.',
  ],
  quoted_margin: [
    'If a floater promises its reference plus 150 bp, must its discount margin be 150 bp?',
    'No. The quoted margin is contractual; its price can imply a different required margin.',
  ],
  discount_margin: [
    'Can a floating-rate bond fall in price while its benchmark rate is unchanged?',
    'Yes. The required margin can rise because of credit, liquidity or other market conditions.',
  ],
  home_prices: [
    'Loan balance stays at $300,000 while the property falls from $500,000 to $400,000. What happens to LTV?',
    'It rises from 60% to 75%. The denominator fell while the debt stayed unchanged.',
  ],
  covered_bonds: [
    'Does a pool of home loans automatically make the security a pass-through RMBS?',
    'No. Covered bonds typically retain issuer recourse plus cover-pool protection under their applicable framework.',
  ],
  eur_rates: [
    'Does a EUR bond imply that a German government yield is always its benchmark?',
    'No. The reference issuer or curve construction must be stated; the currency alone is insufficient.',
  ],
  term_overnight: [
    'Is a three-month compounded overnight coupon known three months in advance?',
    'Generally no. In-arrears compounding accumulates daily observations through the period, subject to the specified observation rules.',
  ],
};
export const atlas_concepts: MortgageConcept[] = entries.map(
  ([
    id,
    title,
    subtitle,
    summary,
    distinction,
    links,
    sources,
    aliases = [],
  ]) => {
    const topic = atlas_topics.find((t) => t.concepts.includes(id))!;
    return {
      id,
      title,
      subtitle,
      summary,
      distinction,
      branch: topic.branch,
      topic: topic.id,
      aliases,
      links: links.map(([id, reason]) => ({ id, reason })),
      sources,
      question:
        checks[id]?.[0] ??
        `What is the most important distinction when reading ${title}?`,
      answer: checks[id]?.[1] ?? distinction,
    };
  },
);
export const atlas_relationships: MortgageRelationship[] =
  atlas_concepts.flatMap((c) =>
    c.links.map((link, index) => ({
      id: `atlas_${c.id}_${link.id}`,
      source: c.id,
      target: link.id,
      label:
        (
          {
            rmbs: ['Guarantee matters', 'Early principal'],
            cmbs: ['Deal concentration', 'Property cash flow'],
            clo: ['Coverage triggers', 'Coupon resets'],
            callable: ['Value the option', 'Compare early repayment'],
            discount_margin: ['Required vs contractual', 'Spread sensitivity'],
            i_spread: ['Par-rate reference', 'Convention scope', 'One yield vs all cash flows'],
            fx_hedging: ['Hedging cost', 'Residual mismatch'],
          } as Record<string, string[]>
        )[c.id]?.[index] ??
        (
          {
            agency: 'Guarantee framework',
            g_spread: 'Government benchmark',
            callable: 'Issuer call option',
            prepayments: 'Early principal',
            default: 'Nonpayment exposure',
            subordination: 'Loss attachment',
            waterfall: 'Payment priority',
            abs: 'Collateral family',
            severity: 'Recovery and loss',
            payment_delay: 'Payment timing',
            rmbs: 'Compare recourse',
            corporate: 'Issuer exposure',
            yield: 'Yield conventions',
            spot_curve: 'Dated discounting',
            duration: 'Rate sensitivity',
            sovereign: 'Government reference',
            discount_factor: 'Currency-consistent PV',
            oas: 'Model the option',
            nominal_spread: 'Yield comparison',
            floater: 'Coupon reset rule',
            quoted_margin: 'Contract vs market',
            discount_margin: 'Required margin',
            basis_risk: 'Residual hedge risk',
            term_overnight: 'Observation timing',
            swap_curve: 'Swap benchmark',
            currency_denomination: 'Cash-flow currency',
            cross_currency_basis: 'Currency funding basis',
            usd_rates: 'Dollar reference',
            fx_hedging: 'Currency conversion',
            ois: 'Overnight swap leg',
            par_curve: 'Par vs zero',
            servicing: 'Collections and fees',
            ltv: 'Collateral value',
            amortization: 'Balance dynamics',
            i_spread: 'Package vs yield',
            z_spread: 'Price from all cash flows',
            spread_duration: 'Spread sensitivity',
          } as Record<string, string>
        )[link.id] ??
        'Read the connection',
      reason: link.reason,
      kind: [
        'rmbs',
        'cmbs',
        'clo',
        'crt',
        'auto_abs',
        'card_abs',
        'fx_hedging',
      ].includes(c.id)
        ? 'mechanism'
        : 'comparison',
    })),
  );

export type ComparisonSet = {
  id: string;
  title: string;
  eyebrow: string;
  intro: string;
  takeaway: string;
  columns: string[];
  rows: { id: string; cells: string[] }[];
};
export const atlas_comparisons: ComparisonSet[] = [
  {
    id: 'spreads',
    title: 'Same word. Different measurements.',
    eyebrow: '01 / COMPARE SPREADS',
    intro:
      'Separate the benchmark from the method: government or swap is a reference choice; yield subtraction, cash-flow discounting and option modeling are different calculations. Most rate spreads are quoted in basis points. Excess spread is deal income under a separate convention.',
    takeaway:
      'A larger number is not automatically better compensation. Change the benchmark or model and the reported spread can change without a change in the bond.',
    columns: [
      'Measure',
      'Reference',
      'Cash flows & options',
      'Best used to ask',
      'Keep in mind',
    ],
    rows: [
      {
        id: 'credit_spread',
        cells: ['Credit spread', 'A stated lower-risk benchmark', 'An umbrella description; specify the calculation', 'What compensation accompanies this credit exposure?', 'Can include loss risk, liquidity and other effects; not a default probability.'],
      },
      {
        id: 'nominal_spread',
        cells: ['Nominal spread', 'One stated benchmark yield', 'Subtract two yields with aligned conventions', 'How far apart are these quoted yields?', 'The benchmark, tenor and yield conventions must be named.'],
      },
      {
        id: 'g_spread',
        cells: [
          'G-spread',
          'Government yield at a stated tenor',
          'One yield comparison; no option adjustment',
          'How much above this government reference?',
          'Name the sovereign and interpolation rule.',
        ],
      },
      {
        id: 'i_spread',
        cells: [
          'I-spread',
          'Interpolated swap par rate in the general bond-market convention',
          'One yield comparison; no option adjustment',
          'How much above this swap reference?',
          'Check product/provider definitions; a shared letter is not a shared method.',
        ],
      },
      {
        id: 'z_spread',
        cells: [
          'Z-spread',
          'A specified zero curve',
          'All projected dated cash flows; fixed scenario',
          'What constant spread makes the projected cash flows fit the dirty price?',
          'An assumed prepayment path is not option adjustment.',
        ],
      },
      {
        id: 'oas',
        cells: [
          'OAS',
          'A specified curve and option model',
          'Path-dependent cash flows and modeled exercise',
          'What spread remains after modeling the option?',
          'Model-dependent; not pure credit compensation.',
        ],
      },
      {
        id: 'asset_swap',
        cells: [
          'Asset-swap spread',
          'Floating leg of a bond + swap package',
          'Package cash flows and price/upfront convention',
          'What floating margin does this package produce?',
          'Not generally yield minus swap rate.',
        ],
      },
      {
        id: 'discount_margin',
        cells: [
          'Discount margin',
          'Floater reference/discount assumptions',
          'Projected resets; options need explicit treatment',
          'What margin is required to match the floater’s price?',
          'A market-required valuation margin.',
        ],
      },
      {
        id: 'quoted_margin',
        cells: [
          'Quoted margin',
          'Contractual coupon benchmark',
          'The coupon add-on specified in the contract',
          'What does this floater promise over its index?',
          'A contract term, not a price-implied spread.',
        ],
      },
      {
        id: 'swap_spread',
        cells: [
          'Swap spread',
          'Swap fixed rate minus government yield',
          'A comparison between reference markets',
          'How do swap and government rates differ?',
          'Different operands from I-spread.',
        ],
      },
      {
        id: 'cross_currency_basis',
        cells: [
          'Cross-currency basis',
          'Two currency legs and a quotation convention',
          'Currency-swap exchange and funding terms',
          'What is the adjustment for swapping funding currencies?',
          'Sign depends on the quoted leg.',
        ],
      },
      {
        id: 'cds_spread',
        cells: ['CDS spread', 'Specified credit protection contract', 'Premium and contingent protection legs', 'What does protection against these credit events cost?', 'Check reference entity, maturity, seniority and quote convention.'],
      },
      {
        id: 'cds_bond_basis',
        cells: ['CDS–bond basis', 'CDS spread minus comparable bond spread', 'Related exposures in derivative and cash markets', 'How differently do the two markets price credit?', 'Funding, liquidity and contractual mismatches can sustain the gap.'],
      },
      {
        id: 'primary_secondary_spread',
        cells: ['Primary–secondary spread', 'Borrower mortgage rate minus a representative new-production MBS yield', 'A comparison along the mortgage production chain', 'How far apart are borrower and secondary-market rates?', 'Includes costs and margins; not pure lender profit or MBS OAS.'],
      },
      {
        id: 'excess_spread',
        cells: ['Excess spread', 'Deal income less specified costs and losses', 'Period income; a ratio needs a balance and time convention', 'What income remains under the deal’s waterfall?', 'A structural income measure, not a benchmark valuation spread.'],
      },
    ],
  },
  {
    id: 'products',
    title: 'Classify the collateral. Then read the contract.',
    eyebrow: '02 / PRODUCT FAMILIES',
    intro:
      'Collateral, guarantee, payment structure and coupon are separate axes. An agency residential pass-through with a fixed coupon describes four different properties of one security.',
    takeaway:
      'RMBS and CMBS describe mortgage collateral. Agency describes a guarantee framework. CMO describes a structure. Fixed or floating describes a coupon. These labels can coexist.',
    columns: [
      'Family',
      'Repayment source',
      'Protection / structure',
      'Main questions',
      'Read alongside',
    ],
    rows: [
      {
        id: 'rmbs',
        cells: [
          'RMBS',
          'Residential mortgage payments',
          'Agency or private-label; pass-through or tranched',
          'Prepayment, guarantee, borrower credit',
          'CPR · WAL · OAS',
        ],
      },
      {
        id: 'cmbs',
        cells: [
          'CMBS',
          'Commercial mortgage payments',
          'Conduit / SASB; tranched priorities',
          'NOI, refinancing, concentration, loss recovery',
          'DSCR · LTV · waterfall',
        ],
      },
      {
        id: 'abs',
        cells: [
          'Consumer & other ABS',
          'Auto, card, student and other receivables',
          'Amortizing or revolving; transaction-specific support',
          'Payment rates, defaults, servicing, triggers',
          'Severity · coverage tests',
        ],
      },
      {
        id: 'clo',
        cells: [
          'Corporate CLO',
          'Leveraged corporate loans',
          'Managed pool; reinvestment and coverage tests',
          'Corporate defaults, recovery, manager, tranche',
          'OC / IC · discount margin',
        ],
      },
      {
        id: 'crt',
        cells: [
          'Mortgage CRT',
          'Exposure tied to a reference mortgage pool',
          'Specified credit-loss layer',
          'Attachment, detachment, pool losses',
          'Default · subordination',
        ],
      },
      {
        id: 'covered_bonds',
        cells: [
          'Covered bonds',
          'Issuer obligation with a cover pool',
          'Dual recourse under an applicable framework',
          'Issuer strength and cover-asset quality',
          'RMBS · corporate credit',
        ],
      },
      {
        id: 'sovereign',
        cells: [
          'Sovereign',
          'National-government obligation',
          'Currency and legal terms vary',
          'Sovereign credit, rates, liquidity, FX',
          'G-spread · denomination',
        ],
      },
      {
        id: 'corporate',
        cells: [
          'Corporate',
          'Company obligation',
          'Secured/unsecured; senior/subordinated',
          'Issuer credit, covenants, calls, liquidity',
          'I-spread · OAS · default',
        ],
      },
      {
        id: 'municipal',
        cells: [
          'Municipal',
          'Public-entity pledge or project revenue',
          'General obligation or revenue-backed',
          'Repayment pledge and tax treatment',
          'Yield conventions · credit',
        ],
      },
    ],
  },
  {
    id: 'currencies',
    title: 'The currency is only the first question.',
    eyebrow: '03 / BENCHMARK FAMILIES',
    intro:
      'Policy rates, transaction-based overnight rates and term lending references serve different purposes. These are benchmark definitions, not live rates.',
    takeaway:
      'Match the cash-flow currency, reference index, observation period and discounting convention. Issuer nationality and the investor’s base currency are separate facts.',
    columns: [
      'Currency',
      'Policy context',
      'Market reference',
      'Term / coupon convention',
      'Distinction',
    ],
    rows: [
      {
        id: 'usd_rates',
        cells: [
          'USD',
          'Federal Reserve policy target range',
          'SOFR · secured overnight',
          'Compounded SOFR or specified Term SOFR',
          'Treasury yield, SOFR and a swap par rate differ.',
        ],
      },
      {
        id: 'eur_rates',
        cells: [
          'EUR',
          'ECB policy rates',
          '€STR · unsecured overnight',
          'Compounded €STR; Euribor term fixings also coexist',
          'EUR has several sovereign references.',
        ],
      },
      {
        id: 'gbp_rates',
        cells: [
          'GBP',
          'Bank of England Bank Rate',
          'SONIA · unsecured overnight',
          'Compounded SONIA under specified observation rules',
          'Payment period is not automatically a term fixing.',
        ],
      },
      {
        id: 'jpy_rates',
        cells: [
          'JPY',
          'Bank of Japan policy framework',
          'TONA · uncollateralized overnight',
          'Overnight compounding; other term benchmarks are distinct',
          'Read the actual yen reference, not just its currency.',
        ],
      },
      {
        id: 'chf_rates',
        cells: [
          'CHF',
          'SNB policy rate',
          'SARON · secured overnight repo',
          'Compounded SARON',
          'Secured does not mean the same methodology as SOFR.',
        ],
      },
      {
        id: 'cny_rates',
        cells: [
          'CNY',
          'PBOC policy-operation framework',
          'DR007 · seven-day depository repo',
          'LPR · one-year and over-five-year loan references',
          'LPR is not OIS; CNY and CNH funding differ.',
        ],
      },
    ],
  },
  {
    id: 'maturities',
    title: 'Five different meanings of “how long.”',
    eyebrow: '04 / TIME & MATURITY',
    intro:
      'A bond can have a long final maturity, an early expected return of principal and a much shorter rate duration. The label only helps when you know what is being measured.',
    takeaway:
      'Original maturity starts at issuance. Remaining maturity starts today. A nominal tenor is a label. WAL weights principal repayment; duration describes timing or sensitivity under its specific definition.',
    columns: [
      'Measure',
      'What it measures',
      'What it uses',
      'Can it change?',
      'Keep in mind',
    ],
    rows: [
      {
        id: 'final_maturity',
        cells: [
          'Final / remaining maturity',
          'The contractual final repayment date; time left to that date',
          'Contract date and measurement date',
          'Remaining time falls as the calendar advances',
          'Original maturity was measured from issuance.',
        ],
      },
      {
        id: 'tenor',
        cells: [
          'Nominal tenor',
          'A named interval such as 6M, 2Y or 30Y',
          'Market or instrument convention',
          'A benchmark security ages within its quoted role',
          'Actual remaining time need not equal the label exactly.',
        ],
      },
      {
        id: 'wam',
        cells: [
          'WAM',
          'Balance-weighted remaining loan maturity',
          'Current balances and contractual remaining terms',
          'Amortization, payoffs and seasoning change the weights',
          'It does not forecast early principal repayment.',
        ],
      },
      {
        id: 'wal',
        cells: [
          'WAL',
          'Principal-weighted expected repayment time',
          'Projected principal cash flows',
          'Prepayment and default assumptions can change it',
          'Interest payments are not the weights.',
        ],
      },
      {
        id: 'duration',
        cells: [
          'Effective duration',
          'Local price response to a benchmark-rate shock',
          'Modeled prices with consistently re-estimated cash flows',
          'It changes with rates, optionality and assumptions',
          'It is not a contractual date or a substitute for WAL.',
        ],
      },
    ],
  },
];

atlas_comparisons.push(...context_comparisons, ...analytics_comparisons);

export const atlas_paths = [
  {
    id: 'product_to_option',
    title: 'A home loan, a bond, an option',
    description:
      'Connect residential collateral to early repayment, effective duration and hedging.',
    steps: ['rmbs', 'prepayments', 'duration', 'dv01', 'hedging'],
  },
  {
    id: 'commercial_to_credit',
    title: 'From a building to a credit loss',
    description:
      'Follow commercial income through coverage and refinancing pressure.',
    steps: ['cmbs', 'noi', 'dscr', 'refinance_risk', 'default'],
  },
  {
    id: 'floating_credit',
    title: 'A floating coupon still has risk',
    description:
      'Read a CLO coupon, distinguish contractual and required margins, then trace spread sensitivity.',
    steps: [
      'clo',
      'floater',
      'quoted_margin',
      'discount_margin',
      'spread_duration',
      'basis_risk',
    ],
  },
  {
    id: 'currency_to_price',
    title: 'A dollar bond in a foreign portfolio',
    description:
      'Separate cash-flow currency, FX hedging, currency basis and the reference rate.',
    steps: [
      'currency_denomination',
      'fx_hedging',
      'cross_currency_basis',
      'usd_rates',
      'term_overnight',
      'floater',
    ],
  },
];
