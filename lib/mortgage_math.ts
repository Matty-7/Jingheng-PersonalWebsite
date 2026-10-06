import katex from 'katex';
import { mortgage_concepts } from '../content/mortgage_concepts.ts';

// Render on the server. The client receives trusted generated HTML/MathML,
// never a TeX parser or visitor-supplied markup. Fonts are bundled locally.
export const mortgage_math: Record<string, { tex: string; variables: string }> =
  {
    accrual_period: {
      tex: String.raw`\alpha=\frac{D(T_1,T_2)}{360}`,
      variables:
        'T₁ / T₂: adjusted accrual start / end, including the start and excluding the end. D: actual calendar days. α: Actual/360 accrual fraction, not time from valuation to start.',
    },
    bank_discount_rate: {
      tex: String.raw`d=\left(1-\frac{P}{100}\right)\frac{360}{D},\qquad P=100\left(1-\frac{dD}{360}\right)`,
      variables:
        'P: price per 100 face redeemed once at maturity; D: positive actual days to redemption; d: annual decimal bank discount rate. No intervening cash flows; Actual/360 quotation.',
    },
    money_market_yield: {
      tex: String.raw`y_{360}=\left(\frac{100}{P}-1\right)\frac{360}{D}=\frac{d}{1-dD/360}`,
      variables:
        'y₃₆₀: simple annual decimal yield; P: positive price per 100 redemption; D: positive actual days; d: decimal bank discount quote for the same interval. Not an effective annual or Treasury coupon-equivalent yield.',
    },
    repo_interest: {
      tex: String.raw`I_{\mathrm{repo}}=C\,r_{\mathrm{repo}}\frac{D}{360}`,
      variables:
        'C: cash advanced, not collateral face; r_repo: annual decimal financing rate; D: actual calendar days on Actual/360; I_repo: interest in the same currency as C. Assumes unchanged cash and rate with no fees or adjustments.',
    },
    yield_to_worst: {
      tex: String.raw`\mathrm{YTW}=\min\left(\mathrm{YTM},\mathrm{YTC}_1,\ldots,\mathrm{YTC}_n\right)`,
      variables:
        'YTM: yield to maturity; YTCᵢ: yield to an eligible call date and price. Use the same full price, settlement and yield conventions. The minimum covers specified non-default scenarios, not all possible realized returns.',
    },
    io_notional: {
      tex: String.raw`I_t=N_t\,c_t\,\alpha_t`,
      variables:
        'N_t: notional applicable to the accrual period; c_t: annual decimal class coupon; α_t: contractual year fraction; I_t: interest. The notional is not principal owed; use the class-specific allocation and accrual rules.',
    },
    futures_curve: {
      tex: String.raw`Q=100-R,\qquad r=\frac{R}{100}`,
      variables:
        'Q: IMM futures index quote; R: annualized rate in percentage points; r: decimal rate. At final SR3 settlement R is realized compounded SOFR for the reference quarter. The index quote is not a bond dollar price.',
    },
    pay_up: {
      tex: String.raw`\mathrm{PU}=P_{\mathrm{specified}}-P_{\mathrm{TBA}}`,
      variables:
        'PU: pay-up in clean-price points per $100 current face; P: comparable specified-pool and TBA clean prices at the same quotation time and settlement date. Not a yield spread or realized return.',
    },
    rolls: {
      tex: String.raw`D=P_{\mathrm{near}}-P_{\mathrm{far}}`,
      variables:
        'D: drop in price points per $100 current face; P: comparable clean TBA prices for near and far settlement. Not a percentage return or annualized rate.',
    },
    breakeven_inflation: {
      tex: String.raw`\mathrm{BE}\approx y_{\mathrm{nominal}}-y_{\mathrm{real}}`,
      variables:
        'Annual yields as decimals at comparable maturity and conventions; multiply the difference by 10,000 for basis points. Includes risk and liquidity compensation.',
    },
    curve_slope: {
      tex: String.raw`s_{\mathrm{bp}}=(y_{\mathrm{long}}-y_{\mathrm{short}})\times10^4`,
      variables:
        'Same currency, observation time and comparable yield conventions. A rise in this difference is steepening, even if the curve remains inverted.',
    },
    cltv: {
      tex: String.raw`\mathrm{CLTV}=\frac{B_{\mathrm{first}}+B_{\mathrm{subordinate}}}{V_{\mathrm{prescribed}}}`,
      variables:
        'Balances and prescribed property value are in the same currency. Use the program’s treatment of drawn HELOC balances; HCLTV substitutes full HELOC credit lines under the cited convention.',
    },
    conditional_default_rate: {
      tex: String.raw`\mathrm{CDR}=1-(1-\mathrm{MDR})^{12}`,
      variables:
        'MDR and CDR are decimal rates. Identify the default or liquidation event and eligible balance before annualizing.',
    },
    effective_convexity: {
      tex: String.raw`C_{\mathrm{eff}}\approx\frac{P_-+P_+-2P_0}{P_0(\Delta y)^2}`,
      variables:
        'P₋ / P₊: full prices after equal down / up parallel curve shifts at fixed OAS; P₀: base full price; Δy: positive rate shift as a decimal. With annual rates, convexity has units of years squared.',
    },
    cds_bond_basis: {
      tex: String.raw`b_{\mathrm{bp}}=s_{\mathrm{CDS,bp}}-s_{\mathrm{bond,bp}}`,
      variables:
        'b: basis; s: spread in basis points. Align reference entity, seniority, currency and maturity; identify the bond-spread method.',
    },
    excess_spread: {
      tex: String.raw`E_t=R_t-I_t-F_t-L_t`,
      variables:
        'E: excess income; R: collected finance charges and other income; I: certificate interest; F: servicing and other senior expenses; L: charge-offs. All amounts use the same currency and period t.',
    },
    dti: {
      tex: String.raw`\mathrm{DTI}=\frac{D_{\mathrm{monthly}}}{Y_{\mathrm{monthly}}}`,
      variables:
        'D: included monthly debt payments; Y: gross monthly income, in the same currency. Multiply the ratio by 100 for a percentage.',
    },
    fixed_arm: {
      tex: String.raw`r_{\mathrm{fully\ indexed}}=I_{\mathrm{contract}}+m`,
      variables:
        'I: contract index observation; m: margin; r: fully indexed rate. All are annual rates under the contract’s observation, lookback and rounding conventions. The actual reset rate can be constrained by caps or a floor.',
    },
    haircut: {
      tex: String.raw`h=1-\frac{C}{V}`,
      variables:
        'C: cash advanced; V: collateral market value, in the same currency; h: haircut as a decimal under this convention.',
    },
    real_return: {
      tex: String.raw`R_{\mathrm{real}}=\frac{1+R_{\mathrm{nominal}}}{1+\pi}-1`,
      variables:
        'R: holding-period return as a decimal; π: inflation over that same period. Returns and inflation must use a consistent horizon.',
    },
    total_return: {
      tex: String.raw`R=\frac{V_1+C_1-V_0}{V_0}`,
      variables:
        'V₀: starting security value; V₁: ending value of the remaining security; C₁: ending value of same-period cash received. Values use one currency and accrued-interest convention, and V₁ and C₁ do not overlap.',
    },
    expected_loss: {
      tex: String.raw`\mathrm{EL}=\mathrm{PD}\times\mathrm{LGD}\times\mathrm{EAD}`,
      variables:
        'PD: default probability; LGD: loss fraction conditional on default; EAD: exposure at default in currency. EL is a loan-level currency amount under consistent assumptions.',
    },
    principal_interest: {
      tex: String.raw`I_n=B_{n-1}r`,
      variables:
        'Iₙ: interest for month n; Bₙ₋₁: opening balance in dollars; r: monthly rate as a decimal.',
    },
    pool_factor: {
      tex: String.raw`B_t=B_0 f_t`,
      variables:
        'B₀: original face; Bₜ: current face, in the same currency; fₜ: dimensionless factor.',
    },
    smm: {
      tex: String.raw`\mathrm{SMM}=\frac{U}{B-S}`,
      variables:
        'U: unscheduled principal; B: opening balance; S: scheduled principal. Amounts cover the same month.',
    },
    cpr: {
      tex: String.raw`\begin{aligned}\mathrm{CPR}&=1-(1-\mathrm{SMM})^{12}\\\mathrm{SMM}&=1-(1-\mathrm{CPR})^{1/12}\end{aligned}`,
      variables:
        'CPR: annualized prepayment speed; SMM: monthly speed. Both are decimal rates.',
    },
    psa: {
      tex: String.raw`\mathrm{CPR}_m=k\min(0.002m,0.06)`,
      variables:
        'm: loan age in months; k: PSA percentage divided by 100. CPR is a decimal.',
    },
    wal: {
      tex: String.raw`\mathrm{WAL}=\frac{\sum_t t\,Q_t}{\sum_t Q_t}`,
      variables:
        'Qₜ: principal repaid at time t; t and WAL are in years. Interest is excluded.',
    },
    lock_in: {
      tex: String.raw`\Delta r=r_{\mathrm{new}}-r_{\mathrm{existing}}`,
      variables:
        'r: comparable annual mortgage rates, stated as decimals or percentage points. A positive Δr means the available replacement rate is higher; multiply a decimal difference by 10,000 for basis points.',
    },
    price: {
      tex: String.raw`V=B_t\frac{p}{100}`,
      variables:
        'Bₜ: current face in dollars; p: price points per 100; V: principal market value in dollars.',
    },
    pv: {
      tex: String.raw`P=\sum_{t=1}^{N}\frac{\mathrm{CF}_t}{(1+i)^t}`,
      variables:
        'CFₜ: payment at period t; i: yield per period as a decimal; N: number of periods; P: present value in the same currency.',
    },
    duration: {
      tex: String.raw`D_{\mathrm{eff}}\approx\frac{P_- - P_+}{2P_0\Delta y}`,
      variables:
        'P₋ / P₊: prices after down / up rate shocks; P₀: base price; Δy: positive annual yield shift as a decimal. Duration is expressed in years.',
    },
    dv01: {
      tex: String.raw`\mathrm{DV01}\approx V D\times10^{-4}`,
      variables:
        'V: market value; D: duration for the chosen rate shock. DV01 is currency per basis point.',
    },
    hedging: {
      tex: String.raw`n\approx\frac{\mathrm{DV01}_{\mathrm{exposure}}}{\mathrm{DV01}_{\mathrm{unit}}}`,
      variables:
        'n: hedge units in magnitude. Use the opposite signed exposure and consistent shock definitions.',
    },
    discount_factor: {
      tex: String.raw`P=\sum_t\mathrm{CF}(t)\,\mathrm{DF}(t)`,
      variables:
        'DF(t): dimensionless present value of one unit paid at t. CF(t) and P use the same currency.',
    },
    price_32nds: {
      tex: String.raw`\frac{1}{32}=0.03125\ \text{points}`,
      variables: 'One price point is one currency unit per 100 of face value.',
    },
    nominal_spread: {
      tex: String.raw`s_{\mathrm{bp}}=(y-y_b)\times10^4`,
      variables:
        'y: bond yield; yᵦ: benchmark yield, both decimal annual rates under comparable conventions. s is in basis points.',
    },
    oc: {
      tex: String.raw`\mathrm{OC}=\frac{A_{\mathrm{adjusted}}}{D_{\mathrm{covered}}}`,
      variables:
        'A: adjusted collateral balance; D: debt covered by the test, in the same currency. OC is a ratio.',
    },
    ic: {
      tex: String.raw`\mathrm{IC}=\frac{I_{\mathrm{available}}}{I_{\mathrm{due}}}`,
      variables:
        'Available and due interest refer to the classes and payment period specified by the transaction. IC is a ratio.',
    },
    noi: {
      tex: String.raw`\mathrm{NOI}=R-O`,
      variables:
        'R: property operating revenue; O: operating expenses over the same period; NOI: net operating income.',
    },
    dscr: {
      tex: String.raw`\mathrm{DSCR}=\frac{\mathrm{NOI}}{\mathrm{DS}}`,
      variables:
        'DS: debt service over the same period as NOI, in the same currency. DSCR is a ratio.',
    },
    ltv: {
      tex: String.raw`\mathrm{LTV}=\frac{B}{V}`,
      variables:
        'B: relevant loan balance; V: property value. Multiply the ratio by 100 for a percentage.',
    },
    cap_rate: {
      tex: String.raw`V\approx\frac{\mathrm{NOI}_{\mathrm{annual}}}{c}`,
      variables:
        'c: annual capitalization rate as a decimal; V: property value; NOI: annual stabilized net operating income.',
    },
    debt_yield: {
      tex: String.raw`\mathrm{DY}=\frac{\mathrm{NOI}_{\mathrm{annual}}}{B}`,
      variables: 'B: loan balance; DY: annual debt yield as a decimal.',
    },
    amortization: {
      tex: String.raw`M=\frac{B_0r(1+r)^N}{(1+r)^N-1}`,
      variables:
        'B₀: original balance; r: annual decimal note rate / 12; N: term in months; M: monthly principal-and-interest payment. At r = 0, M = B₀ / N.',
    },
    z_spread: {
      tex: String.raw`P_{\mathrm{dirty}}=\sum_i\mathrm{CF}_i e^{-(z_i+s)t_i}`,
      variables:
        'Illustrative continuous compounding: zᵢ is the zero rate for tᵢ years; s is a constant annual decimal spread. CFᵢ is fixed under the selected scenario.',
    },
    oas: {
      tex: String.raw`P_{\mathrm{dirty}}=\mathbb{E}^{\mathbb{Q}}\!\left[\sum_i\mathrm{CF}_i(\omega)D_i(\omega;s)\right]`,
      variables:
        'ω: modeled rate path; Q: pricing measure; CFᵢ(ω): path-dependent payment; Dᵢ(ω;s): path discount factor including OAS s. This is a schematic model relationship.',
    },
    g_spread: {
      tex: String.raw`s_G=y_{\mathrm{bond}}-y_{\mathrm{govt}}(T)`,
      variables:
        'T: stated comparison tenor; both yields use comparable annual conventions. Multiply a decimal spread by 10,000 for basis points.',
    },
    i_spread: {
      tex: String.raw`s_I=y_{\mathrm{bond}}-k_{\mathrm{swap}}(T)`,
      variables:
        'General bond-market convention used here. k: interpolated swap par rate at comparison tenor T; y: bond yield. Align currency and rate conventions; verify other product/provider labels separately.',
    },
    swap_spread: {
      tex: String.raw`s_{\mathrm{swap}}=k_{\mathrm{swap}}(T)-y_{\mathrm{govt}}(T)`,
      variables:
        'Comparable tenor T and same currency. The sign follows swap rate minus government yield.',
    },
    quoted_margin: {
      tex: String.raw`c_n=L_n+q`,
      variables:
        'cₙ: coupon rate for period n; Lₙ: contract reference rate; q: quoted margin. All are annual decimal rates before day-count accrual.',
    },
    spread_duration: {
      tex: String.raw`D_s\approx-\frac{1}{P}\frac{\Delta P}{\Delta s}`,
      variables:
        'P: base price; Δs: small annual decimal spread change; ΔP: corresponding price change with the benchmark curve held fixed.',
    },
  };

export type MortgageFormulas = Record<
  string,
  { html: string; tex: string; variables: string }
>;

export function render_mortgage_math(concept_id?: string): MortgageFormulas {
  return Object.fromEntries(
    mortgage_concepts
      .filter((c) => c.formula && (!concept_id || c.id === concept_id))
      .map((c) => {
        const math = mortgage_math[c.id];
        if (!math) throw new Error(`Missing TeX for ${c.id}`);
        return [
          c.id,
          {
            ...math,
            html: katex.renderToString(math.tex, {
              displayMode: true,
              output: 'htmlAndMathml',
              throwOnError: true,
              strict: 'error',
              trust: false,
            }),
          },
        ];
      }),
  );
}
