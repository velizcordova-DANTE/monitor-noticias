import { useEffect, useState, type FormEvent } from 'react';
import { fetchOfficials, addOfficial, updateOfficial, deleteOfficial } from '../lib/firestore';
import { Modal } from '../components/Modal';
import type { Official } from '../types';

export function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Official | null>(null);
  const [form, setForm] = useState({ name: '', position: '', unit: '', email: '', active: true });

  const load = async () => {
    setLoading(true);
    try {
      setOfficials(await fetchOfficials(true));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', position: '', unit: '', email: '', active: true });
    setModalOpen(true);
  };

  const openEdit = (off: Official) => {
    setEditing(off);
    setForm({ name: off.name, position: off.position, unit: off.unit, email: off.email, active: off.active });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateOfficial(editing.id!, form);
    } else {
      await addOfficial(form);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este funcionario?')) {
      await deleteOfficial(id);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Funcionarios</h1>
          <p>Gestión de destinatarios del monitoreo diario</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo Funcionario
        </button>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Unidad</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((off) => (
                <tr key={off.id} className={!off.active ? 'inactive-row' : ''}>
                  <td>{off.name}</td>
                  <td>{off.position}</td>
                  <td>{off.unit}</td>
                  <td>
                    <a href={`mailto:${off.email}`} className="email-link">{off.email}</a>
                  </td>
                  <td>
                    {off.active ? (
                      <span className="badge badge-green">Activo</span>
                    ) : (
                      <span className="badge badge-gray">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-sm" onClick={() => openEdit(off)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(off.id!)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {officials.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No hay funcionarios registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Funcionario' : 'Nuevo Funcionario'}>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cargo</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Unidad</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Funcionario activo
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear funcionario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
