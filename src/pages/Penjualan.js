// src/pages/Penjualan.js
import React, { useMemo, useState } from "react";
import { Trash2, Edit2, Save, X } from "lucide-react";

export default function Penjualan({ penjualan, shift, onUpdateShift }) {
  const [filterMetode, setFilterMetode] = useState("SEMUA");
  const [filterJenisTeh, setFilterJenisTeh] = useState("SEMUA");

  // State untuk modal edit
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

  // 🗑️ FUNGSI HAPUS TRANSAKSI (Dengan pengembalian susu)
  const handleHapusTransaksi = (transaksiId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus/membatalkan penjualan ini?",
      )
    ) {
      const transaksiTarget = shift.transaksi.find((t) => t.id === transaksiId);
      let totalCupsKembalian = 0;
      let totalSusuKembalian = 0;

      if (transaksiTarget) {
        totalCupsKembalian =
          transaksiTarget.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

        // Hitung pengembalian porsi susu sachet
        transaksiTarget.items?.forEach((item) => {
          const namaSaja = item.nama.toLowerCase();
          if (
            namaSaja.includes("milk") ||
            namaSaja.includes("thai tea") ||
            namaSaja.includes("matcha")
          ) {
            totalSusuKembalian += 0.5 * item.qty;
          }
        });
      }

      const updatedTransaksi = shift.transaksi.filter(
        (t) => t.id !== transaksiId,
      );
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

  // 📝 FUNGSI MEMBUKA MODAL EDIT
  const handleOpenEdit = (transaksi) => {
    setEditingTransaksi(transaksi);
    setEditMetode(transaksi.metode);
    setEditItems(transaksi.items.map((item) => ({ ...item })));
    setOpenEditModal(true);
  };

  // Mengubah qty item di dalam form modal edit
  const handleQtyChange = (itemId, newQty) => {
    const validQty = Math.max(0, parseInt(newQty) || 0);
    setEditItems(
      editItems.map((item) =>
        item.id === itemId ? { ...item, qty: validQty } : item,
      ),
    );
  };

  // 💾 FUNGSI MENYIMPAN HASIL EDIT TRANSAKSI
  const handleSaveEdit = () => {
    const cupsAwal = editingTransaksi.items.reduce(
      (sum, item) => sum + item.qty,
      0,
    );
    let susuAwal = 0;
    editingTransaksi.items.forEach((item) => {
      const namaSaja = item.nama.toLowerCase();
      if (
        namaSaja.includes("milk") ||
        namaSaja.includes("thai tea") ||
        namaSaja.includes("matcha")
      ) {
        susuAwal += 0.5 * item.qty;
      }
    });

    const totalBaru = editItems.reduce(
      (sum, item) => sum + item.harga * item.qty,
      0,
    );
    const cupsBaru = editItems.reduce((sum, item) => sum + item.qty, 0);
    let susuBaru = 0;
    editItems.forEach((item) => {
      const namaSaja = item.nama.toLowerCase();
      if (
        namaSaja.includes("milk") ||
        namaSaja.includes("thai tea") ||
        namaSaja.includes("matcha")
      ) {
        susuBaru += 0.5 * item.qty;
      }
    });

    const selisihCup = cupsBaru - cupsAwal;
    const selisihSusu = susuBaru - susuAwal;

    const stokCupTersedia = shift.stokDasar.sisaCup || 0;
    const stokSusuTersedia = shift.stokDasar.susu || 0;

    if (selisihCup > stokCupTersedia) {
      alert(
        `Stok cup tidak mencukupi untuk perubahan ini! Dibutuhkan tambahan ${selisihCup} cup.`,
      );
      return;
    }
    if (selisihSusu > stokSusuTersedia) {
      alert(
        `Stok susu tidak mencukupi! Dibutuhkan tambahan ${selisihSusu} sachet.`,
      );
      return;
    }

    const updatedTransaksi = shift.transaksi.map((t) => {
      if (t.id === editingTransaksi.id) {
        return {
          ...t,
          metode: editMetode,
          total: totalBaru,
          items: editItems.filter((item) => item.qty > 0),
        };
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

  // Hitung total bayangan live di dalam modal edit
  const liveTotalEdit = useMemo(() => {
    return editItems.reduce((sum, item) => sum + item.harga * item.qty, 0);
  }, [editItems]);

  return (
    <>
      <h1 className="page-title">Data Penjualan</h1>

      {/* Filter Section */}
      <div
        className="filter-section"
        style={{ marginBottom: 20, display: "flex", gap: 15 }}
      >
        <select
          className="filter-select"
          value={filterMetode}
          onChange={(e) => setFilterMetode(e.target.value)}
        >
          <option value="SEMUA">Semua Metode</option>
          <option value="QRIS">QRIS</option>
          <option value="TUNAI">Tunai</option>
        </select>
        <select
          className="filter-select"
          value={filterJenisTeh}
          onChange={(e) => setFilterJenisTeh(e.target.value)}
        >
          <option value="SEMUA">Semua Varian</option>
          {jenisTehList.map((tea) => (
            <option key={tea} value={tea}>
              {tea}
            </option>
          ))}
        </select>
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
                    <div key={idx}>
                      {item.nama || item.namaItem} ({item.qty}x)
                    </div>
                  ))}
                </td>
                <td>{t.metode}</td>
                <td>Rp {t.total.toLocaleString("id-ID")}</td>
                <td>
                  {/* Tombol Edit */}
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#007BFF",
                      cursor: "pointer",
                      marginRight: 12,
                    }}
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => handleHapusTransaksi(t.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#DC3545",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📦 MODAL EDIT PENJUALAN */}
      {openEditModal && (
        <div className="modal-overlay" onClick={() => setOpenEditModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <div className="modal-title" style={{ margin: 0 }}>
                Edit Transaksi Penjualan
              </div>
              <button
                onClick={() => setOpenEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Metode Pembayaran */}
            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <select
                className="form-input"
                value={editMetode}
                onChange={(e) => setEditMetode(e.target.value)}
              >
                <option value="TUNAI">Tunai</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>

            {/* List Item yang Dibeli */}
            <div className="form-group" style={{ marginTop: 15 }}>
              <label className="form-label">Sesuaikan Jumlah Cup (Qty)</label>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid #EEE",
                  borderRadius: "6px",
                  padding: "10px",
                }}
              >
                {editItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>
                      {item.nama || item.namaItem}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <input
                        type="number"
                        min="0"
                        style={{
                          width: "60px",
                          padding: "4px",
                          textAlign: "center",
                        }}
                        value={item.qty}
                        onChange={(e) =>
                          handleQtyChange(item.id, e.target.value)
                        }
                      />
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        cup
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rangkuman Total Baru */}
            <div
              className="total-display"
              style={{
                marginTop: 20,
                padding: "12px",
                background: "#FFF3CD",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  color: "#856404",
                }}
              >
                <span>Total Baru:</span>
                <span>Rp {liveTotalEdit.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setOpenEditModal(false)}
              >
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                <Save size={16} style={{ marginRight: 5 }} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}