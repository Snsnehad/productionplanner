import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getMaterials } from "../api/materials";
import { createPlan } from "../api/plans";
import MaterialMultiSelect from "../components/Common/MaterialMultiSelect.jsx";

const DEPARTMENTS = ["Winding", "Core", "CCA", "Tanking", "Testing"];

const CreateProductionPlan = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [result, setResult] = useState(null);

  const { data: materials } = useQuery({ queryKey: ["materials", "all"], queryFn: () => getMaterials() });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      planName: "",
      department: "Winding",
      startDate: "",
      endDate: "",
      description: "",
      materials: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "materials" });
  const watchedMaterials = watch("materials");
  const selectedIds = (watchedMaterials || []).map((m) => m.materialId).filter(Boolean);

  // Multi-select gives us the full new set of chosen material IDs each time.
  // Diff it against what's currently in the field array: append rows for new
  // picks (keeping their qty blank), remove rows for ones that got unchecked.
  const handleMaterialsChange = (newIds) => {
    const removalIndices = fields
      .map((_, idx) => idx)
      .filter((idx) => {
        const id = watchedMaterials?.[idx]?.materialId;
        return id && !newIds.includes(id);
      });

    // Remove in reverse order so earlier indices don't shift as we go
    [...removalIndices].sort((a, b) => b - a).forEach((idx) => remove(idx));

    const additions = newIds.filter((id) => !selectedIds.includes(id));
    additions.forEach((id) => append({ materialId: id, requiredQty: "" }));
  };

  const createMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: (data) => {
      toast.success(`Plan ${data.plan.planNumber} created`);
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-shortages"] });
      setResult(data);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create plan"),
  });

  const onSubmit = (values) => {
    if (!values.materials?.length) {
      toast.error("Select at least one material");
      return;
    }

    const payload = {
      ...values,
      materials: values.materials
        .filter((m) => m.materialId && m.requiredQty)
        .map((m) => ({ materialId: m.materialId, requiredQty: Number(m.requiredQty) })),
    };
    createMutation.mutate(payload);
  };

  const getMaterialMeta = (id) => materials?.find((m) => m._id === id);

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="panel p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Plan {result.plan.planNumber} created
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Stock was checked for each material below. Shortages have already triggered an email to the responsible purchaser.
          </p>

          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {result.materials.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{m.materialName || "Unknown material"}</p>
                  {m.error ? (
                    <p className="text-xs text-red-600">{m.error}</p>
                  ) : (
                    <p className="figure text-xs text-slate-500">
                      Required {m.requiredQty} · Reserved {m.reservedQty} · Shortage {m.shortageQty}
                    </p>
                  )}
                </div>
                {!m.error && (
                  m.sufficient ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">In stock</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Shortage{m.notificationCreated ? " · purchaser alerted" : ""}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={() => navigate(`/plans/${result.plan._id}`)} className="btn-primary">View Plan</button>
            <button onClick={() => navigate("/plans")} className="btn-secondary">Back to Plans</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => navigate("/plans")} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} />
        Back to plans
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="panel space-y-6 p-6">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">Plan Details</h2>
          <p className="mt-1 text-sm text-slate-500">Plan number is generated automatically once you submit.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Plan Name</label>
            <input className="field-input" placeholder="Winding - June Batch" {...register("planName", { required: "Required" })} />
            {errors.planName && <p className="field-error">{errors.planName.message}</p>}
          </div>
          <div>
            <label className="field-label">Department</label>
            <select className="field-input" {...register("department", { required: true })}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Start Date</label>
            <input type="date" className="field-input" {...register("startDate", { required: "Required" })} />
            {errors.startDate && <p className="field-error">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="field-label">End Date</label>
            <input type="date" className="field-input" {...register("endDate", { required: "Required" })} />
            {errors.endDate && <p className="field-error">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <label className="field-label">Description</label>
          <textarea className="field-input" rows={2} placeholder="Optional notes about this plan" {...register("description")} />
        </div>

        <div className="border-t border-slate-200 pt-5">
          <div className="mb-3">
            <h2 className="font-display text-base font-semibold text-slate-900">Required Materials</h2>
            <p className="mt-0.5 text-sm text-slate-500">Pick all the materials this plan needs, then set a quantity for each.</p>
          </div>

          <MaterialMultiSelect
            materials={materials || []}
            selectedIds={selectedIds}
            onChange={handleMaterialsChange}
          />

          {fields.length > 0 && (
            <div className="mt-4 space-y-3">
              {fields.map((field, index) => {
                const selectedId = watchedMaterials?.[index]?.materialId;
                const meta = getMaterialMeta(selectedId);
                const required = Number(watchedMaterials?.[index]?.requiredQty || 0);
                const available = meta ? meta.currentStock - meta.reservedStock : null;
                const shortfall = meta && required > available;

                return (
                  <div key={field.id} className="rounded-lg border border-slate-200 p-3">
                    <input type="hidden" {...register(`materials.${index}.materialId`)} />
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{meta?.materialName}</p>
                        <p className="figure text-xs text-slate-400">{meta?.materialCode}</p>
                      </div>
                      <div className="w-36">
                        <label className="field-label">Required Qty</label>
                        <input
                          type="number"
                          step="any"
                          className="field-input"
                          placeholder="0"
                          {...register(`materials.${index}.requiredQty`, { required: "Required", min: 0.01 })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-md p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove material"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {meta && (
                      <p className={`figure mt-2 flex items-center gap-1.5 text-xs ${shortfall ? "text-red-600" : "text-slate-500"}`}>
                        {shortfall && <AlertTriangle size={13} />}
                        Available: {available} {meta.unit}
                        {shortfall ? ` · Will fall short by ${(required - available).toFixed(2)} ${meta.unit}` : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
          <button type="button" onClick={() => navigate("/plans")} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary">
            {createMutation.isPending ? "Checking stock..." : "Create Plan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductionPlan;
