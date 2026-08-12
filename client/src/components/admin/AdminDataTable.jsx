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
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDataTable({
  title,
  subtitle,
  columns,
  data = [],
  onView,
  onEdit,
  onDelete,
  onCreate,
  createLabel = "Add New",
  searchPlaceholder = "Search records...",
  filterOptions = [], // e.g. [{ key: 'isActive', label: 'Status', options: [{ label: 'Active', value: true }, { label: 'Inactive', value: false }] }]
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Handle Search & Filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Global text search across stringable fields
      const matchesSearch = searchTerm === '' || Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase());
        return String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });

      // Filter options matching
      const matchesFilters = Object.entries(activeFilters).every(([key, filterVal]) => {
        if (filterVal === undefined || filterVal === 'ALL') return true;
        return item[key] === filterVal;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, activeFilters]);

  // Handle Sorting
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

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((d) => d._id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 focus:border-[#c9a96e] transition-all"
            />
          </div>

          {/* Dynamic Filter Dropdowns */}
          {filterOptions.map((filter) => (
            <div key={filter.key} className="relative">
              <select
                value={activeFilters[filter.key] ?? 'ALL'}
                onChange={(e) => {
                  const val = e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value;
                  setActiveFilters((prev) => ({ ...prev, [filter.key]: val }));
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/40 transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All {filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}

          {/* Action Button */}
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-[#c9a96e] transition-colors duration-200 flex items-center gap-1.5 shadow-sm active:scale-98"
            >
              <Plus size={14} />
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Selected rows action bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#f0e4cc]/40 px-5 py-2.5 border-b border-[#c9a96e]/30 flex items-center justify-between text-xs text-gray-900 font-medium"
          >
            <span>{selectedIds.length} item(s) selected</span>
            <button
              onClick={() => {
                if (onDelete) selectedIds.forEach((id) => onDelete(id));
                setSelectedIds([]);
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 size={13} />
              Delete Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10 text-center">
                <button
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {selectedIds.length > 0 && selectedIds.length === paginatedData.length ? (
                    <CheckSquare size={16} className="text-[#c9a96e]" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`py-3.5 px-4 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-900' : ''}`}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortColumn === col.key && (
                      sortDirection === 'asc' ? <ChevronUp size={13} className="text-[#c9a96e]" /> : <ChevronDown size={13} className="text-[#c9a96e]" />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row._id);
                return (
                  <tr
                    key={row._id}
                    className={`hover:bg-amber-50/30 transition-colors ${isSelected ? 'bg-amber-50/50' : ''}`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => toggleSelectRow(row._id)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {isSelected ? <CheckSquare size={16} className="text-[#c9a96e]" /> : <Square size={16} />}
                      </button>
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3.5 px-4">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            title="View Details"
                            className="p-1.5 text-gray-500 hover:text-[#c9a96e] hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit Entry"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row._id)}
                            title="Delete Entry"
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={28} className="text-gray-300 stroke-[1.5]" />
                    <p className="font-medium text-sm text-gray-500">No records found</p>
                    <p className="text-xs text-gray-400">Try adjusting your filter or search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination */}
      <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-gray-800">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-gray-800">{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
            <strong className="text-gray-800">{filteredData.length}</strong> results
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-gray-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-md py-1 px-1.5 text-xs text-gray-700 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsLeft size={15} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="px-3 font-semibold text-gray-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
