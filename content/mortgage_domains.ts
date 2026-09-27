// Lightweight navigation shared by the homepage and concept catalog.
export const mortgage_domains = [
  {
    id: 'basics',
    title: 'Loans & pools',
    question: 'What is actually being financed?',
    number: '01',
    entry: 'amortization',
  },
  {
    id: 'prepayment',
    title: 'Prepayment',
    question: 'Why does principal come back early?',
    number: '02',
    entry: 'prepayments',
  },
  {
    id: 'trading',
    title: 'Markets & trading',
    question: 'What changes hands, and at what price?',
    number: '03',
    entry: 'tba',
  },
  {
    id: 'valuation',
    title: 'Cash flows & value',
    question: 'How does future money become today’s value?',
    number: '04',
    entry: 'pv',
  },
  {
    id: 'curves',
    title: 'Curves & spreads',
    question: 'Which rate, which curve, which comparison?',
    number: '05',
    entry: 'spreads',
  },
  {
    id: 'risk',
    title: 'Risk & hedging',
    question: 'What changes when the world changes?',
    number: '06',
    entry: 'duration',
  },
  {
    id: 'structure',
    title: 'CMO & structures',
    question: 'Who receives the cash, and who absorbs the change?',
    number: '07',
    entry: 'waterfall',
  },
  {
    id: 'credit',
    title: 'Credit & property',
    question: 'Can the underlying borrower repay?',
    number: '08',
    entry: 'default',
  },
  {
    id: 'products',
    title: 'Product families',
    question: 'What backs the promise to pay?',
    number: '09',
    entry: 'rmbs',
  },
  {
    id: 'currencies',
    title: 'Currencies & benchmarks',
    question: 'Which money, which reference rate?',
    number: '10',
    entry: 'currency_denomination',
  },
];

export const mortgage_preview_path = [
  {
    id: 'prepayments',
    title: 'Prepayment',
    detail: 'Changes when principal returns',
  },
  {
    id: 'cash_flows',
    title: 'Cash flows',
    detail: 'Changes what is discounted',
  },
  { id: 'oas', title: 'Value & risk', detail: 'Depends on the option model' },
];
