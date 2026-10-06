// Choices for the existing authored questions in mortgage_concepts.
// Explanations remain alongside their questions and public sources.
import { convention_checks } from './mortgage_conventions.ts';
export const learning_checks: Record<
  string,
  { choices: [string, string, string]; correct: number }
> = {
  accrual_discount_clocks: {
    choices: [
      'Yes. The discount curve replaces the coupon’s contractual day count.',
      'No. Keep the coupon’s accrual rule and the curve’s discounting convention separate.',
      'Yes. All date fractions in a valuation must share one denominator.',
    ],
    correct: 1,
  },
  actual_actual_variants: {
    choices: [
      'Yes. Actual days always use a fixed denominator of 365.',
      'Yes. Every Actual/Actual variant treats coupon stubs identically.',
      'No. Identify the variant and any required coupon schedule, frequency and stub rules.',
    ],
    correct: 2,
  },
  convention_resolution: {
    choices: [
      'Yes. Any convention with a 360 denominator is equivalent.',
      'No. Reject the input or explicitly disclose and justify the applied alternative.',
      'Yes. A recognizable input label guarantees an unchanged result.',
    ],
    correct: 1,
  },
  curve_roles: {
    choices: [
      'Yes. One curve fixes all rate-path probabilities and prepayments.',
      'Yes. A common starting curve eliminates the need to specify volatility.',
      'No. Dynamics, volatility, prepayments, spread application and conventions remain necessary.',
    ],
    correct: 2,
  },
  settlement_cashflow_dates: {
    choices: [
      'No. Accrual dates determine interest; the payment date determines receipt and discounting.',
      'Yes. Every extra day before distribution earns another day of coupon interest.',
      'Yes. The buyer always receives the next calendar month’s payment.',
    ],
    correct: 0,
  },
  path_cashflows: {
    choices: [
      'The final rate uniquely determines every earlier principal payment.',
      'Earlier refinancing and prepayments can leave different surviving balances and borrowers.',
      'Scheduled interest reduces the principal balance on every path.',
    ],
    correct: 1,
  },
  pathwise_valuation: {
    choices: [
      'Whenever enough paths are simulated, regardless of dependence.',
      'Whenever both averages use the same currency and payment date.',
      'When covariance is zero at each payment, or its contributions cancel in the total.',
    ],
    correct: 2,
  },
  zero_volatility_case: {
    choices: [
      'No. Cash flows, discount factors, spread convention, dates and price basis must also match.',
      'Yes. Zero volatility means there can be no mortgage prepayments.',
      'Yes. Setting rate volatility to zero also removes every valuation spread.',
    ],
    correct: 0,
  },
  ...convention_checks,
  loan_states: {
    choices: [
      'The final loss is fixed once a loan is 60 days delinquent.',
      'The loan may cure or enter a workout; final loss and recovery timing remain uncertain.',
      'Every delinquent loan immediately returns its full principal.',
    ],
    correct: 1,
  },
  historical_speeds: {
    choices: [
      'No. An annualized rate can describe a shorter observation window.',
      'Yes. CPR is measured only over the preceding twelve months.',
      'Yes. The percentage identifies the length of the observation window.',
    ],
    correct: 0,
  },
  absolute_prepayment_rate: {
    choices: [
      'Yes. In a prepayment field, ABS names the security type.',
      'No. ABS can also name a prepayment-speed convention.',
      'No. In a prepayment field, ABS means the loan balance in dollars.',
    ],
    correct: 1,
  },
  monthly_payment_rate: {
    choices: [
      'Yes. Both percentages measure the same payments on the same basis.',
      'Yes. Multiplying MPR by twelve resolves every difference.',
      'No. Payment coverage, balance base and time units differ.',
    ],
    correct: 2,
  },
  conditional_default_rate: {
    choices: [
      'No. Severity, recovery timing and the measured population also matter.',
      'Yes. CDR directly measures principal losses after recoveries.',
      'No. It means 5% of principal is recovered rather than defaulted.',
    ],
    correct: 0,
  },
  scenario_analysis: {
    choices: [
      'A new price, while still claiming the price is fixed.',
      'The yield implied by the revised cash flows and unchanged price.',
      'The original contractual mortgage rate.',
    ],
    correct: 1,
  },
  assumption_vector: {
    choices: [
      'Yes. Three numerical entries fully define the assumption.',
      'No. Adding the entries gives the single rate needed for projection.',
      'No. Units, dates and application rules are needed.',
    ],
    correct: 2,
  },
  projection_anchor: {
    choices: [
      'Yes. A different anchor or initial collateral state can shift cash flows.',
      'No. The vector alone fixes the payment dates and starting balance.',
      'Yes. Changing the display format changes the projected payment dates.',
    ],
    correct: 0,
  },
  collateral_stratification: {
    choices: [
      'Yes. Each loan can be treated as having every pool-average characteristic.',
      'No. Loan distributions and group composition can matter.',
      'No. The pool average describes only the largest constituent loan.',
    ],
    correct: 1,
  },
  re_underwriting: {
    choices: [
      'Yes. The contractual coupon falls in proportion to assumed NOI.',
      'Yes. Re-underwriting replaces the note rate with the revised NOI estimate.',
      'No. It changes assessed repayment capacity unless a separate contract mechanism applies.',
    ],
    correct: 2,
  },
  collateral_tranche_cashflows: {
    choices: [
      'No. Different principal priorities can produce different WALs.',
      'Yes. The common pool fixes an identical principal schedule for each class.',
      'Yes. Class coupon differences cannot alter the common pool WAL.',
    ],
    correct: 0,
  },
  defeasance: {
    choices: [
      'Yes. Releasing the property necessarily extinguishes the debt.',
      'No. Permitted collateral substitution can leave the debt outstanding.',
      'No. A property release converts the unpaid debt into realized principal loss.',
    ],
    correct: 1,
  },
  short_rate_model: {
    choices: [
      'Yes. The numerical method uniquely determines the rate dynamics.',
      'Yes. Matching numerical methods ensures identical exercise assumptions.',
      'No. Dynamics and exercise assumptions can differ despite the same method.',
    ],
    correct: 2,
  },
  volatility_conventions: {
    choices: [
      'No. Convention, underlying, units and expiry must also match.',
      'Yes. A matching numerical volatility quote gives a matching option value.',
      'No. Matching option values requires matching the quote date alone.',
    ],
    correct: 0,
  },
  model_calibration: {
    choices: [
      'Yes. One matched price validates the model across risk scenarios.',
      'No. Other prices and sensitivities may still depend on model choices.',
      'Yes. Matching today’s price fixes tomorrow’s duration independently of the model.',
    ],
    correct: 1,
  },
  effective_convexity: {
    choices: [
      'Yes. Positive curvature compares P₋ + P₊ with 2P₀; P₊ can still be below P₀.',
      'No. Positive effective convexity requires both shocked prices to exceed the base price.',
      'No. A low CPR or weak refinancing incentive by itself fixes the convexity sign.',
    ],
    correct: 0,
  },
  spread_conventions: {
    choices: [
      'No. First establish each benchmark and calculation method.',
      'Yes. The field name establishes a common benchmark.',
      'Yes. Converting both quotes to basis points makes their definitions equivalent.',
    ],
    correct: 0,
  },
  policy_expectations: {
    choices: [
      'No. Long yields must fall by the amount of the policy cut.',
      'Yes. The expected rate path or term premium can rise despite the cut.',
      'No. Long yields depend only on today’s policy setting.',
    ],
    correct: 1,
  },
  real_yield: {
    choices: [
      'Yes. Subtracting current CPI identifies the traded real yield of any mortgage.',
      'Yes. The mortgage coupon and current CPI share the same forward horizon.',
      'No. That combines a contract rate with backward-looking inflation over a different horizon.',
    ],
    correct: 2,
  },
  breakeven_inflation: {
    choices: [
      'No. Inflation-risk and liquidity compensation also affect breakevens.',
      'Yes. Breakevens isolate expected inflation without other compensation.',
      'No. A 250 bp breakeven is the nominal bond’s contractual coupon.',
    ],
    correct: 0,
  },
  curve_slope: {
    choices: [
      'No. Steepening requires the 10Y yield itself to rise.',
      'Yes. A lower short-end yield widens the long-minus-short spread.',
      'Yes. A higher short-end yield widens that spread when the 10Y is unchanged.',
    ],
    correct: 1,
  },
  curve_curvature: {
    choices: [
      'Yes. The yield coefficients directly specify equal-dollar hedge notionals.',
      'Yes. The statistic already adjusts each maturity for its DV01.',
      'No. Hedge notionals also require DV01 and risk-weighting conventions.',
    ],
    correct: 2,
  },
  bootstrapping: {
    choices: [
      'No. A spot-curve valuation assigns a dated discount factor to each payment.',
      'Yes. The five-year par yield is the spot rate for every earlier payment.',
      'No. A spot-curve valuation discounts principal but leaves coupons undiscounted.',
    ],
    correct: 0,
  },
  dual_curve: {
    choices: [
      'Yes. The chosen discount curve replaces the index specified in the loan.',
      'No. Discounting and the contractual reset index are separate.',
      'Yes. Changing the discount curve resets the floater’s contractual margin.',
    ],
    correct: 1,
  },
  futures_convexity: {
    choices: [
      'Yes. Both arise from borrowers exercising mortgage prepayment rights.',
      'Yes. Both describe a change in a mortgage pool’s principal-payment schedule.',
      'No. Settlement and financing differ from rate-dependent mortgage cash flows.',
    ],
    correct: 2,
  },
  interest_rate_swap: {
    choices: [
      'Pay fixed, with the hedge sized to comparable sensitivities.',
      'Receive fixed, with the hedge sized to comparable sensitivities.',
      'Pay fixed in a notional equal to face value, regardless of sensitivities.',
    ],
    correct: 0,
  },
  swaption: {
    choices: [
      'An option makes the MBS principal schedule independent of refinancing.',
      'Options can offset some of the MBS duration change as rates and prepayments change.',
      'A swap already removes all nonlinearity, so the option only changes credit exposure.',
    ],
    correct: 1,
  },
  option_moneyness: {
    choices: [
      'Yes. Positive refinancing value triggers immediate contractual prepayment.',
      'No. An in-the-money refinancing opportunity means refinancing would cost more.',
      'No. Costs, underwriting, capacity and borrower choices can delay refinancing.',
    ],
    correct: 2,
  },
  volatility_surface: {
    choices: [
      'No. Other expiries, tenors and strikes may still be misfit.',
      'Yes. One ATM quote determines the full volatility surface.',
      'Yes. Matching a swaption also validates mortgage borrower exercise behavior.',
    ],
    correct: 0,
  },
  reset_payment_dates: {
    choices: [
      'Yes. Payment month and reference-rate observation month necessarily coincide.',
      'No. The fixing window, reset convention and accrual dates determine the rate.',
      'No. Every floating coupon uses the reference rate from the loan’s origination date.',
    ],
    correct: 1,
  },
  observation_conventions: {
    choices: [
      'Yes. Moving observations leaves day weights and compounded interest unchanged.',
      'No. One convention changes the loan from floating rate to fixed rate.',
      'Not necessarily. Different day weights can change compounded interest.',
    ],
    correct: 2,
  },
  treasury_delivery: {
    choices: [
      'Mortgage exposure, the CTD and relative financing can change the hedge ratio.',
      'A similar headline yield guarantees the original hedge ratio still applies.',
      'The futures contract’s face amount fixes the mortgage hedge ratio through time.',
    ],
    correct: 0,
  },
  repo_specialness: {
    choices: [
      'No. Similar duration fixes identical repo terms.',
      'Yes. Demand for specific collateral can make one security trade special.',
      'Yes. Repo specialness is determined solely by the security’s stated coupon.',
    ],
    correct: 1,
  },
  conforming_jumbo: {
    choices: [
      'Yes. Any balance below the limit establishes an agency guarantee.',
      'No. A below-limit balance makes the security ineligible for an agency guarantee.',
      'No. Check loan eligibility and the security’s actual guarantee separately.',
    ],
    correct: 2,
  },
  prime_jumbo: {
    choices: [
      'Yes. Jumbo size and QM status describe different criteria.',
      'No. Exceeding the conforming size limit automatically rules out QM status.',
      'Yes. The prime label itself proves that all QM criteria are satisfied.',
    ],
    correct: 0,
  },
  investor_mortgages: {
    choices: [
      'Yes. Any investor-owned property belongs in commercial mortgage collateral.',
      'No. Residential rental-property loans can back RMBS.',
      'No. Investor RMBS refers only to loans on borrowers’ primary residences.',
    ],
    correct: 1,
  },
  non_qm: {
    choices: [
      'Yes. Non-QM status exempts a covered consumer loan from repayment assessment.',
      'No. Non-QM means the lender has already proved that the borrower cannot repay.',
      'No. QM status and the ability-to-repay requirement are distinct.',
    ],
    correct: 2,
  },
  second_lien: {
    choices: [
      'Cash-out refinancing became more attractive, shifting product demand.',
      'Every second-lien borrower became less creditworthy.',
      'Every homeowner lost equity when mortgage rates fell.',
    ],
    correct: 0,
  },
  heloc: {
    choices: [
      'Yes. Every repayment permanently cancels the corresponding credit commitment.',
      'No. Available credit may be drawn again under the agreement.',
      'No. A HELOC repayment increases the drawn loan balance by the same amount.',
    ],
    correct: 1,
  },
  cltv: {
    choices: [
      'Yes. First-lien LTV includes every lien and credit-line commitment.',
      'No. First-lien LTV measures the first lien as a share of total debt.',
      'Only if there are no additional included liens; also consider credit-line commitments.',
    ],
    correct: 2,
  },
  credit_score_models: {
    choices: [
      'Model versions, comparable borrowers and observed repayment outcomes.',
      'Only whether the new average score is numerically larger.',
      'Only the name of the lender that reported the score.',
    ],
    correct: 0,
  },
  cre_clo: {
    choices: [
      'Yes. Resetting note coupons removes rate risk from the underlying borrowers.',
      'No. Higher rates can weaken borrower debt service and refinancing capacity.',
      'Yes. Floating coupons keep borrower debt-service costs fixed when rates rise.',
    ],
    correct: 1,
  },
  special_servicing: {
    choices: [
      'Yes. The special-servicing rate measures principal already lost after recovery.',
      'No. It measures only the servicing fee charged on performing loans.',
      'No. It identifies a workout population, whose recoveries and timing remain uncertain.',
    ],
    correct: 2,
  },
  servicing_advances: {
    choices: [
      'No. Servicing advances can bridge a borrower collection shortfall.',
      'Yes. Certificates can receive cash only after each borrower has paid.',
      'No. Timely certificate payments establish that borrower shortfalls are permanent losses.',
    ],
    correct: 0,
  },
  appraisal_reduction: {
    choices: [
      'No. Certificate interest cannot change until a loan loss is formally realized.',
      'Yes. Appraisal-based advancing rules may affect distributions before loss realization.',
      'Yes. An appraisal reduction automatically raises the loan’s contractual interest rate.',
    ],
    correct: 1,
  },
  loan_modification: {
    choices: [
      'Yes. A later maturity necessarily increases discounted value.',
      'No. Present value depends only on whether the stated principal balance changes.',
      'No. Receipt timing, interest, costs and recovery probability all matter.',
    ],
    correct: 2,
  },
  extension_options: {
    choices: [
      'No. Specify which conditions are satisfied and test failure cases.',
      'Yes. An available extension should be included even if its conditions fail.',
      'No. Contractual extension options should be excluded from every cash-flow scenario.',
    ],
    correct: 0,
  },
  msr: {
    choices: [
      'Refinancing raises the unpaid balance on which future servicing fees are earned.',
      'Prepaid loans stop generating future servicing fees while costs may already be incurred.',
      'Servicing fees continue after payoff, but the mortgage coupon falls to zero.',
    ],
    correct: 1,
  },
  guarantee_fee: {
    choices: [
      'Yes. The fee guarantees a constant market price as rates change.',
      'Yes. Paying the fee prevents rising rates from changing expected principal timing.',
      'No. Credit payment protection is separate from market-value risk.',
    ],
    correct: 2,
  },
  deal_lifecycle: {
    choices: [
      'No. First align deal stage, cutoff, currency, products and refinancing treatment.',
      'Yes. Marketing and pricing are interchangeable stages for year-to-date totals.',
      'Yes. Matching currency alone makes marketing and priced totals additive.',
    ],
    correct: 0,
  },
  reg_ab: {
    choices: [
      'Yes. A reform proposal changes every covered deal’s obligations on announcement.',
      'No. Check the rule’s stage, effective implementation and transaction coverage.',
      'Yes. Regulatory discussion and effective implementation have the same legal status.',
    ],
    correct: 1,
  },
  risk_retention: {
    choices: [
      'Yes. Retained risk guarantees full principal repayment to senior investors.',
      'No. Risk retention removes the originator’s exposure to the deal’s losses.',
      'No. Incentive alignment is distinct from a guarantee or sufficient protection.',
    ],
    correct: 2,
  },
  trid: {
    choices: [
      'No. Borrower transaction disclosure and investor security disclosure have different purposes.',
      'Yes. A Closing Disclosure contains the complete risk profile of the securitized pool.',
      'No. A Closing Disclosure is a security-level report intended only for RMBS investors.',
    ],
    correct: 0,
  },
  as_of: {
    choices: [
      'Yes. The publication date is necessarily the transaction date of the rate.',
      'No. Overnight SOFR published today refers to the preceding business day’s transactions.',
      'No. Overnight SOFR is published before the transactions it measures occur.',
    ],
    correct: 1,
  },
  trade_date: {
    choices: [
      'No. A common execution date requires a common settlement date.',
      'Yes. Settlement date is determined by the coupon rate rather than agreed terms.',
      'Yes. Instruments, terms, transaction types and calendars can imply different settlement dates.',
    ],
    correct: 2,
  },
  original_maturity: {
    choices: [
      'No. WAL depends on the principal schedule and prepayment assumptions.',
      'Yes. Remaining term and WAL are two names for the same measure.',
      'No. WAL depends only on coupon timing, without using principal payments.',
    ],
    correct: 0,
  },
  quote_context: {
    choices: [
      'Yes. Two matching prices establish an executable offer.',
      'No. A completed trade and a valuation estimate do not establish a current offer.',
      'Yes. An evaluated price obliges a dealer to sell at that level.',
    ],
    correct: 1,
  },
  curve_nodes: {
    choices: [
      'Yes. Rounding remaining maturity is enough to make it a constant-maturity estimate.',
      'Yes. Any bond near 20 years represents the same dated 20Y curve node.',
      'Only if an explicit benchmark or estimation convention supports the 20Y label.',
    ],
    correct: 2,
  },
  constant_maturity: {
    choices: [
      'A provider can evaluate a fitted curve at the ten-year horizon.',
      'The reference must be the yield of a bond maturing exactly ten years from today.',
      'The provider obtains it by renaming the nearest raw bond yield without a convention.',
    ],
    correct: 0,
  },
  curve_interpolation: {
    choices: [
      'Yes. The closest maturity is valid even without a usable yield.',
      'No. Validate the node and explicitly define and label any fallback method.',
      'Yes. Maturity proximity establishes both data validity and the fitting method.',
    ],
    correct: 1,
  },
  term_sofr: {
    choices: [
      'Yes. A three-month payment period determines the contractual reference index.',
      'No. A three-month coupon necessarily uses a single overnight rate from payment day.',
      'No. The contract may instead specify compounded overnight SOFR.',
    ],
    correct: 2,
  },
  futures_curve: {
    choices: [
      'The contract’s reference quarter may differ from six months measured from the chosen anchor.',
      'The next contract always covers exactly six months from the table’s valuation date.',
      'A rounded 6M label preserves the exact contract accrual dates without further information.',
    ],
    correct: 0,
  },
  treasury_strips: {
    choices: [
      'Yes. Separating payments moves every coupon to the original final maturity.',
      'No. Each coupon STRIP matures on its coupon date; principal has its own repayment date.',
      'No. All coupon STRIPS mature when the first coupon is due.',
    ],
    correct: 1,
  },
  affordability: {
    choices: [
      'Yes. A lower mortgage rate by itself guarantees a lower total purchase cost.',
      'Yes. The home price must fall in proportion to the mortgage rate.',
      'No. Purchase price, borrowing amount and other housing costs may also change.',
    ],
    correct: 2,
  },
  dti: {
    choices: [
      'Yes. Monthly debt payments can be high relative to even a high income.',
      'No. High income by itself establishes a low DTI.',
      'Yes. DTI compares the property value with annual income.',
    ],
    correct: 0,
  },
  refinance_eligibility: {
    choices: [
      'Yes. Economic incentive establishes both qualification and completed refinancing.',
      'No. Qualification, costs, time and borrower choices can prevent refinancing.',
      'No. Refinancing eligibility depends only on the loan’s current coupon.',
    ],
    correct: 1,
  },
  assumability: {
    choices: [
      'Yes. A sale must extinguish the existing loan even if assumption is permitted.',
      'No. Every buyer automatically takes over the seller’s existing mortgage.',
      'Often, but a permitted and completed assumption can preserve the loan.',
    ],
    correct: 2,
  },
  primary_secondary_spread: {
    choices: [
      'Not necessarily. The gap between primary rates and secondary yields can change.',
      'Yes. A secondary yield decline must immediately lower every primary rate equally.',
      'No. Primary mortgage rates and secondary MBS yields cannot move in the same direction.',
    ],
    correct: 0,
  },
  current_coupon: {
    choices: [
      'Yes. It is the contractual rate offered to every new mortgage borrower.',
      'No. Borrower characteristics, costs and lender pricing affect offered rates.',
      'No. It identifies the average remaining maturity of newly originated loans.',
    ],
    correct: 1,
  },
  rate_lock: {
    choices: [
      'Yes. A locked rate establishes that the loan has funded.',
      'No. A rate lock is available only after the loan has closed.',
      'No. Closing and the lock agreement’s conditions still need to be satisfied.',
    ],
    correct: 2,
  },
  fallout: {
    choices: [
      'Expected loan completion and rate exposure can change before funding.',
      'Unfunded applications have no rate exposure until cash is disbursed.',
      'Each open application already has the same rate exposure as a completed loan.',
    ],
    correct: 0,
  },
  pipeline_hedging: {
    choices: [
      'Yes. Locked face value alone determines the appropriate hedge size.',
      'No. Expected completion and sensitivity per dollar affect the required hedge.',
      'No. Only loans that have already funded can contribute pipeline exposure.',
    ],
    correct: 1,
  },
  repo: {
    choices: [
      'Yes. Any agent that settles collateral becomes the buyer to every seller and the seller to every buyer.',
      'No. An agent can provide settlement and collateral management without becoming the central counterparty.',
      'No. Tri-party means the repo is unsecured and therefore has no collateral to settle.',
    ],
    correct: 1,
  },
  haircut: {
    choices: [
      'No. A funding haircut and expected credit loss measure different things.',
      'Yes. A haircut is the lender’s forecast of realized principal loss.',
      'No. A haircut is the annual interest rate charged on repo borrowing.',
    ],
    correct: 0,
  },
  margin_call: {
    choices: [
      'Yes. Only missed bond payments can trigger a margin call.',
      'No. A mark-to-market decline can trigger a call under the agreement.',
      'No. A margin call occurs only when the bond’s coupon resets.',
    ],
    correct: 1,
  },
  total_return: {
    choices: [
      'Yes. Positive total return requires nonnegative excess return.',
      'No. Excess return is +1% minus +2%, or −1 percentage point.',
      'No. Excess return is the MBS coupon income, so it remains positive.',
    ],
    correct: 1,
  },
  carry: {
    choices: [
      'Financing costs can rise above the income on the funded position.',
      'A fixed coupon prevents financing costs from exceeding position income.',
      'Principal amortization automatically raises coupon income on the remaining balance.',
    ],
    correct: 0,
  },
  roll_down: {
    choices: [
      'Yes. The passage of time alone ensures a gain from moving along the curve.',
      'No. Curve shape and changing cash-flow assumptions affect roll-down.',
      'No. Roll-down depends only on the bond’s credit rating.',
    ],
    correct: 1,
  },
  real_return: {
    choices: [
      'Yes. Any positive nominal return increases purchasing power.',
      'No. Real return is determined by the contractual coupon alone.',
      'No. Compare it with inflation over the same period.',
    ],
    correct: 2,
  },
  policy_rate: {
    choices: [
      'Yes. Expectations and risk compensation can rise despite the policy cut.',
      'No. Long yields must move in the same direction as the current policy rate.',
      'Yes. A policy cut mechanically raises all longer-maturity yields.',
    ],
    correct: 0,
  },
  term_premium: {
    choices: [
      'Yes. The difference between any two quoted yields is the term premium.',
      'No. Separating expected short rates from risk compensation requires assumptions or a model.',
      'No. Term premium is the difference between a bond’s coupon and its face value.',
    ],
    correct: 1,
  },
  qe_qt: {
    choices: [
      'Yes. Every decline in central-bank holdings requires a market sale.',
      'No. Runoff means holdings rise as all principal payments are reinvested.',
      'No. Principal payments can reduce holdings without outright sales.',
    ],
    correct: 2,
  },
  supply_demand: {
    choices: [
      'No. Demand, liquidity and option valuation can also move the spread.',
      'Yes. Borrower credit alone determines the MBS spread.',
      'No. An unchanged credit profile requires the spread to widen.',
    ],
    correct: 0,
  },
  curve_shifts: {
    choices: [
      'Yes. Equal total DV01 offsets every possible curve movement.',
      'No. Sensitivity must also be matched across maturities.',
      'No. Matching face value alone guarantees protection against a curve twist.',
    ],
    correct: 1,
  },
  credit_rating: {
    choices: [
      'No. A high rating guarantees the bond’s market value.',
      'Yes. Every price decline means the issuer has missed a payment.',
      'Yes. Rates, spreads and liquidity can change without default.',
    ],
    correct: 2,
  },
  expected_loss: {
    choices: [
      'No. Loss distribution, timing and joint defaults can differ.',
      'Yes. Equal average losses establish equal senior-tranche risk.',
      'No. Senior-tranche risk depends only on the pool’s average coupon.',
    ],
    correct: 0,
  },
  credit_migration: {
    choices: [
      'No. Credit risk becomes relevant only after a missed payment.',
      'Yes. Changed expectations can affect required returns and prices before a missed payment.',
      'Yes. A credit-price change proves a contractual payment has already been missed.',
    ],
    correct: 1,
  },
  credit_spread: {
    choices: [
      'Yes. A spread in percentage points directly equals default probability.',
      'No. A 200 bp spread specifies a 2% recovery rate after default.',
      'No. Recovery, timing, risk compensation, liquidity and benchmark also affect the quote.',
    ],
    correct: 2,
  },
  cds_spread: {
    choices: [
      'First align issuer, seniority, currency, maturity and coverage; other differences can remain.',
      'Yes. Matching both quotes in basis points is sufficient for comparison.',
      'First match issuer alone; maturity and contractual coverage do not affect comparability.',
    ],
    correct: 0,
  },
  cds_bond_basis: {
    choices: [
      '+30 bp under the CDS-minus-bond convention.',
      '−30 bp under the CDS-minus-bond convention; this alone does not prove arbitrage.',
      '−30 bp, which by itself establishes an executable arbitrage.',
    ],
    correct: 1,
  },
  excess_spread: {
    choices: [
      'Yes. Both names refer to the same price-implied valuation spread.',
      'No. Excess spread is the deal’s principal balance expressed in basis points.',
      'No. Excess spread measures deal income; OAS is inferred from price using an option model.',
    ],
    correct: 2,
  },
  principal_interest: {
    choices: [
      'Yes, every part of a payment reduces the balance.',
      'No, only principal repayment reduces the balance.',
      'Only when market rates fall.',
    ],
    correct: 1,
  },
  amortization: {
    choices: [
      'The contractual rate falls each month as the loan ages.',
      'A smaller balance generates less interest, leaving more of the payment for principal.',
      'The payment rises even though the stated payment amount is unchanged.',
    ],
    correct: 1,
  },
  fixed_arm: {
    choices: [
      'The note rate must become 6% immediately because index plus margin overrides the reset schedule.',
      'The fully indexed reference rate is 6%, while the initial cap limits the first reset to at most 5%.',
      'The note rate must remain at 3% because an ARM cannot rise above its initial rate.',
    ],
    correct: 1,
  },
  pool_factor: {
    choices: [
      'No. The factor measures principal paydown; remaining principal also has a market price.',
      'Yes. A 0.72 factor directly measures a 28% decline in market value.',
      'No. It means the remaining balance trades at a market price of 72.',
    ],
    correct: 0,
  },
  pool_averages: {
    choices: [
      'No. Matching WAC fixes the same principal repayment schedule.',
      'Yes. Loan age, balances and borrower characteristics can differ.',
      'Yes. Matching WAC means the pools must have different contractual coupons.',
    ],
    correct: 1,
  },
  prepayments: {
    choices: [
      'Yes, home sales and extra payments can return principal early.',
      'No, rates must fall first.',
      'Only at the final maturity date.',
    ],
    correct: 0,
  },
  smm: {
    choices: [
      'Balance after scheduled principal × (1 − SMM).',
      'Balance before scheduled principal × (1 + SMM).',
      'Balance after scheduled principal × SMM.',
    ],
    correct: 0,
  },
  cpr: {
    choices: [
      'Yes, 6% of principal each month.',
      'No, the monthly equivalent is roughly 0.5%.',
      'It means 6% of the original balance every year.',
    ],
    correct: 1,
  },
  psa: {
    choices: [
      'Yes. Standard 100 PSA assumes 6% CPR in every month from origination.',
      'No. Standard 100 PSA reaches 6% CPR after the first twelve months.',
      'No. Under the standard ramp, they match from loan month thirty onward.',
    ],
    correct: 2,
  },
  incentive: {
    choices: [
      'Borrowers face different costs and constraints.',
      'The coupon alone determines every payoff.',
      'Equal coupons guarantee equal prepayment speeds.',
    ],
    correct: 0,
  },
  pass_through: {
    choices: [
      'Yes. The security must pass through the loan coupon without deductions.',
      'No. Fees and security terms affect the interest passed through.',
      'No. The loan coupon determines principal timing but does not generate interest.',
    ],
    correct: 1,
  },
  agency: {
    choices: [
      'Rising rates necessarily speed refinancing and shorten principal timing.',
      'The agency guarantee fixes expected principal timing regardless of refinancing.',
      'Slower refinancing can extend principal timing and increase rate sensitivity.',
    ],
    correct: 2,
  },
  tba: {
    choices: [
      'No. Trade characteristics and eligibility rules restrict delivery.',
      'Yes. Any mortgage loan can satisfy a TBA delivery obligation.',
      'No. Matching the coupon is the only delivery requirement.',
    ],
    correct: 0,
  },
  specified: {
    choices: [
      'Equal coupons require equal expected principal paths.',
      'Collateral and expected payment patterns can differ.',
      'The stated coupon alone determines each pool’s market price.',
    ],
    correct: 1,
  },
  rolls: {
    choices: [
      'Yes. A positive drop alone establishes a financing advantage.',
      'No. Only the drop matters; forgone payments are excluded from the comparison.',
      'No. Forgone payments, funding, prepayments and later-delivered pools all affect the comparison.',
    ],
    correct: 2,
  },
  cash_flows: {
    choices: [
      'Yes. Any base-case label establishes probability weighting.',
      'No. One scenario does not by itself specify outcomes and their probabilities.',
      'Yes. Contractual payments and expected payments always match.',
    ],
    correct: 1,
  },
  wal: {
    choices: [
      'No. WAL is fixed by the legal final maturity.',
      'Yes. Different principal-payment paths produce different WALs.',
      'Yes. Changing only the market price necessarily changes WAL.',
    ],
    correct: 1,
  },
  price: {
    choices: [
      'No. Matching quoted prices fixes identical cash invoices.',
      'Yes. The quoted price alone determines both face amount and accrued interest.',
      'Yes. Face amount, accrued interest or settlement terms may differ.',
    ],
    correct: 2,
  },
  pv: {
    choices: [
      'Using an annual rate for monthly periods without conversion misstates discounting.',
      'An annual rate is numerically identical to its equivalent monthly rate.',
      'Matching periods removes the need to discount future payments.',
    ],
    correct: 0,
  },
  spreads: {
    choices: [
      'Yes. OAS is observed directly and is independent of modeling assumptions.',
      'No. A model infers OAS from the observed price.',
      'No. OAS is the contractual spread written into every mortgage loan.',
    ],
    correct: 1,
  },
  duration: {
    choices: [
      'A rate shock changes discounting but cannot change mortgage cash flows.',
      'Re-estimating payments forces the mortgage’s duration to stay unchanged.',
      'The shock can alter borrower exercise and cash-flow timing.',
    ],
    correct: 2,
  },
  dv01: {
    choices: [
      'No. It extends a local estimate over a large move while duration and cash flows may change.',
      'Yes. DV01 gives an exact linear price change for any rate move.',
      'No. $40 DV01 instead means exactly a $40 loss for a 100 bp rise.',
    ],
    correct: 0,
  },
  convexity: {
    choices: [
      'A rate rise necessarily shortens MBS duration while leaving hedge exposure unchanged.',
      'A rate rise can extend MBS duration and increase exposure relative to the old hedge.',
      'Matching yesterday’s DV01 guarantees the hedge remains sufficient today.',
    ],
    correct: 1,
  },
  extension: {
    choices: [
      'Returned principal continues earning the old coupon after repayment.',
      'Falling rates guarantee replacement investments with higher yields.',
      'Returned principal may have to be reinvested at lower yields.',
    ],
    correct: 2,
  },
  hedging: {
    choices: [
      'Yes. Spreads, liquidity or borrower behavior can change independently.',
      'No. Stable Treasury yields fix the value of a rate-hedged MBS.',
      'No. Rate hedging also removes mortgage spread and liquidity exposure.',
    ],
    correct: 0,
  },
  cmo: {
    choices: [
      'Yes. The REMIC label gives every class the same repayment priority.',
      'Yes. REMIC status identifies the class with the earliest principal payments.',
      'No. The transaction’s distribution rules determine principal priority.',
    ],
    correct: 2,
  },
  sequential: {
    choices: [
      'Yes. Waiting for principal necessarily suspends the class’s interest payments.',
      'No. Interest-payment rules are separate from principal priority.',
      'Yes. Only the class currently receiving principal can receive interest.',
    ],
    correct: 1,
  },
  pac: {
    choices: [
      'Yes. Support depletion or prepayment paths can overwhelm the protection.',
      'No. The PAC schedule remains protected after its support is depleted.',
      'No. Prepayments outside the structure’s capacity leave PAC timing unchanged.',
    ],
    correct: 0,
  },
  support: {
    choices: [
      'The PAC schedule removes variability from the underlying loan payments.',
      'Borrowers must adjust their prepayments to match the PAC schedule.',
      'Other classes absorb variability according to the transaction’s rules.',
    ],
    correct: 2,
  },
  z_class: {
    choices: [
      'No. A class balance changes only when an investor buys or sells.',
      'Yes. The class terms can add accrued interest to principal.',
      'Yes. A higher market price is added directly to the class balance.',
    ],
    correct: 1,
  },
  io_po: {
    choices: [
      'Less principal remains to generate the IO’s future interest.',
      'The IO must repay the principal returned to the other classes.',
      'Faster principal return extends the period over which the IO earns interest.',
    ],
    correct: 0,
  },
  balloon: {
    choices: [
      'No. Making each scheduled payment necessarily eliminates principal at maturity.',
      'Yes. A final principal bill means earlier scheduled payments were missed.',
      'Yes. The contractual term can end before principal is fully amortized.',
    ],
    correct: 2,
  },
  wac: {
    choices: [
      'The number of loans, even when the pool composition stays unchanged.',
      'Loan interest generated and the incentive to refinance, all else equal.',
      'The contractual maturity dates, even when the loan terms stay unchanged.',
    ],
    correct: 1,
  },
  wam: {
    choices: [
      'Yes. Amortization and prepayments can return principal much earlier.',
      'No. WAM and WAL both measure the same principal repayment date.',
      'No. The last contractual maturity fixes the average principal return time.',
    ],
    correct: 0,
  },
  wala: {
    choices: [
      'Yes. Greater age raises prepayment speeds regardless of current rates.',
      'Yes. Older loans must refinance before newer loans with the same incentive.',
      'No. Rates, borrower constraints and refinancing history also matter.',
    ],
    correct: 2,
  },
  loan_balance: {
    choices: [
      'It establishes a loan’s coupon without needing to read its terms.',
      'It can affect refinancing behavior and the value of prepayment protection.',
      'It replaces the need to consider refinancing behavior in pricing protection.',
    ],
    correct: 1,
  },
  servicing: {
    choices: [
      'No. Servicing and other applicable fees are deducted.',
      'Yes. The holder receives gross loan interest before servicing fees.',
      'Yes. Servicing fees are added to the loan interest passed through.',
    ],
    correct: 0,
  },
  net_coupon: {
    choices: [
      'No. The stated coupon fixes each buyer’s yield regardless of price.',
      'No. The same coupon ensures identical realized cash-flow timing.',
      'Yes. Purchase prices and cash-flow assumptions can differ.',
    ],
    correct: 2,
  },
  frictions: {
    choices: [
      'Their costs, constraints and expected holding periods differ.',
      'Every borrower refinances on the same day.',
      'Transaction costs cannot affect the decision.',
    ],
    correct: 0,
  },
  burnout: {
    choices: [
      'No. Check past feasible refinancing opportunities and borrower constraints.',
      'Yes. Low CPR identifies selection regardless of refinancing eligibility.',
      'Yes. High WALA confirms that borrowers passed up feasible refinancing.',
    ],
    correct: 0,
  },
  lock_in: {
    choices: [
      'Yes. A 400 bp note-rate gap directly measures the payment increase.',
      'Yes. A positive gap determines that the borrower will stay in the home.',
      'No. The gap compares note rates; payments and moving decisions depend on more.',
    ],
    correct: 2,
  },
  turnover: {
    choices: [
      'No. Every prepayment requires a financially attractive refinancing.',
      'Yes. Moves, sales and other circumstances still produce loan payoffs.',
      'No. Unattractive refinancing prevents home sales from producing payoffs.',
    ],
    correct: 1,
  },
  curtailment: {
    choices: [
      'The outstanding balance and, subject to the terms, future interest.',
      'The contractual note rate, with the outstanding principal left unchanged.',
      'The amount of principal already repaid, restoring it to the balance.',
    ],
    correct: 0,
  },
  seasonality: {
    choices: [
      'The preceding month isolates rate effects from seasonal activity.',
      'Comparing adjacent months removes the influence of seasonal home sales.',
      'Month-to-month changes can mix rate effects with seasonal activity.',
    ],
    correct: 2,
  },
  buyouts: {
    choices: [
      'No. Credit trouble can only delay principal in an agency pool.',
      'Yes. Certain delinquent-loan removals accelerate principal under program rules.',
      'Yes. Every delinquency triggers an immediate, identical buyout across programs.',
    ],
    correct: 1,
  },
  ginnie: {
    choices: [
      'No. Cash-flow timing and market value still matter.',
      'Yes. The guarantee fixes the market value between payment dates.',
      'Yes. Guaranteed payments remove sensitivity to when principal is returned.',
    ],
    correct: 0,
  },
  non_agency: {
    choices: [
      'The loan collateral determines each class’s losses without the waterfall.',
      'The waterfall determines loan recoveries independently of the underlying loans.',
      'Loan losses are allocated under the deal’s payment and loss rules.',
    ],
    correct: 2,
  },
  pay_up: {
    choices: [
      '$0.50 more per $100 current face for the comparable specified-pool clean price.',
      'A 50 bp increase in the security’s yield relative to the comparable TBA.',
      'A guaranteed 0.5% realized excess return over the comparable TBA.',
    ],
    correct: 0,
  },
  cheapest_deliverable: {
    choices: [
      'Its characteristics may be more valuable than likely generic deliveries.',
      'An identified pool must have the same value as any generic delivery.',
      'Its higher price proves that it will return more principal than its balance.',
    ],
    correct: 0,
  },
  settlement: {
    choices: [
      'It determines the borrower’s contractual mortgage rate after the trade.',
      'It replaces future cash-flow dates with the trade date for discounting.',
      'It sets the starting point for cash-flow timing and accrued interest.',
    ],
    correct: 2,
  },
  liquidity: {
    choices: [
      'No. Protection against losses ensures a low-cost exit in any market.',
      'Yes. A narrow buyer base or market stress can increase transaction costs.',
      'No. A well-protected bond’s buyer base cannot affect its exit price.',
    ],
    correct: 1,
  },
  final_maturity: {
    choices: [
      'Yes. Expected principal payments can precede the legal deadline by years.',
      'No. Legal final maturity is the expected date of the first principal payment.',
      'No. An early-pay class must return all principal at its legal final maturity.',
    ],
    correct: 0,
  },
  payment_delay: {
    choices: [
      'No. Discounting depends only on the amount, not the receipt date.',
      'No. A payment delay changes value only when the nominal amount changes.',
      'Yes. Later receipt changes the discounting interval.',
    ],
    correct: 2,
  },
  discount_factor: {
    choices: [
      'One dollar paid on that date earns a 90% return before receipt.',
      'One dollar paid on that date contributes 90 cents of value today.',
      'One dollar paid on that date contributes 10 cents of value today.',
    ],
    correct: 1,
  },
  yield: {
    choices: [
      'No. Cash flows, sale price and reinvestment conditions can differ.',
      'Yes. The quoted yield fixes returns even if principal timing changes.',
      'Yes. Quoting a yield guarantees the sale price and reinvestment rate.',
    ],
    correct: 0,
  },
  reinvestment: {
    choices: [
      'Returned principal continues earning the original coupon after payoff.',
      'Falling rates ensure returned cash can be reinvested at a higher yield.',
      'Interest ends sooner and returned cash may face lower replacement yields.',
    ],
    correct: 2,
  },
  accrual: {
    choices: [
      'Clean price already includes every accrued-interest adjustment.',
      'Accrued interest may be included under the settlement convention.',
      'The invoice must add all future coupon payments to the clean value.',
    ],
    correct: 1,
  },
  day_count: {
    choices: [
      'Yes. Different day-count conventions or accrual dates can change interest.',
      'No. Equal stated rates fix interest regardless of the accrual period.',
      'No. Day-count conventions change payment labels but never interest amounts.',
    ],
    correct: 0,
  },
  price_32nds: {
    choices: [
      '101.16 per 100 of principal.',
      '101.0625 per 100 of principal.',
      '101.5 per 100 of principal.',
    ],
    correct: 2,
  },
  par_curve: {
    choices: [
      'A par rate concerns one future payment; a spot yield includes interim coupons.',
      'A par bond includes interim coupons; a spot rate concerns one future payment.',
      'Par and spot yields measure identical cash flows at any given maturity.',
    ],
    correct: 1,
  },
  spot_curve: {
    choices: [
      'Each of the MBS’s payment dates needs an appropriate discount factor.',
      'It assigns the final-maturity discount factor to every MBS payment.',
      'It makes the timing of principal and interest irrelevant to valuation.',
    ],
    correct: 0,
  },
  forward_curve: {
    choices: [
      'No. A forward curve is useful only if future rates equal it exactly.',
      'No. Forward rates describe guaranteed future observations rather than today’s prices.',
      'Yes. It links today’s prices consistently across future dates.',
    ],
    correct: 2,
  },
  tenor: {
    choices: [
      'Yes. Original issuance tenor remains the comparison tenor as time passes.',
      'No. Current payment dates and the comparison’s conventions matter.',
      'Yes. The original ten-year label replaces the need to inspect remaining payments.',
    ],
    correct: 1,
  },
  treasury: {
    choices: [
      'No. Coupons, optionality and curve sensitivity can differ.',
      'Yes. Equal maturity ensures equal sensitivity at every curve point.',
      'Yes. Matching maturity removes differences caused by coupons and embedded options.',
    ],
    correct: 0,
  },
  sofr: {
    choices: [
      'Yes. A ten-year swap quote simply repeats today’s overnight SOFR.',
      'Yes. Ten years describes the notional size while the quoted rate stays overnight.',
      'No. It prices future overnight accruals against a stream of fixed payments.',
    ],
    correct: 2,
  },
  ois: {
    choices: [
      'The overnight index’s tenor, which becomes longer at each curve point.',
      'The maturity of the fixed-versus-overnight exchange.',
      'The frequency with which an overnight index becomes a term index.',
    ],
    correct: 1,
  },
  benchmark_matching: {
    choices: [
      'Which benchmark and cash-flow assumptions were used for each?',
      'Do the spreads have the same number of basis points, regardless of benchmark?',
      'Can the larger quoted spread be selected without checking its assumptions?',
    ],
    correct: 0,
  },
  nominal_spread: {
    choices: [
      'The spread must be wide because 6% is a high yield.',
      'The nominal spread is 50 bp; yield alone does not establish relative value.',
      'The spread is 550 bp because that is the benchmark yield.',
    ],
    correct: 1,
  },
  z_spread: {
    choices: [
      'Z-spread and OAS necessarily use identical option-dependent cash flows.',
      'OAS models rate paths and option-dependent cash flows.',
      'OAS ignores borrower options while Z-spread models their exercise.',
    ],
    correct: 1,
  },
  oas: {
    choices: [
      'Yes. Rate, volatility and prepayment assumptions can differ.',
      'No. A single market price determines OAS independently of the model.',
      'No. Differences in assumed borrower behavior cannot affect OAS.',
    ],
    correct: 0,
  },
  macaulay: {
    choices: [
      'Whenever a bond has regularly spaced coupons before maturity.',
      'Whenever an MBS is expected to prepay before its legal maturity.',
      'When there is a single fixed positive payment under the stated convention.',
    ],
    correct: 2,
  },
  modified_duration: {
    choices: [
      'MBS principal timing stays fixed even when borrowers refinance.',
      'Borrowers can change principal timing when rates move.',
      'MBS coupon payments have no sensitivity to their discount rates.',
    ],
    correct: 1,
  },
  key_rate: {
    choices: [
      'Exposures to short, intermediate and long rates can differ.',
      'A single maturity offsets every possible change in the yield curve.',
      'Using multiple maturities removes the need to compare rate sensitivities.',
    ],
    correct: 0,
  },
  contraction: {
    choices: [
      'A discount PO buyer seeking to receive purchased principal sooner.',
      'A buyer whose entire investment is repaid without any timing change.',
      'A premium buyer expecting to keep earning an above-market coupon.',
    ],
    correct: 2,
  },
  volatility: {
    choices: [
      'Unchanged current rates require an unchanged distribution of future rates.',
      'The distribution of possible future rates can change.',
      'An option’s value depends only on the current rate, not possible future rates.',
    ],
    correct: 1,
  },
  treasury_hedge: {
    choices: [
      'No. Compare sensitivities, including the futures contract’s own exposure.',
      'Yes. Equal face amounts imply matching price sensitivity to rates.',
      'Yes. Futures exposure is determined by face amount rather than contract sensitivity.',
    ],
    correct: 0,
  },
  swap_hedge: {
    choices: [
      'Yes. Matching DV01 also fixes the mortgage’s future principal profile.',
      'Yes. Equal DV01 removes the mortgage’s exposure to changing spreads.',
      'No. Spread, option and changing-principal risks remain.',
    ],
    correct: 2,
  },
  basis_risk: {
    choices: [
      'The hedge and MBS moving by equal and offsetting amounts.',
      'Mortgage spreads widening relative to the hedge.',
      'A spread move that leaves both MBS and hedge values unchanged.',
    ],
    correct: 1,
  },
  model_risk: {
    choices: [
      'Compare assumptions and definitions, then test plausible alternatives.',
      'Rank the outputs by size before examining what each model assumes.',
      'Use the average output as a substitute for comparing model definitions.',
    ],
    correct: 0,
  },
  remic: {
    choices: [
      'Yes. Both labels specify the same principal-payment ordering.',
      'Yes. Calling a transaction a REMIC fully describes its CMO structure.',
      'No. They often occur together but describe different transaction aspects.',
    ],
    correct: 2,
  },
  waterfall: {
    choices: [
      'Every class receives an identical share of each collateral cash flow.',
      'Payment priorities allocate the same cash differently across classes and dates.',
      'Class risk follows only collateral quality, regardless of payment priority.',
    ],
    correct: 1,
  },
  seniority: {
    choices: [
      'No. Principal timing and loss allocation are distinct choices.',
      'Yes. Receiving principal first uniquely determines protection against losses.',
      'Yes. Every later-paying class must have the same loss priority.',
    ],
    correct: 0,
  },
  io: {
    choices: [
      'Lower rates increase future interest by extending every refinanced loan.',
      'The IO receives extra principal that offsets interest lost to refinancing.',
      'Refinancing may destroy future interest faster than discounting helps.',
    ],
    correct: 2,
  },
  po: {
    choices: [
      'It increases the coupon payments received by the PO.',
      'It brings forward principal purchased at a discount.',
      'It raises the contractual principal owed above the outstanding balance.',
    ],
    correct: 1,
  },
  subordination: {
    choices: [
      'More senior classes may face losses under the loss waterfall.',
      'The depleted cushion continues absorbing losses without exposing senior classes.',
      'Excess losses disappear because the original cushion set a limit on total losses.',
    ],
    correct: 0,
  },
  oc: {
    choices: [
      'Yes. Defaulted collateral must retain its full unadjusted value in the numerator.',
      'Yes. An OC test is defined without reference to deal-specific adjustments.',
      'No. Contract-defined adjustments can reduce the collateral numerator.',
    ],
    correct: 2,
  },
  ic: {
    choices: [
      'No. Income coverage and collateral coverage use the same numerator.',
      'Yes. Income and collateral-value measures can move differently.',
      'No. Passing a collateral-value test determines the income test’s result.',
    ],
    correct: 1,
  },
  delinquency: {
    choices: [
      'Yes. The loan may cure or be resolved with sufficient recovery.',
      'No. A late payment itself establishes an unrecoverable principal loss.',
      'No. Delinquency means the borrower cannot resume making payments.',
    ],
    correct: 0,
  },
  default: {
    choices: [
      'Yes. Default means collateral and other recoveries have zero value.',
      'Yes. Default and complete loss of principal describe the same outcome.',
      'No. Recoveries may offset part or all of principal exposure.',
    ],
    correct: 2,
  },
  severity: {
    choices: [
      'Collateral values determine the original note rate after default.',
      'Sale proceeds and recovery costs affect how much remains unpaid.',
      'Only the original loan balance matters once a default occurs.',
    ],
    correct: 1,
  },
  recovery_lag: {
    choices: [
      'Yes. A later recovery is discounted longer at a positive rate.',
      'No. Equal nominal recoveries have equal present values regardless of timing.',
      'Yes. A later recovery has a higher present value at a positive rate.',
    ],
    correct: 0,
  },
  rent_roll: {
    choices: [
      'Lease expiries establish fixed rental income after the tenants leave.',
      'An expiry schedule measures debt payments rather than tenant income risk.',
      'Departures or lease renegotiations can change future rental income.',
    ],
    correct: 2,
  },
  occupancy: {
    choices: [
      'No. Occupied space necessarily generates the full contracted rent in cash.',
      'Yes. Lower rents or weak collections can reduce cash income.',
      'No. Occupancy percentage and cash rental income measure the same thing.',
    ],
    correct: 1,
  },
  noi: {
    choices: [
      'No. Debt service, reserves and borrower support also matter.',
      'Yes. Any NOI decline automatically breaches the loan’s payment obligation.',
      'Yes. NOI alone determines default without reference to required debt payments.',
    ],
    correct: 0,
  },
  dscr: {
    choices: [
      'Yes. The origination ratio remains valid until maturity.',
      'Yes. The original ratio guarantees sufficient income today.',
      'No. Current income, debt service and measurement periods need checking.',
    ],
    correct: 2,
  },
  ltv: {
    choices: [
      'It increases the equity cushion because the debt balance is unchanged.',
      'It shrinks the equity cushion and can constrain refinancing.',
      'It leaves the equity cushion unchanged unless principal also changes.',
    ],
    correct: 1,
  },
  cap_rate: {
    choices: [
      'A lower property value under simple direct capitalization.',
      'A higher property value under simple direct capitalization.',
      'An unchanged property value because NOI has not moved.',
    ],
    correct: 0,
  },
  debt_yield: {
    choices: [
      'No. Debt yield must track DSCR whenever the interest rate changes.',
      'No. Debt yield uses the loan’s interest payment as its denominator.',
      'Yes. Debt yield stays unchanged if NOI and debt balance stay the same.',
    ],
    correct: 2,
  },
  refinance_risk: {
    choices: [
      'Collateral value alone determines refinancing capacity regardless of income.',
      'Replacement debt may be limited by both leverage and cash-flow coverage.',
      'Income alone determines refinancing capacity regardless of collateral leverage.',
    ],
    correct: 1,
  },
  conduit_sasb: {
    choices: [
      'One tenant, property or sponsor event can dominate a concentrated deal.',
      'Average metrics determine how evenly risk is distributed among properties.',
      'A concentrated deal’s average metrics remove exposure to individual tenant events.',
    ],
    correct: 0,
  },
  swap_curve: {
    choices: [
      'A five-year swap par rate is automatically the five-year zero rate.',
      'A swap par curve supplies only rates for contracts with no interim payments.',
      'A swap par rate prices a multi-payment contract, not a single future payment.',
    ],
    correct: 2,
  },
  caps_floors: {
    choices: [
      'Floating coupons make embedded cap, floor and call features irrelevant to value.',
      'Floating coupons can contain options that plain discount margin does not separate.',
      'A plain discount margin automatically reports cap, floor and call values separately.',
    ],
    correct: 1,
  },
  securitization_roles: {
    choices: [
      'A servicer administers payments; other legal roles depend on the documents.',
      'Collecting borrower payments makes the servicer the security’s guarantor.',
      'Administering loan payments establishes the servicer as the security’s investor.',
    ],
    correct: 0,
  },
  home_prices: {
    choices: [
      'LTV falls from 60% to 48%.',
      'LTV stays at 60% because the loan balance is unchanged.',
      'LTV rises from 60% to 75%.',
    ],
    correct: 2,
  },
  reverse_mortgage: {
    choices: [
      'Use a forward-loan amortization schedule because balances must decline monthly.',
      'Balances may increase; repayment triggers and guarantees depend on the program.',
      'The reverse-mortgage label alone determines identical repayment triggers and guarantees.',
    ],
    correct: 1,
  },
  rmbs: {
    choices: [
      'Yes. The labels describe different dimensions of the same security.',
      'No. Being residential prevents a security from having an agency framework.',
      'No. A pass-through cash-flow structure requires a floating-rate coupon.',
    ],
    correct: 0,
  },
  cmbs: {
    choices: [
      'Every loan backed by housing must be an individual household mortgage.',
      'An apartment building qualifies only when its flats have separate home loans.',
      'It may secure one commercial mortgage on a multifamily property.',
    ],
    correct: 2,
  },
  crt: {
    choices: [
      'Shared mortgage collateral gives CRT the same credit guarantee as an agency pass-through.',
      'CRT credit exposure differs from the guarantee on an agency pass-through.',
      'CRT and agency pass-through ownership provide interchangeable credit exposure.',
    ],
    correct: 1,
  },
  abs: {
    choices: [
      'Assess the assets, revolving features, servicing and waterfall before comparing yields.',
      'The ABS label makes collateral and payment structures comparable without further review.',
      'Similar ABS yields establish identical asset, servicing and waterfall risks.',
    ],
    correct: 0,
  },
  auto_abs: {
    choices: [
      'A shrinking auto-loan balance establishes that the borrower prepaid voluntarily.',
      'Equal declines in auto-loan balances imply equal principal-loss outcomes.',
      'Prepayment and default liquidation can both shrink balances but imply different losses.',
    ],
    correct: 2,
  },
  card_abs: {
    choices: [
      'An open-ended card account follows the same schedule as a level-payment mortgage.',
      'Revolving card accounts should not inherit a mortgage amortization schedule.',
      'Card receivables can be modeled as fixed installment loans solely because they are securitized.',
    ],
    correct: 1,
  },
  student_abs: {
    choices: [
      'Confirm the specific program and security before assuming a government guarantee.',
      'The student-loan label itself establishes a government guarantee for the security.',
      'One guaranteed student-loan program establishes the same guarantee across other pools.',
    ],
    correct: 0,
  },
  clo: {
    choices: [
      'Corporate CLOs and CRE CLOs both necessarily hold the same business-loan collateral.',
      'The shared CLO acronym identifies identical collateral regardless of the CRE qualifier.',
      'Corporate CLOs hold business loans; CRE CLOs hold commercial real-estate loans.',
    ],
    correct: 2,
  },
  sovereign: {
    choices: [
      'A euro denomination makes Bunds, OATs and BTPs interchangeable reference securities.',
      'Name the issuer or curve construction; government bonds are not uniformly risk-free.',
      'A government issuer establishes a risk-free benchmark without further identification.',
    ],
    correct: 1,
  },
  corporate: {
    choices: [
      'Corporate debt is an issuer claim; securitizations allocate specified asset collections.',
      'Corporate bonds allocate specified asset collections through a securitization waterfall.',
      'A securitization is simply an unrestricted corporate claim against the originating issuer.',
    ],
    correct: 0,
  },
  municipal: {
    choices: [
      'Municipal and taxable bond yields are directly comparable without tax conventions.',
      'The municipal label makes repayment pledges irrelevant to yield comparisons.',
      'Check repayment pledges and after-tax conventions before comparing yields.',
    ],
    correct: 2,
  },
  covered_bonds: {
    choices: [
      'Yes. Home-loan collateral determines a pass-through structure regardless of issuer recourse.',
      'No. Covered bonds typically combine issuer recourse with cover-pool protection.',
      'Yes. Covered bonds remove issuer recourse and pass through only the loan collections.',
    ],
    correct: 1,
  },
  floater: {
    choices: [
      'Resets reduce some benchmark exposure but leave price and required-margin risk.',
      'A coupon reset fixes the market price by removing changes in the required margin.',
      'Floating coupons eliminate benchmark exposure and ensure the bond stays at par.',
    ],
    correct: 0,
  },
  zero_coupon: {
    choices: [
      'A zero-coupon bond and a zero curve are two names for the same instrument.',
      'A zero curve is the payment schedule of one bond that pays no coupons.',
      'A zero-coupon bond is an instrument; a zero curve gives discount rates across dates.',
    ],
    correct: 2,
  },
  inflation_linked: {
    choices: [
      'Nominal-minus-real yield provides a forecast with liquidity effects fully removed.',
      'Breakeven inflation also reflects liquidity and risk premia.',
      'Breakeven inflation contains only expected inflation, without compensation for risk.',
    ],
    correct: 1,
  },
  callable: {
    choices: [
      'Both change timing, but decision makers, constraints and exercise behavior differ.',
      'Issuer calls and homeowner prepayments share identical exercise behavior.',
      'Homeowner prepayment changes timing while an issuer call leaves payment dates fixed.',
    ],
    correct: 0,
  },
  g_spread: {
    choices: [
      'It adds a common spread to each dated cash flow’s discount rate.',
      'A government curve can be substituted across currencies without changing the comparison.',
      'It is a yield comparison requiring a specified government benchmark.',
    ],
    correct: 2,
  },
  i_spread: {
    choices: [
      'Yes. A single yield-minus-swap-par calculation is the definition of Z-spread.',
      'No. Z-spread fits all dated cash flows to a zero curve.',
      'Yes. Matching a five-year maturity makes par and zero-curve comparisons identical.',
    ],
    correct: 1,
  },
  asset_swap: {
    choices: [
      'Generally no. Bond price, package cash flows and upfront conventions matter.',
      'Yes. Subtracting the two yields fully captures the asset-swap package.',
      'Yes. The bond price and upfront convention cannot affect the asset-swap spread.',
    ],
    correct: 0,
  },
  discount_margin: {
    choices: [
      'No. A stable benchmark fixes the required margin on a floating-rate bond.',
      'No. Floating-rate bond prices change only when the reference rate changes.',
      'Yes. Credit or liquidity changes can raise the required margin.',
    ],
    correct: 2,
  },
  quoted_margin: {
    choices: [
      'Yes. The contractual 150 bp fixes discount margin at every purchase price.',
      'No. Contractual margin and the required margin implied by price can differ.',
      'Yes. Discount margin is the promised spread, regardless of market valuation.',
    ],
    correct: 1,
  },
  swap_spread: {
    choices: [
      'Swap spread is swap minus government yield; I-spread is bond minus swap rate.',
      'Swap spread is bond minus swap rate; I-spread is swap minus government yield.',
      'Swap spread and I-spread both subtract government yield from the bond yield.',
    ],
    correct: 0,
  },
  spread_duration: {
    choices: [
      'A benchmark-duration hedge necessarily offsets the bond’s spread duration too.',
      'Spread duration measures the same shock as benchmark duration under a different name.',
      'Benchmark-rate shocks and spread shocks measure different exposures.',
    ],
    correct: 2,
  },
  usd_rates: {
    choices: [
      'Any curve labeled USD provides the same rates for the same dates.',
      'USD swap, government and SOFR curves refer to different instruments.',
      'The dollar denomination makes swap rates interchangeable with government yields.',
    ],
    correct: 1,
  },
  eur_rates: {
    choices: [
      'No. The issuer or curve construction must also be specified.',
      'Yes. EUR denomination selects the German government curve automatically.',
      'Yes. All euro government issuers provide interchangeable benchmark yields.',
    ],
    correct: 0,
  },
  gbp_rates: {
    choices: [
      'Central-bank administration makes SONIA identical to the official policy rate.',
      'A transaction-based rate becomes a policy target when a central bank administers it.',
      'A central-bank administrator does not make a transaction benchmark its policy rate.',
    ],
    correct: 2,
  },
  jpy_rates: {
    choices: [
      'TONA and SOFR are both secured benchmarks differentiated only by currency.',
      'TONA is unsecured and SOFR is secured; market conventions differ.',
      'TONA is the yen version of SOFR with identical collateral conventions.',
    ],
    correct: 1,
  },
  chf_rates: {
    choices: [
      'Both are secured overnight rates, but markets and calculation conventions differ.',
      'SARON is unsecured, whereas SOFR is secured by collateral.',
      'Their secured overnight labels establish identical collateral and calculation conventions.',
    ],
    correct: 0,
  },
  cny_rates: {
    choices: [
      'DR007 is an overnight reference and LPR is the matching risk-free OIS rate.',
      'Onshore CNY and offshore CNH funding share identical market conditions.',
      'DR007 is not overnight, LPR is not risk-free OIS, and CNY/CNH funding differs.',
    ],
    correct: 2,
  },
  currency_denomination: {
    choices: [
      'The issuer’s nationality changes a USD bond’s promised payments into its home currency.',
      'A non-US issuer’s USD bond still promises dollar cash flows.',
      'A bond can promise dollars only when the issuer is based in the United States.',
    ],
    correct: 1,
  },
  fx_hedging: {
    choices: [
      'FX hedging leaves credit risk, and changing cash flows can create hedge mismatches.',
      'An FX hedge removes the bond’s credit risk as well as currency exposure.',
      'Hedging the original principal guarantees total return even when cash flows change.',
    ],
    correct: 0,
  },
  cross_currency_basis: {
    choices: [
      'Basis measures the spot exchange-rate change independently of either reference rate.',
      'Signed basis quotes are directly comparable without identifying the adjusted leg.',
      'Basis is not a spot FX move; identify the adjusted leg and reference rates.',
    ],
    correct: 2,
  },
  term_overnight: {
    choices: [
      'Yes. A three-month period means all daily overnight rates are fixed at its start.',
      'Generally no. In-arrears compounding accumulates daily rates through the period.',
      'Yes. Today’s overnight fixing determines the full in-arrears compounded coupon.',
    ],
    correct: 1,
  },
};
