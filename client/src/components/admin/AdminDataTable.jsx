import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Inline Delete Confirmation Component ──────────────────────────────────────
function DeleteConfirmPopover({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.14 }}
      className="absolute right-0 top-9 z-20 w-52 bg-white rounded-xl shadow-xl border border-gray-100 p-3"
    >
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 font-medium leading-snug">
          Delete this record? This action cannot be undone.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
        >
          Delete
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminDataTable({
  title,
  subtitle,
  columns,
  data = [],
  onView,
  onEdit,
  onDelete,
  onCreate,
  createLabel = 'Add New',
  searchPlaceholder = 'Search records...',
  filterOptions = [],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ── Filter & Search ────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase());
          return String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });

      const matchesFilters = Object.entries(activeFilters).every(([key, filterVal]) => {
        if (filterVal === undefined || filterVal === 'ALL') return true;
        return item[key] === filterVal;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, activeFilters]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn] ?? '';
      const bVal = b[sortColumn] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else { setSortColumn(null); setSortDirection('asc'); }
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === paginatedData.length ? [] : paginatedData.map((d) => d._id)
    );
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== undefined && v !== 'ALL'
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Header Controls ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Search bar */}
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Filter Dropdowns */}
          {filterOptions.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={activeFilters[filter.key] ?? 'ALL'}
                onChange={(e) => {
                  const raw = e.target.value;
                  const val = raw === 'true' ? true : raw === 'false' ? false : raw;
                  setActiveFilters((prev) => ({ ...prev, [filter.key]: val }));
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setActiveFilters({}); setCurrentPage(1); }}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}

          {/* Create Button */}
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-gray-950 text-white text-xs font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors duration-200 flex items-center gap-1.5 shadow-sm active:scale-[0.97]"
            >
              <Plus size={14} />
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Selected rows action bar ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="bg-[#c9a96e]/8 px-5 py-2.5 border-b border-[#c9a96e]/20 flex items-center justify-between text-xs text-gray-900 font-medium">
              <span className="font-semibold">
                <span className="text-[#c9a96e]">{selectedIds.length}</span> item{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Deselect all
                </button>
                {onDelete && (
                  <button
                    onClick={() => {
                      selectedIds.forEach((id) => onDelete(id));
                      setSelectedIds([]);
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Delete selected
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
              <th className="py-3 px-4 w-10 text-center">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {selectedIds.length > 0 && selectedIds.length === paginatedData.length ? (
                    <CheckSquare size={15} className="text-[#c9a96e]" />
                  ) : (
                    <Square size={15} />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`py-3 px-4 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortColumn === col.key && (
                      sortDirection === 'asc'
                        ? <ChevronUp size={12} className="text-[#c9a96e]" />
                        : <ChevronDown size={12} className="text-[#c9a96e]" />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row._id);
                return (
                  <tr
                    key={row._id}
                    className={`hover:bg-gray-50 transition-colors group relative ${isSelected ? 'bg-[#c9a96e]/4' : ''}`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleSelectRow(row._id)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare size={15} className="text-[#c9a96e]" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3.5 px-4 align-middle">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View Details"
                            className="p-1.5 text-gray-400 hover:text-[#c9a96e] hover:bg-[#c9a96e]/10 rounded-lg transition-all"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <div className="relative">
                            <button
                              onClick={() => setConfirmDeleteId(row._id)}
                              title="Delete"
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                            <AnimatePresence>
                              {confirmDeleteId === row._id && (
                                <DeleteConfirmPopover
                                  onConfirm={() => {
                                    onDelete(row._id);
                                    setConfirmDeleteId(null);
                                  }}
                                  onCancel={() => setConfirmDeleteId(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Search size={22} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-500">No records found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filter criteria</p>
                    </div>
                    {(searchTerm || activeFilterCount > 0) && (
                      <button
                        onClick={() => { setSearchTerm(''); setActiveFilters({}); }}
                        className="text-xs font-semibold text-[#c9a96e] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer & Pagination ────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/40">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            Showing{' '}
            <span className="font-bold text-gray-800">
              {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>
            {' – '}
            <span className="font-bold text-gray-800">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span>
            {' of '}
            <span className="font-bold text-gray-800">{filteredData.length}</span> results
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-gray-200 rounded-lg py-1 px-2 text-xs text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[
            { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1, label: 'First' },
            { icon: ChevronLeft, action: () => setCurrentPage((p) => Math.max(p - 1, 1)), disabled: currentPage === 1, label: 'Prev' },
          ].map(({ icon: Icon, action, disabled, label }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              <Icon size={14} />
            </button>
          ))}

          <span className="px-3 text-xs font-bold text-gray-700">
            {currentPage} / {totalPages}
          </span>

          {[
            { icon: ChevronRight, action: () => setCurrentPage((p) => Math.min(p + 1, totalPages)), disabled: currentPage === totalPages, label: 'Next' },
            { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages, label: 'Last' },
          ].map(({ icon: Icon, action, disabled, label }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
