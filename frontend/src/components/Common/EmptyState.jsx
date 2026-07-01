// Tells the person what's missing and what to do about it, instead of a blank table.
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
    {Icon ? (
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>
    ) : null}
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
    {action ? <div className="mt-3">{action}</div> : null}
  </div>
);

export default EmptyState;
