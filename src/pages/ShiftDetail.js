import React from 'react';
import { ArrowLeft, User, Clock, ShoppingBag } from 'lucide-react';

function ShiftDetail({ shift, onBack }) {
  if (!shift) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPendapatan = shift.transaksi.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="portal-container">
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} /> Kembali
        </button>

        <div className="tabs">
          <button className="tab active">Shift</button>
          <button className="tab">Penjualan</button>
        </div>

        <div className="shift-list">
          <div className="shift-card">
            <div className="shift-card-header">
              <div className="shift-info">
                <User size={20} />
                <span className="shift-karyawan">{shift.karyawan}</span>
              </div>
              <div className="shift-total">Rp {totalPendapatan.toLocaleString('id-ID')}</div>
            </div>
            <div className="shift-waktu">
              <Clock size={16} style={{ marginRight: '5px' }} />
              {formatDate(shift.waktuSelesai || shift.waktuMulai)}
            </div>
            <div className="shift-transaksi">
              {shift.transaksi.length} transaksi
            </div>
          </div>

          <div className="table-container">
            <h3 className="section-title">Data Penjualan</h3>
            {shift.transaksi.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={60} className="empty-state-icon" />
                <p className="empty-state-text">Belum ada transaksi</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Item</th>
                    <th>Metode</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {shift.transaksi.map((t, i) => (
                    <tr key={i}>
                      <td>{new Date(t.waktu).toLocaleTimeString('id-ID')}</td>
                      <td>{t.items.map(i => i.nama).join(', ')}</td>
                      <td>{t.metode}</td>
                      <td>Rp {t.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftDetail;
