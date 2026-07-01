import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, Pencil, Trash2, Boxes } from "lucide-react";
import toast from "react-hot-toast";
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from "../api/materials";
import Modal from "../components/Common/Modal.jsx";
import Spinner from "../components/Common/Spinner.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

const UNITS = ["Kg", "Nos", "Mtr", "Ltr", "Set", "Roll"];

const MaterialsMaster = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: materials, isLoading } = useQuery({
    queryKey: ["materials", search],
    queryFn: () => getMaterials(search ? { search } : {}),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["materials"] });

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      toast.success("Material added");
      invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add material"),
  });

  const updateMutation = useMutation({
    mutationFn: updateMaterial,
    onSuccess: () => {
      toast.success("Material updated");
      invalidate();
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update material"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      toast.success("Material deactivated");
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to deactivate material"),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ materialCode: "", materialName: "", category: "", unit: "Kg", currentStock: 0, reservedStock: 0, minimumStock: 0 });
    setModalOpen(true);
  };

  const openEdit = (material) => {
    setEditing(material);
    reset(material);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onSubmit = (values) => {
    const payload = {
      ...values,
      currentStock: Number(values.currentStock),
      reservedStock: Number(values.reservedStock),
      minimumStock: Number(values.minimumStock),
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="field-input pl-9"
          />
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Material
        </button>
      </div>

      <div className="panel overflow-x-auto">
        {isLoading ? (
          <Spinner />
        ) : !materials?.length ? (
          <EmptyState icon={Boxes} title="No materials yet" description="Add your first material to start tracking stock." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Material Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3">Current Stock</th>
                <th className="px-5 py-3">Reserved</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3">Min. Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => {
                const available = m.currentStock - m.reservedStock;
                const low = available <= m.minimumStock;
                return (
                  <tr key={m._id} className="hover:bg-slate-50">
                    <td className="figure px-5 py-3 text-slate-500">{m.materialCode}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{m.materialName}</td>
                    <td className="px-5 py-3 text-slate-600">{m.category}</td>
                    <td className="px-5 py-3 text-slate-600">{m.unit}</td>
                    <td className="figure px-5 py-3 text-slate-600">{m.currentStock}</td>
                    <td className="figure px-5 py-3 text-slate-600">{m.reservedStock}</td>
                    <td className={`figure px-5 py-3 font-semibold ${low ? "text-red-600" : "text-emerald-700"}`}>{available}</td>
                    <td className="figure px-5 py-3 text-slate-600">{m.minimumStock}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEdit(m)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deactivate ${m.materialName}?`)) deleteMutation.mutate(m._id);
                          }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Deactivate"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Material" : "Add Material"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Material Code</label>
              <input className="field-input" placeholder="CU-001" {...register("materialCode", { required: "Required" })} />
              {errors.materialCode && <p className="field-error">{errors.materialCode.message}</p>}
            </div>
            <div>
              <label className="field-label">Unit</label>
              <select className="field-input" {...register("unit", { required: true })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Material Name</label>
            <input className="field-input" placeholder="Copper" {...register("materialName", { required: "Required" })} />
            {errors.materialName && <p className="field-error">{errors.materialName.message}</p>}
          </div>

          <div>
            <label className="field-label">Category</label>
            <input className="field-input" placeholder="Conductor" {...register("category")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="field-label">Current Stock</label>
              <input type="number" step="any" className="field-input" {...register("currentStock", { required: true, min: 0 })} />
            </div>
            <div>
              <label className="field-label">Reserved Stock</label>
              <input type="number" step="any" className="field-input" {...register("reservedStock", { required: true, min: 0 })} />
            </div>
            <div>
              <label className="field-label">Minimum Stock</label>
              <input type="number" step="any" className="field-input" {...register("minimumStock", { required: true, min: 0 })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
              {editing ? "Save Changes" : "Add Material"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialsMaster;
