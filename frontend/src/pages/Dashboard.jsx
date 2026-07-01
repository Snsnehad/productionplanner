import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarRange, AlertTriangle, BellRing, BellOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { getDashboardSummary, getUpcomingPlans, getShortages } from "../api/dashboard";
import { acknowledgeNotification, resolveNotification } from "../api/notifications";
import SummaryCard from "../components/Common/SummaryCard.jsx";
import StatusBadge from "../components/Common/StatusBadge.jsx";
import StockBar from "../components/Common/StockBar.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const { data: upcomingPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["dashboard-upcoming-plans"],
    queryFn: getUpcomingPlans,
  });

  const { data: shortages, isLoading: shortagesLoading } = useQuery({
    queryKey: ["dashboard-shortages"],
    queryFn: getShortages,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-shortages"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const ackMutation = useMutation({
    mutationFn: acknowledgeNotification,
    onSuccess: () => { toast.success("Acknowledged — reminders paused"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to acknowledge"),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveNotification,
    onSuccess: () => { toast.success("Resolved — reminders stopped"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to resolve"),
  });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Upcoming Plans"
          value={summaryLoading ? "—" : summary?.upcomingPlans ?? 0}
          icon={CalendarRange}
          accent="teal"
        />
        <SummaryCard
          label="Material Shortages"
          value={summaryLoading ? "—" : summary?.materialShortages ?? 0}
          icon={AlertTriangle}
          accent="red"
        />
        <SummaryCard
          label="Pending Notifications"
          value={summaryLoading ? "—" : summary?.pendingNotifications ?? 0}
          icon={BellRing}
          accent="amber"
        />
        <SummaryCard
          label="Resolved Notifications"
          value={summaryLoading ? "—" : summary?.resolvedNotifications ?? 0}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      {/* Upcoming plans table */}
      <div className="panel">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Upcoming Plans</h2>
          <Link to="/plans" className="text-sm font-medium text-teal-700 hover:text-teal-800">
            View all
          </Link>
        </div>

        {plansLoading ? (
          <Spinner />
        ) : !upcomingPlans?.length ? (
          <EmptyState icon={CalendarRange} title="No upcoming plans" description="Create a production plan to see it here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Plan Number</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Start Date</th>
                  <th className="px-5 py-3">End Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingPlans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-slate-50">
                    <td className="figure px-5 py-3 font-medium text-slate-900">
                      <Link to={`/plans/${plan._id}`} className="hover:text-teal-700">{plan.planNumber}</Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{plan.department}</td>
                    <td className="figure px-5 py-3 text-slate-600">{formatDate(plan.startDate)}</td>
                    <td className="figure px-5 py-3 text-slate-600">{formatDate(plan.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={plan.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Material shortage table */}
      <div className="panel">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Material Shortages</h2>
        </div>

        {shortagesLoading ? (
          <Spinner />
        ) : !shortages?.length ? (
          <EmptyState icon={CheckCircle2} title="No shortages right now" description="All required materials are sufficiently stocked." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Material</th>
                  <th className="px-5 py-3">Required Qty</th>
                  <th className="px-5 py-3">Available Qty</th>
                  <th className="px-5 py-3">Shortage Qty</th>
                  <th className="px-5 py-3">Coverage</th>
                  <th className="px-5 py-3">Purchaser</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shortages.map((row) => {
                  const available = row.materialId.currentStock - row.materialId.reservedStock;
                  return (
                    <tr key={row._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{row.materialId.materialName}</p>
                        <p className="figure text-xs text-slate-400">{row.materialId.materialCode}</p>
                      </td>
                      <td className="figure px-5 py-3 text-slate-600">{row.requiredQty} {row.materialId.unit}</td>
                      <td className="figure px-5 py-3 text-slate-600">{available} {row.materialId.unit}</td>
                      <td className="figure px-5 py-3 font-semibold text-red-600">{row.shortageQty} {row.materialId.unit}</td>
                      <td className="px-5 py-3"><StockBar required={row.requiredQty} available={available} /></td>
                      <td className="px-5 py-3 text-slate-600">{row.purchaser?.name || "Unassigned"}</td>
                      <td className="px-5 py-3">
                        {row.notificationStatus ? <StatusBadge status={row.notificationStatus} /> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {row.notificationId && row.notificationStatus !== "resolved" && (
                          <div className="flex justify-end gap-1.5">
                            {row.notificationStatus === "pending" && (
                              <button
                                onClick={() => ackMutation.mutate(row.notificationId)}
                                disabled={ackMutation.isPending}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                title="Acknowledge"
                              >
                                <BellOff size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => resolveMutation.mutate(row.notificationId)}
                              disabled={resolveMutation.isPending}
                              className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                              title="Mark Resolved"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
