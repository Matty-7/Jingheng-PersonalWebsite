// The comparison table scroll container must be reachable by keyboard.
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { ArrowUpRight } from 'lucide-react';
import { atlas_comparisons } from '@/content/atlas_extensions';
import { spread_groups } from '@/content/mortgage_spreads';

export function MortgageComparison({
  comparison_id,
  spread_group,
  selected,
  reader_open,
  choose_comparison,
  filter_spreads,
  choose_concept,
}: {
  comparison_id: string;
  spread_group: string;
  selected: string | null;
  reader_open: boolean;
  choose_comparison: (id: string) => void;
  filter_spreads: (id: string) => void;
  choose_concept: (id: string, trigger?: HTMLButtonElement) => void;
}) {
  const comparison = atlas_comparisons.find((c) => c.id === comparison_id)!;
  const active_spread_group = spread_groups.find((g) => g.id === spread_group)!;
  const comparison_rows =
    comparison_id === 'spreads' && spread_group !== 'all'
      ? comparison.rows.filter((r) =>
          active_spread_group.concepts.includes(r.id),
        )
      : comparison.rows;
  return (
    <div className="atlas-comparison" aria-label="Financial comparisons">
      <div className="atlas-comparison-tabs" aria-label="Comparison subject">
        {atlas_comparisons.map((item) => (
          <button
            key={item.id}
            aria-pressed={comparison_id === item.id}
            onClick={() => {
              choose_comparison(item.id);
            }}
          >
            {item.id === 'spreads'
              ? 'Spreads'
              : item.id === 'products'
                ? 'Products'
                : item.id === 'maturities'
                  ? 'Time & maturity'
                  : item.id === 'dates'
                    ? 'Dates'
                    : item.id === 'curves'
                      ? 'Curves'
                      : item.id === 'metrics'
                        ? 'Metrics'
                        : 'Currencies'}
          </button>
        ))}
      </div>
      <div className="atlas-comparison-heading" key={comparison.id}>
        <span className="atlas-kicker">{comparison.eyebrow}</span>
        <h2>{comparison.title}</h2>
        <p>{comparison.intro}</p>
      </div>
      {comparison_id === 'spreads' && (
        <div className="atlas-spread-filters" aria-label="Spread families">
          {spread_groups.map((group) => (
            <button
              key={group.id}
              aria-pressed={spread_group === group.id}
              onClick={() => {
                filter_spreads(group.id);
              }}
            >
              {group.title}
            </button>
          ))}
          <output aria-live="polite">{comparison_rows.length} measures</output>
        </div>
      )}
      <section
        className="atlas-table-scroll"
        tabIndex={0}
        aria-label={`${comparison.id} comparison table`}
      >
        <table className="atlas-comparison-table">
          <caption className="sr-only">
            {comparison.title} Select a measure to read its definition and
            connections.
          </caption>
          <thead>
            <tr>
              {comparison.columns.map((col) => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison_rows.map((row) => (
              <tr
                key={row.id}
                className={
                  selected === row.id && reader_open ? 'is-selected' : ''
                }
              >
                <th scope="row">
                  <button
                    aria-label={`Read ${row.cells[0]}`}
                    onClick={(e) => choose_concept(row.id, e.currentTarget)}
                  >
                    {row.cells[0]}
                    <ArrowUpRight size={14} />
                  </button>
                </th>
                {row.cells.slice(1).map((cell, i) => (
                  <td key={i} data-label={comparison.columns[i + 1]}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="atlas-comparison-note">
        <span>THE DISTINCTION THAT MATTERS</span>
        <p>{comparison.takeaway}</p>
      </div>
    </div>
  );
}
