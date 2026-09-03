import React, { useState, useMemo } from 'react';
import { dark } from '../theme';

/**
 * Reusable sortable table with sticky first column, filters, and mobile behavior.
 * Uses dark theme semantic tokens — no inline hex values.
 *
 * Migration candidates (MLB pages): PlayerProjectionsPage, EdgeReportPage,
 * BatterSplitsPage, StartingLineupsPage.
 */
export default function SortableTable({
  columns = [],
  data = [],
  defaultSort = {},
  filters = [],
  searchKey,
  searchPlaceholder = 'Search...',
  lastRefreshed,
  emptyMessage = 'No data available',
  loading = false,
  stickyFirst = true,
}) {
  const [sortBy, setSortBy] = useState(defaultSort.key || '');
  const [sortOrder, setSortOrder] = useState(defaultSort.order || 'desc');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState(
    Object.fromEntries(filters.map(f => [f.key, f.all || 'All']))
  );

  const handleSort = (key) => {
    if (!columns.find(c => c.key === key)?.sortable) return;
    if (sortBy === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const filtered = useMemo(() => {
    let rows = [...data];
    for (const f of filters) {
      const val = filterState[f.key];
      if (val && val !== 'All') {
        rows = rows.filter(r => String(r[f.key]) === val);
      }
    }
    if (search && searchKey) {
      const q = search.toLowerCase();
      rows = rows.filter(r => String(r[searchKey] || '').toLowerCase().includes(q));
    }
    if (sortBy) {
      rows.sort((a, b) => {
        const va = a[sortBy], vb = b[sortBy];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortOrder === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va), sb = String(vb);
        return sortOrder === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }
    return rows;
  }, [data, filterState, search, searchKey, sortBy, sortOrder, filters]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px 20px', color: dark.textSecondary }}>Loading...</div>;
  }

  return (
    <div>
      {/* Control bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
        padding: '12px 16px', background: dark.surfaceBg, borderRadius: '8px', marginBottom: '12px',
      }}>
        {filters.map(f => (
          <select
            key={f.key}
            value={filterState[f.key]}
            onChange={e => setFilterState(s => ({ ...s, [f.key]: e.target.value }))}
            style={{
              background: dark.inputBg, color: dark.inputText, border: `1px solid ${dark.inputBorder}`,
              padding: '6px 10px', borderRadius: '4px', fontSize: '13px',
            }}
          >
            <option value="All">{f.label}: All</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {searchKey && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: dark.inputBg, color: dark.inputText, border: `1px solid ${dark.inputBorder}`,
              padding: '6px 10px', borderRadius: '4px', fontSize: '13px', minWidth: '180px',
            }}
          />
        )}
        <span style={{ color: dark.textSecondary, fontSize: '12px', marginLeft: 'auto' }}>
          {filtered.length} rows
          {lastRefreshed && ` | Updated ${lastRefreshed}`}
        </span>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: dark.textSecondary }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${dark.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{
                      padding: '10px 12px',
                      textAlign: col.align || 'left',
                      background: dark.surfaceBg,
                      color: sortBy === col.key ? dark.borderAccent : dark.textPrimary,
                      cursor: col.sortable ? 'pointer' : 'default',
                      fontWeight: 700, fontSize: '12px', textTransform: 'uppercase',
                      letterSpacing: '0.5px', whiteSpace: 'nowrap',
                      borderBottom: `2px solid ${dark.borderAccent}`,
                      position: stickyFirst && i === 0 ? 'sticky' : undefined,
                      left: stickyFirst && i === 0 ? 0 : undefined,
                      zIndex: stickyFirst && i === 0 ? 2 : undefined,
                      minWidth: col.width,
                      maxWidth: stickyFirst && i === 0 ? '140px' : undefined,
                      borderRight: stickyFirst && i === 0 ? `2px solid ${dark.borderAccent}` : undefined,
                    }}
                  >
                    {col.label}
                    {col.sortable && sortBy === col.key && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => {
                const rowBg = ri % 2 === 0 ? dark.surfaceBgAlt : dark.surfaceBg;
                return (
                  <tr key={ri} style={{ background: rowBg }}>
                    {columns.map((col, ci) => {
                      const val = row[col.key];
                      const display = col.format ? col.format(val, row) : (val ?? '—');
                      return (
                        <td
                          key={col.key}
                          style={{
                            padding: '8px 12px',
                            textAlign: col.align || 'left',
                            color: dark.textPrimary,
                            whiteSpace: 'nowrap',
                            borderBottom: `1px solid ${dark.border}`,
                            position: stickyFirst && ci === 0 ? 'sticky' : undefined,
                            left: stickyFirst && ci === 0 ? 0 : undefined,
                            background: stickyFirst && ci === 0 ? rowBg : undefined,
                            zIndex: stickyFirst && ci === 0 ? 1 : undefined,
                            maxWidth: stickyFirst && ci === 0 ? '140px' : undefined,
                            overflow: stickyFirst && ci === 0 ? 'hidden' : undefined,
                            textOverflow: stickyFirst && ci === 0 ? 'ellipsis' : undefined,
                            borderRight: stickyFirst && ci === 0 ? `2px solid ${dark.borderAccent}` : undefined,
                          }}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
