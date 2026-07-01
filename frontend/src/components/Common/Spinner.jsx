const Spinner = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
    {label}
  </div>
);

export default Spinner;
