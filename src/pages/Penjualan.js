// src/pages/Penjualan.js
import React, { useMemo, useState } from "react";
import { Trash2, Edit2, Save, X, DollarSign, CreditCard, ShoppingBag, Landmark } from "lucide-react";

export default function Penjualan({ penjualan, shift, onUpdateShift }) {
  const [filterMetode, setFilterMetode] = useState("SEMUA");
  const [filterJenisTeh, setFilterJenisTeh] = useState("SEMUA");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState(null);
  const [editMetode, setEditMetode] = useState("TUNAI");
  const [editItems, setEditItems] = useState([]);

  const jenisTehList = useMemo(() => {
    const types = new Set();
    penjualan.forEach((t) =>
      t.items?.forEach((item) => {
        if (item.nama) types.add(item.nama);
      }),
    );
    return Array.from(types).sort();
  }, [penjualan]);

  const filteredPenjualan = useMemo(() => {
    return penjualan.filter((t) => {
      if (filterMetode !== "SEMUA" && t.metode !== filterMetode) return false;
      if (
        filterJenisTeh !== "SEMUA" &&
        !t.items?.some((item) => item.nama === filterJenisTeh)
      )
        return false;
      return true;
    });
  }, [penjualan, filterMetode, filterJenisTeh]);

  const handleHapusTransaksi = (transaksiId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus/membatalkan penjualan ini?")) {
      const transaksiTarget = shift.transaksi.find((t) => t.id === transaksiId);
      let totalCupsKembalian = 0;
      let totalSusuKembalian = 0;

      if (transaksiTarget) {
        totalCupsKembalian = transaksiTarget.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
        transaksiTarget.items?.forEach((item) => {
          const namaSaja = item.nama.toLowerCase();
          if (namaSaja.includes("milk") || namaSaja.includes("thai tea") || namaSaja.includes("matcha")) {
            totalSusuKembalian += 0.5 * item.qty;
          }
        });
      }

      const updatedTransaksi = shift.transaksi.filter((t) => t.id !== transaksiId);
      const updatedShift = {
        ...shift,
        stokDasar: {
          ...shift.stokDasar,
          sisaCup: (shift.stokDasar.sisaCup || 0) + totalCupsKembalian,
          susu: (shift.stokDasar.susu || 0) + totalSusuKembalian,
        },
        transaksi: updatedTransaksi,
      };
      onUpdateShift(updatedShift);
    }
  };

  const handleOpenEdit = (transaksi) => {
    setEditingTransaksi(transaksi);
    setEditMetode(transaksi.metode);
    setEditItems(transaksi.items.map((item) => ({ ...item })));
    setOpenEditModal(true);
  };

  const handleQtyChange = (itemId, newQty) => {
    const validQty = Math.max(0, parseInt(newQty) || 0);
    setEditItems(editItems.map((item) => item.id === itemId ? { ...item, qty: validQty } : item));
  };

  const handleSaveEdit = () => {
    const cupsAwal = editingTransaksi.items.reduce((sum, item) => sum + item.qty, 0);
    let susuAwal = 0;
    editingTransaksi.items.forEach((item) => {
      const namaSaja = item.nama.toLowerCase();
      if (namaSaja.includes("milk") || namaSaja.includes("thai tea") || namaSaja.includes("matcha")) {
        susuAwal += 0.5 * item.qty;
      }
    });

    const totalBaru = editItems.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const cupsBaru = editItems.reduce((sum, item) => sum + item.qty, 0);
    let susuBaru = 0;
    editItems.forEach((item) => {
      const namaSaja = item.nama.toLowerCase();
      if (namaSaja.includes("milk") || namaSaja.includes("thai tea") || namaSaja.includes("matcha")) {
        susuBaru += 0.5 * item.qty;
      }
    });

    const selisihCup = cupsBaru - cupsAwal;
    const selisihSusu = susuBaru - susuAwal;

    const stokCupTersedia = shift.stokDasar.sisaCup || 0;
    const stokSusuTersedia = shift.stokDasar.susu || 0;

    if (selisihCup > stokCupTersedia) {
      alert(`Stok cup tidak mencukupi! Dibutuhkan tambahan ${selisihCup} cup.`);
      return;
    }
    if (selisihSusu > stokSusuTersedia) {
      alert(`Stok susu tidak mencukupi! Dibutuhkan tambahan ${selisihSusu} sachet.`);
      return;
    }

    const updatedTransaksi = shift.transaksi.map((t) => {
      if (t.id === editingTransaksi.id) {
        return { ...t, metode: editMetode, total: totalBaru, items: editItems.filter((item) => item.qty > 0) };
      }
      return t;
    });

    const updatedShift = {
      ...shift,
      stokDasar: {
        ...shift.stokDasar,
        sisaCup: Math.max(0, stokCupTersedia - selisihCup),
        susu: Math.max(0, stokSusuTersedia - selisihSusu),
      },
      transaksi: updatedTransaksi,
    };

    onUpdateShift(updatedShift);
    setOpenEditModal(false);
    setEditingTransaksi(null);
    alert("Data transaksi penjualan berhasil diperbarui!");
  };

  // ✅ KARTU AKTIF: Mengkalkulasi pendapatan gabungan QRIS + GRAB ke dalam satu tempat
  const stats = useMemo(() => {
    const total = filteredPenjualan.reduce((sum, t) => sum + t.total, 0);
    const tunai = filteredPenjualan.filter((t) => t.metode === "TUNAI").reduce((sum, t) => sum + t.total, 0);
    
    // Hitung nominal QRIS, GRAB secara terpisah, lalu gabungkan ke satu variabel stats
    const qrisNominal = filteredPenjualan.filter((t) => t.metode === "QRIS").reduce((sum, t) => sum + t.total, 0);
    const grabNominal = filteredPenjualan.filter((t) => t.metode === "GRAB").reduce((sum, t) => sum + t.total, 0);
    const qrisDanGrab = qrisNominal + grabNominal;

    const tunaiCount = filteredPenjualan.filter((t) => t.metode === "TUNAI").length;
    const qrisCount = filteredPenjualan.filter((t) => t.metode === "QRIS").length;
    const grabCount = filteredPenjualan.filter((t) => t.metode === "GRAB").length;

    return { total, qrisDanGrab, tunai, count: filteredPenjualan.length, qrisCount, grabCount, tunaiCount };
  }, [filteredPenjualan]);

  const kasUangLaciBersih = useMemo(() => {
    const totalPengeluaran = shift?.pengeluaran?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
    return stats.tunai - totalPengeluaran;
  }, [stats.tunai, shift?.pengeluaran]);

  const liveTotalEdit = useMemo(() => {
    return editItems.reduce((sum, item) => sum + item.harga * item.qty, 0);
  }, [editItems]);

  return (
    <>
      <h1 className="page-title">Data Penjualan</h1>

      {/* Filter Section */}
      <div className="filter-section" style={{ marginBottom: 20, display: "flex", gap: 15 }}>
        <select className="filter-select" value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)}>
          <option value="SEMUA">Semua Metode</option>
          <option value="TUNAI">Tunai</option>
          <option value="QRIS">QRIS</option>
          <option value="GRAB">Grab</option> {/* ✅ Filter Opsi Baru */}
        </select>
        <select className="filter-select" value={filterJenisTeh} onChange={(e) => setFilterJenisTeh(e.target.value)}>
          <option value="SEMUA">Semua Varian</option>
          {jenisTehList.map((tea) => <option key={tea} value={tea}>{tea}</option>)}
        </select>
      </div>

      {/* GRID KARTU KEUANGAN LENGKAP */}
      <div className="stats-grid" style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
        <div className="stat-card green">
          <div className="stat-header"><DollarSign size={22} /><div className="stat-title">Total Penjualan</div></div>
          <div className="stat-amount">Rp {stats.total.toLocaleString("id-ID")}</div>
          <div className="stat-subtitle">{stats.count} transaksi</div>
        </div>

        {/* ✅ PEMBARUAN KARTU: Menggabungkan total QRIS & GRAB */}
        <div className="stat-card blue">
          <div className="stat-header"><CreditCard size={22} /><div className="stat-title">QRIS & Grab</div></div>
          <div className="stat-amount">Rp {stats.qrisDanGrab.toLocaleString("id-ID")}</div>
          <div className="stat-subtitle">{stats.qrisCount} QRIS | {stats.grabCount} Grab</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header"><ShoppingBag size={22} /><div className="stat-title">Pembayaran Tunai</div></div>
          <div className="stat-amount">Rp {stats.tunai.toLocaleString("id-ID")}</div>
          <div className="stat-subtitle">{stats.tunaiCount} transaksi</div>
        </div>

        <div className="stat-card" style={{ background: kasUangLaciBersih >= 0 ? 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)' : '#F8D7DA', borderLeft: '5px solid #FF69B4' }}>
          <div className="stat-header"><Landmark size={22} style={{ color: '#C71585' }} /><div className="stat-title" style={{ color: '#C71585', fontWeight: '600' }}>Uang Tunai di Laci</div></div>
          <div className="stat-amount">Rp {kasUangLaciBersih.toLocaleString("id-ID")}</div>
          <div className="stat-subtitle" style={{ color: '#666' }}>Sudah potong pengeluaran</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Item</th>
              <th>Metode</th>
              <th>Total</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPenjualan.map((t) => (
              <tr key={t.id || t.waktu}>
                <td>{new Date(t.waktu).toLocaleTimeString("id-ID")}</td>
                <td>
                  {t.items?.map((item, idx) => (
                    <div key={idx}>{item.nama || item.namaItem} ({item.qty}x)</div>
                  ))}
                </td>
                <td>
                  {/* Badge warna dinamis untuk metode Grab */}
                  <span className={`payment-badge`} style={t.metode === "GRAB" ? { color: "#00B14F", fontWeight: "bold" } : {}}>
                    {t.metode}
                  </span>
                </td>
                <td>Rp {t.total.toLocaleString("id-ID")}</td>
                <td>
                  <button onClick={() => handleOpenEdit(t)} style={{ background: "none", border: "none", color: "#007BFF", cursor: "pointer", marginRight: 12 }}><Edit2 size={16} /></button>
                  <button onClick={() => handleHapusTransaksi(t.id)} style={{ background: "none", border: "none", color: "#DC3545", cursor: "pointer" }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📦 MODAL EDIT PENJUALAN */}
      {openEditModal && (
        <div className="modal-overlay" onClick={() => setOpenEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <div className="modal-title" style={{ margin: 0 }}>Edit Transaksi Penjualan</div>
              <button onClick={() => setOpenEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <select className="form-input" value={editMetode} onChange={(e) => setEditMetode(e.target.value)}>
                <option value="TUNAI">Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="GRAB">Grab</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Sesuaikan Jumlah Cup (Qty)</label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #EEE", borderRadius: "6px", padding: "10px" }}>
                {editItems.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10 }}>
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.nama || item.namaItem}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <input
                        type="number"
                        min="0"
                        style={{ width: "60px", padding: "4px", textAlign: "center" }}
                        value={item.qty}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      />
                      <span style={{ fontSize: "12px", color: "#666" }}>cup</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="total-display" style={{ marginTop: 20, padding: "12px", background: "#FFF3CD", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#856404" }}>
                <span>Total Baru:</span>
                <span>Rp {liveTotalEdit.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setOpenEditModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}><Save size={16} style={{ marginRight: 5 }} /> Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}