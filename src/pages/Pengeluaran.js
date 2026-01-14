import React, { useMemo, useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';

function Pengeluaran({ shift, onUpdateShift, onBack, onNavigate, onEndShift }) {
  const [openModal, setOpenModal] = useState(false);

  const [item, setItem] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [satuan, setSatuan] = useState('');
  const [hargaSatuan, setHargaSatuan] = useState(0);

  const pengeluaran = shift.pengeluaran || [];

  const totalPengeluaran = useMemo(() => {
    return pengeluaran.reduce((sum, p) => sum + (p.total || 0), 0);
  }, [pengeluaran]);

  const resetForm = () => {
    setItem('');
    setJumlah(1);
    setSatuan('');
    setHargaSatuan(0);
  };

  const handleSave = () => {
    const cleanJumlah = Number.isFinite(Number(jumlah)) ? Number(jumlah) : 0;
    const cleanHarga = Number.isFinite(Number(hargaSatuan)) ? Number(hargaSatuan) : 0;
    const total = Math.max(0, cleanJumlah) * Math.max(0, cleanHarga);

    const newExpense = {
      id: Date.now(),
      waktu: new Date().toISOString(),
      item: item.trim(),
      jumlah: Math.max(0, cleanJumlah),
      satuan: satuan.trim(),
      hargaSatuan: Math.max(0, cleanHarga),
      total
    };

    const updatedShift = {
      ...shift,
      pengeluaran: [...pengeluaran, newExpense]
    };

    onUpdateShift(updatedShift);
    setOpenModal(false);
    resetForm();
  };

  return (
    <div className="sidebar-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <div>
            <div className="sidebar-title">Es Teh Jawa</div>
            <div className="sidebar-subtitle">Sistem Kasir</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-name">{shift.karyawan}</div>
          <div className="sidebar-user-shift">Shift Pagi</div>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-menu-item" onClick={onBack}>Kasir</div>
          <div className="sidebar-menu-item" onClick={() => onNavigate && onNavigate('penjualan')}>Penjualan</div>
          <div className="sidebar-menu-item active">Pengeluaran</div>
          <div className="sidebar-menu-item" onClick={() => onNavigate && onNavigate('stok')}>Stok</div>
        </div>

        <button className="sidebar-end-shift" onClick={() => onEndShift && onEndShift()}>
          Akhiri Shift
        </button>
      </div>

      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h1 className="page-title">Pengeluaran</h1>
          <button className="add-button" onClick={() => setOpenModal(true)}>
            <Plus size={18} />
            Tambah Pengeluaran
          </button>
        </div>

        <div className="section-card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #F8D7DA 0%, #F5C6CB 100%)' }}>
          <div className="stat-header">
            <DollarSign size={22} />
            <div className="stat-title" style={{ fontSize: 18 }}>Total Pengeluaran</div>
          </div>
          <div className="stat-amount" style={{ margin: 0 }}>Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
          <div className="stat-subtitle">{pengeluaran.length} item pengeluaran</div>
        </div>

        <div className="table-container">
          {pengeluaran.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <div className="empty-state-text">Belum ada pengeluaran</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Item</th>
                  <th>Jumlah</th>
                  <th>Harga Satuan</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pengeluaran.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td>{p.item}</td>
                    <td>{p.jumlah} {p.satuan}</td>
                    <td>Rp {Number(p.hargaSatuan || 0).toLocaleString('id-ID')}</td>
                    <td>Rp {Number(p.total || 0).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {openModal && (
          <div className="modal-overlay" onClick={() => { setOpenModal(false); resetForm(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Tambah Pengeluaran</div>

              <div className="form-group">
                <label className="form-label required">Item Pembelian</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Gula Pasir"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Jumlah</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Satuan</label>
                  <input
                    className="form-input"
                    placeholder="kg, liter, pcs"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Harga per Satuan</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={hargaSatuan}
                  onChange={(e) => setHargaSatuan(e.target.value)}
                />
              </div>

              <div className="total-display">
                <div className="total-display-row">
                  <span>Total:</span>
                  <span className="total-display-amount">
                    Rp {(Math.max(0, Number(jumlah) || 0) * Math.max(0, Number(hargaSatuan) || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => { setOpenModal(false); resetForm(); }}
                >
                  Batal
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!item.trim() || !satuan.trim()}
                  onClick={handleSave}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pengeluaran;
