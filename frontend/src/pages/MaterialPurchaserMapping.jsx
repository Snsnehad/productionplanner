import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { getMappings, createMapping, deleteMapping } from "../api/materialPurchasers";
import { getMaterials } from "../api/materials";
import { getPurchasers } from "../api/purchasers";
import Modal from "../components/Common/Modal.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const MaterialPurchaserMapping = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: mappings, isLoading } = useQuery({ queryKey: ["mappings"], queryFn: getMappings });
  const { data: materials } = useQuery({ queryKey: ["materials", "all"], queryFn: () => getMaterials() });
  const { data: purchasers } = useQuery({ queryKey: ["purchasers", "all"], queryFn: () => getPurchasers() });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["mappings"] });

  const createMutation = useMutation({
    mutationFn: createMapping,
    onSuccess: () => { toast.success("Mapping saved"); invalidate(); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save mapping"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMapping,
    onSuccess: () => { toast.success("Mapping removed"); invalidate(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to remove mapping"),
  });

  const openCreate = () => { reset({ materialId: "", purchaserId: "" }); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const onSubmit = (values) => createMutation.mutate(values);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Each material routes shortage alerts to exactly one purchaser.</p>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Map Material
        </button>
      </div>

      <div className="panel overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !mappings?.length ? (
          <EmptyState icon={Link2} title="No mappings yet" description="Map each material to the purchaser who should be alerted on shortage." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Purchaser</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappings.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{m.materialId?.materialName}</p>
                    <p className="figure text-xs text-slate-400">{m.materialId?.materialCode}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{m.purchaserId?.name}</td>
                  <td className="px-5 py-3 text-slate-500">{m.purchaserId?.designation || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => { if (window.confirm("Remove this mapping?")) deleteMutation.mutate(m._id); }}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title="Map Material to Purchaser">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="field-label">Material</label>
            <select className="field-input" {...register("materialId", { required: "Required" })}>
              <option value="">Select a material</option>
              {materials?.map((m) => (
                <option key={m._id} value={m._id}>{m.materialName} ({m.materialCode})</option>
              ))}
            </select>
            {errors.materialId && <p className="field-error">{errors.materialId.message}</p>}
          </div>
          <div>
            <label className="field-label">Purchaser</label>
            <select className="field-input" {...register("purchaserId", { required: "Required" })}>
              <option value="">Select a purchaser</option>
              {purchasers?.map((p) => (
                <option key={p._id} value={p._id}>{p.name}{p.designation ? ` — ${p.designation}` : ""}</option>
              ))}
            </select>
            {errors.purchaserId && <p className="field-error">{errors.purchaserId.message}</p>}
          </div>
          <p className="text-xs text-slate-400">Mapping the same material again replaces its current purchaser.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">Save Mapping</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialPurchaserMapping;
