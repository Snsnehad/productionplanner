import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getPlan, updatePlanStatus } from "../api/plans";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import StockBar from "../components/Common/StockBar.jsx";
import Spinner from "../components/Common/Spinner.jsx";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const NEXT_STATUS = {
  draft: ["approved", "cancelled"],
  approved: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["plan", id], queryFn: () => getPlan(id) });

  const statusMutation = useMutation({
    mutationFn: updatePlanStatus,
    onSuccess: () => {
      toast.success("Plan status updated");
      queryClient.invalidateQueries({ queryKey: ["plan", id] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  if (isLoading) return <Spinner />;
  if (!data) return null;

  const { plan, materials } = data;
  const nextOptions = NEXT_STATUS[plan.status] || [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to="/plans" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} />
        Back to plans
      </Link>

      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="figure text-sm text-slate-400">{plan.planNumber}</p>
            <h2 className="font-display text-lg font-semibold text-slate-900">{plan.planName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {plan.department} &middot; {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
            </p>
          </div>
          <StatusBadge status={plan.status} />
        </div>

        {plan.description && <p className="mt-4 text-sm text-slate-600">{plan.description}</p>}

        {nextOptions.length > 0 && (
          <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
            {nextOptions.map((s) => (
              <button
                key={s}
                onClick={() => statusMutation.mutate({ id: plan._id, status: s })}
                disabled={statusMutation.isPending}
                className={s === "cancelled" ? "btn-danger" : "btn-primary"}
              >
                Mark as {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Required Materials</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Required Qty</th>
                <th className="px-5 py-3">Reserved Qty</th>
                <th className="px-5 py-3">Shortage Qty</th>
                <th className="px-5 py-3">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((pm) => (
                <tr key={pm._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{pm.materialId?.materialName}</p>
                    <p className="figure text-xs text-slate-400">{pm.materialId?.materialCode}</p>
                  </td>
                  <td className="figure px-5 py-3 text-slate-600">{pm.requiredQty} {pm.materialId?.unit}</td>
                  <td className="figure px-5 py-3 text-slate-600">{pm.reservedQty} {pm.materialId?.unit}</td>
                  <td className={`figure px-5 py-3 font-semibold ${pm.shortageQty > 0 ? "text-red-600" : "text-slate-400"}`}>
                    {pm.shortageQty} {pm.materialId?.unit}
                  </td>
                  <td className="px-5 py-3"><StockBar required={pm.requiredQty} available={pm.reservedQty} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
