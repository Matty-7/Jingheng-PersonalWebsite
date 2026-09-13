# Mortgage Map

On September 12, 2026, Jingheng explicitly requested a public interactive knowledge map in a real Projects section. This is a separate educational reading project. The withdrawn experiment is not restored, redirected or reused.

## Content model

`content/mortgage_concepts.ts` integrates ten domains, the concept and relationship catalog, a public-reference registry and reading paths (derive current totals from the exported data). `content/atlas_extensions.ts` covers product/currency comparisons; `content/mortgage_mechanisms.ts` supplies the newer mechanisms and six explained paths. Add nodes through the data, keeping stable snake_case IDs. Every node needs an explanation, a meaningful misconception, a question and answer, an existing parent, labeled connections, and verified public sources. A formula needs units, timing and assumptions next to it. Graph-integrity tests catch missing targets and disconnected clusters.

The source registry was checked against public CFPB, Fannie Mae, New York Fed, SIFMA, SEC, FINRA and CME material on September 12, 2026. Historical research is used for concepts and conventions, not current market statistics. Public sources are linked, not mirrored. Numerical examples are small original arithmetic illustrations, not observed market or mortgage-pool data. No pricing engine, forecast or market feed is provided.

The source inventory did not recover a verifiable complete list of the owner's previously shared mortgage newsletters. Do not claim those articles have been integrated. Add an article only after reading the actual public source and attaching its URL to the relevant concepts. Never publish private screenshots, employer material, personal notes, restricted book PDFs or full newsletter text under this authorization.

## Interaction

The home entry remains between Channels and Music. The map now uses an explicit root → domain → topic → concept hierarchy. Overview, Topics and All concepts expose successive levels; selecting a domain or topic scopes the canvas. Search includes aliases and ranks exact concepts first. Connections reorganizes a selected concept and its incoming/outgoing relationships into a readable study, separate from the complete hierarchy. Causal mechanisms, definitions, measurements and comparisons are typed in the data. The old related-reading links remain associations and are not silently promoted to causal edges.

Visitors can drag empty map space, zoom with buttons, fit the map, focus a selection and navigate via a minimap. A larger expanded mode is available. Ordinary mouse-wheel scrolling remains native. Arrow keys pan a focused canvas, +/− zoom, and Home fits. List provides the same hierarchy without spatial navigation. The reader preserves formulas, distinctions, source links and self-checks. Normal reading uses the page scroll, including on small screens; the reader has no separate vertical scrollbar or fixed-height sheet. State is local to the page visit; no account, tracking or persistence is added.

Layout is deterministic, computed in `lib/mortgage_graph.ts`. Node boxes do not overlap at any hierarchy depth. Connection studies reveal every endpoint. A ResizeObserver measures the viewport, while camera math keeps zoom anchors stable. No graph library, force simulation, animation loop or pricing engine is added. KaTeX renders the catalog’s formulas on the server into HTML and MathML; only locally bundled styling/fonts and generated markup reach the page. Its parser is not imported into the client component. The homepage retains its lightweight static preview; the larger catalog stays in the map route’s separate bundle.

New public references include the Treasury curve methodology, New York Fed SOFR/ARRC material, FHFA lock-in research, OCC commercial-property lending guidance, CREFC definitions and a CLO coverage-test primer. Coverage tests are explicitly conditional on a deal using them; the map does not imply every MBS has OC/IC triggers. Original financial explanations were reviewed for direction, assumptions and source fit.

## Boundaries and validation

Keep the old route returning 404 with noindex and absent from links and sitemap. The new route is `/portfolio/mortgage-map`, with its own metadata and sitemap entry. Existing publishing privacy checks still apply. Do not change deployment gates to accommodate this project.

Required checks: lint, TypeScript, tests, content checker, supported production build and exact-head Site checks CI. Browser QA must distinguish actual preview interactions from production HTTP verification. Do not infer employer clearance from public-source status.

The running calculator, component, math implementation, tests and document were already removed from main. This task also removed its three local working branches and six local archive/commit intermediates. The experiment shared the personal website's repository; there was no separate repository to delete. Available native tools do not provide removal of GitHub historical commits/PRs/remote branches or old Sites versions. No complete history-erasure claim is made and the website repository itself is preserved.

## September 12: comparison and mathematical reading revision

Accepted critic findings ATLAS-01 (edge geometry and chrome overlap), ATLAS-02 (plain-string formulas), and ATLAS-03 (spread/product/currency coverage).

The hierarchy has no analytical arrows. Connections uses one geometric lane per selected-neighbor pair and routes labels on dedicated outer-node lanes. Since the September 13 correction, the reader retains every relationship; an aggregate lane labels the count and opens the full explanation panel. Mixed or opposite-direction relationships do not share an unexplained one-way arrow. Comparison edges use a dashed line without a causal arrow. Caption and navigation/minimap occupy separate rows outside the clipped interactive canvas. Camera and entry transitions last 200–240ms, are disabled while dragging where appropriate, and respect reduced motion. Selecting a concept preserves a ready topic layout; searching outside it focuses the new concept’s topic.

Compare offers spread, product, currency and time/maturity tables. Rows open the same sourced reader and connections used by the graph. Mobile tables become labeled comparison cards. Fifteen spread measures distinguish benchmark, projected cash flows, options, use and caveats. Product dimensions distinguish collateral, guarantee, structure and coupon; the catalog includes RMBS, CMBS, ABS, CLO, CRT, covered, sovereign, corporate, municipal, zero-coupon, inflation-linked and callable debt. Six currency profiles distinguish policy context, overnight/term references and observation conventions. This is conceptual coverage, without live levels. HPI/HPA, caps/floors, securitization roles and reverse-mortgage balance behavior bring additional useful note themes into the public catalog.

New original explanations link to public benchmark administrators, central banks, SEC, Treasury, FHFA, CFPB, Fannie Mae, CFA Institute, LSEG, BIS and EUR-Lex. Internal identifiers and implementation mappings are not part of the public guide. The guide does not represent a complete inventory of every country, product or spread convention.

Validation additionally renders every formula in strict mode with MathML, checks comparison targets and dimensions, and checks every connection label against all node rectangles and other labels. Browser acceptance covers desktop comparison/reader/Connections and a 390px CSS viewport; this is not physical-device or assistive-technology testing.

## September 12: mechanisms and reading navigation

Accepted MODEL-01 adds an independent Portfolio navigation link. MODEL-02 removes duplicate introductory slogans and leaves OAS as the single search example; the Burnout concept remains. MODEL-03 adds a prominent Paths view alongside Map, Compare, Connections and List.

Six new paths explain policy transmission, rate locks and TBA hedging, repo liquidity, return decomposition, residual hedge risk and the allocation of collateral losses. Each new path has a premise, an explanation for every step and explicit limits. Return decomposition is identified as complementary analytical components, not a causal chain. Existing paths remain accessible and reuse their authored relationship explanations.

The 24 additional concepts cover affordability, DTI, refinance access, assumptions, current coupon, primary–secondary spread, origination, funding, returns, monetary transmission and credit assessment. They connect to existing seasonality, turnover, burnout, rate, prepayment and structural concepts. Four additional formulas bring the total to 33, including loan-level expected loss with an explicit restriction against using it as a tranche-loss formula. No private newsletter text, undocumented employer conventions or new pricing engine is included.

Concepts have validated `#concept=id` links. The address updates without filling browser history with every reading click; the reader has a separate bounded session-only Back/Forward trail. Opening a different concept after Back discards the forward branch. Direct links restore the reader and Connections view. Copy link uses the user-initiated clipboard API with an address-bar fallback. No persistent visitor storage is added. Path steps open the same reader; Previous/Next path controls retain the path context.

Validation covers path explanation completeness, link parsing and bounded history, as well as existing graph, math and publishing checks. Preview inspection targets the independent navigation, compact framing, Paths, reader history, direct links, math and responsive layout. Production HTTP results are recorded separately after deployment.


## September 13: relationship and learning correction

Analytical relationships are authored separately from suggested reading. The mechanism module now uses explicit typed edges; its 84-edge semantic review reversed 14 relationships, corrected categories and labels, and removed eight redundant or misleading reverse links. This was a direction/type audit, not an independent re-verification of every financial source in the catalog.

`content/mortgage_relationships.ts` connects the 17 previously isolated concepts with authored links, conditions and public-source IDs. The schema permits relationship-level `conditions` and `sources`; older entries can acquire these incrementally. Do not infer causality from a reading recommendation or add arbitrary edges to satisfy coverage tests.

`study_edges` returns every incident relationship. `connection_lanes` aggregates geometry without discarding explanations. The reader’s `MortgageRelations` component displays direction, type, reason and any relationship-specific conditions and source links. `MortgageCheck` reveals answers only after a separate action and remounts for each concept, including history navigation.

A low-zoom or expanded-depth Map displays a fixed-size domain/topic/concept navigator in normal document flow. The complete diagram remains an overview; the navigator allows readers to reach a concept without clicking microscopic nodes. Existing List, search, pan, zoom, minimap and reading history remain available. Browser acceptance includes the OAS/Z-spread reading task at desktop and 390px, answer reveal/reset and aggregated relationships.

## September 13: reading flow and curve context

Normal reader, List, Paths, Compare and the mobile concept directory use document flow. Spatial views alone can stay alongside the reader on desktop. Sources end with natural padding rather than a minimum-height blank panel. Expanded mode has one scrolling atlas, a visible exit control, contained keyboard focus and a restored background scroll state on exit. Wide tables and formulas retain horizontal overflow where needed.

`content/mortgage_context.ts` adds public date/quote context, original versus remaining maturity, nominal tenor labels, curve nodes and interpolation, constant-maturity references, Term SOFR, SOFR futures strips and Treasury STRIPS. Dates and Curves comparisons complement the existing maturity and currency tables. Tenor examples belong to named sources and measures; they are not universal provider or currency grids. Unverified internal abbreviations and employer-specific schemas are excluded.

New typed, sourced and conditional relationships join SMM/CPR and PSA/WALA to prepayment analysis, and benchmark matching to nominal yield spreads. The analytical-connectivity test now traverses `mortgage_relationships` separately from reading links, including a bridge-removal case whose isolated nodes still have neighbors. One connected component is a coverage check, not proof that every financial relationship has been independently verified.


## Interaction state and stylesheet ownership

`lib/mortgage_state.ts` owns view, reader, history, hierarchy filters, paths and comparison selection through semantic reducer actions. History traversal moves the existing cursor without recording another visit; a new selection after Back replaces only the forward branch. The component retains camera/pointer handling, URL and clipboard effects, and DOM focus/scroll. `useAtlasExpansion` continues to own modal containment and focus restoration. A valid concept URL opens the concept title in Connections.

Escape closes a visible search-results panel first, preserving the search text and focus. Subsequent Escape closes the reader, then the expanded map. Empty queries have no results panel and retain the existing reader/expanded sequence. The shared browser journey checks matching, empty and no-result searches in all three viewports.

`mortgage_map.css` is the ordered entry point for seven sections in `styles/`: foundation/paths, navigation, canvas, reader/lists, responsive rules, expanded canvas and comparisons. Their concatenation preserves the previous stylesheet byte-for-byte, including media queries and later overrides. Keep that order when editing; splitting these files does not introduce cascade layers or a new visual system. Global homepage styling remains separately owned.
