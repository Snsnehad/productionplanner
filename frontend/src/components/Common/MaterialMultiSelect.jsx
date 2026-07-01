import { useState } from "react";
import { ChevronDown, X, Search } from "lucide-react";

// Lets the user pick multiple materials from one dropdown instead of
// adding rows one at a time. Selected materials show as removable chips.
const MaterialMultiSelect = ({ materials = [], selectedIds = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = materials.filter((m) =>
    `${m.materialName} ${m.materialCode}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id) => onChange(selectedIds.filter((x) => x !== id));

  const selectedMaterials = materials.filter((m) => selectedIds.includes(m._id));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="field-input flex min-h-[44px] w-full flex-wrap items-center gap-1.5 text-left"
      >
        {selectedMaterials.length === 0 ? (
          <span className="text-slate-400">Select materials...</span>
        ) : (
          selectedMaterials.map((m) => (
            <span
              key={m._id}
              className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800"
            >
              {m.materialName}
              <X
                size={12}
                className="cursor-pointer hover:text-teal-900"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(m._id);
                }}
              />
            </span>
          ))
        )}
        <ChevronDown size={15} className="ml-auto shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          {/* Invisible backdrop closes the panel on outside click */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute z-40 mt-1.5 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Search materials..."
                  className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-1.5">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-slate-400">No materials found</p>
              ) : (
                filtered.map((m) => {
                  const checked = selectedIds.includes(m._id);
                  const available = m.currentStock - m.reservedStock;
                  return (
                    <label
                      key={m._id}
                      onClick={(e) => e.stopPropagation()}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(m._id)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600/30"
                      />
                      <span className="flex-1">
                        <span className="font-medium text-slate-800">{m.materialName}</span>
                        <span className="figure ml-1.5 text-xs text-slate-400">{m.materialCode}</span>
                      </span>
                      <span className="figure text-xs text-slate-400">{available} {m.unit} avail.</span>
                    </label>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-md py-1.5 text-center text-sm font-medium text-teal-700 hover:bg-teal-50"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialMultiSelect;
