import React, { useState, useMemo } from 'react';
import { colors } from '../theme';

/**
 * Reusable sortable table with sticky first column, filters, and mobile behavior.
 *
 * Props:
 *   columns:    [{ key, label, sortable?, align?, format?, width? }]
 *   data:       array of row objects
 *   defaultSort: { key, order: 'asc'|'desc' }
 *   filters:    [{ key, label, options: [{ value, label }], all? }]
 *   searchKey:  field to search on (string)
 *   searchPlaceholder: string
 *   lastRefreshed: ISO timestamp or human-readable string
 *   emptyMessage: string shown when no data
 *   loading:    boolean
 *   stickyFirst: boolean (default true)
 *
 * Migration candidates (MLB pages): PlayerProjectionsPage, EdgeReportPage,
 * BatterSplitsPage, StartingLineupsPage. These all share: sortable columns,
 * team dropdown, search box, sticky first column, loading/error state.
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

    // Apply filters
    for (const f of filters) {
      const val = filterState[f.key];
      if (val && val !== 'All') {
        rows = rows.filter(r => String(r[f.key]) === val);
      }
    }

    // Apply search
    if (search && searchKey) {
      const q = search.toLowerCase();
      rows = rows.filter(r => String(r[searchKey] || '').toLowerCase().includes(q));
    }

    // Apply sort
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
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textMuted }}>
        Loading...
      </div>
    );
  }

  const controlBarStyle = {
    display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
    padding: '12px 16px', background: colors.navyLight, borderRadius: '8px',
    marginBottom: '12px',
  };
  const selectStyle = {
    background: colors.navy, color: colors.text, border: `1px solid ${colors.green}`,
    padding: '6px 10px', borderRadius: '4px', fontSize: '13px',
  };
  const inputStyle = {
    ...selectStyle, minWidth: '180px',
  };

  return (
    <div>
      {/* Control bar */}
      <div style={controlBarStyle}>
        {filters.map(f => (
          <select
            key={f.key}
            value={filterState[f.key]}
            onChange={e => setFilterState(s => ({ ...s, [f.key]: e.target.value }))}
            style={selectStyle}
          >
            <option value="All">{f.label}: All</option>
            {f.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}
        {searchKey && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
        )}
        <span style={{ color: colors.textMuted, fontSize: '12px', marginLeft: 'auto' }}>
          {filtered.length} rows
          {lastRefreshed && ` | Updated ${lastRefreshed}`}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${colors.navyLight}` }}>
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
                      background: colors.navyLight,
                      color: sortBy === col.key ? colors.green : colors.text,
                      cursor: col.sortable ? 'pointer' : 'default',
                      fontWeight: 700,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      borderBottom: `2px solid ${colors.green}`,
                      position: stickyFirst && i === 0 ? 'sticky' : undefined,
                      left: stickyFirst && i === 0 ? 0 : undefined,
                      zIndex: stickyFirst && i === 0 ? 2 : undefined,
                      minWidth: col.width,
                      maxWidth: stickyFirst && i === 0 ? '140px' : undefined,
                      borderRight: stickyFirst && i === 0 ? `2px solid ${colors.green}` : undefined,
                    }}
                  >
                    {col.label}
                    {col.sortable && sortBy === col.key && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? colors.navy : colors.navyLight }}>
                  {columns.map((col, ci) => {
                    const val = row[col.key];
                    const display = col.format ? col.format(val, row) : (val ?? '—');
                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '8px 12px',
                          textAlign: col.align || 'left',
                          color: colors.text,
                          whiteSpace: 'nowrap',
                          borderBottom: `1px solid ${colors.navyLight}`,
                          position: stickyFirst && ci === 0 ? 'sticky' : undefined,
                          left: stickyFirst && ci === 0 ? 0 : undefined,
                          background: stickyFirst && ci === 0
                            ? (ri % 2 === 0 ? colors.navy : colors.navyLight)
                            : undefined,
                          zIndex: stickyFirst && ci === 0 ? 1 : undefined,
                          maxWidth: stickyFirst && ci === 0 ? '140px' : undefined,
                          overflow: stickyFirst && ci === 0 ? 'hidden' : undefined,
                          textOverflow: stickyFirst && ci === 0 ? 'ellipsis' : undefined,
                          borderRight: stickyFirst && ci === 0 ? `2px solid ${colors.green}` : undefined,
                        }}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
