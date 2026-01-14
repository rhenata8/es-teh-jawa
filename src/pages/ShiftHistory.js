import React from 'react';
import { ArrowLeft, User, Clock } from 'lucide-react';

function ShiftHistory({ shifts, onSelectShift, onBack }) {
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

  const calculateTotal = (shift) => {
    return shift.transaksi.reduce((sum, t) => sum + t.total, 0);
  };

  return (
    <div className="portal-container">
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Kembali
        </button>
        
        <div className="section-card">
          <h2 className="section-title">Riwayat Shift</h2>
          
          {shifts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Clock size={60} />
              </div>
              <p className="empty-state-text">Belum ada riwayat shift</p>
            </div>
          ) : (
            <div className="shift-list">
              {shifts.map((shift) => (
                <div 
                  key={shift.id} 
                  className="shift-card"
                  onClick={() => onSelectShift(shift)}
                >
                  <div className="shift-card-header">
                    <div className="shift-info">
                      <User size={20} />
                      <span className="shift-karyawan">{shift.karyawan}</span>
                    </div>
                    <div className="shift-total">
                      Rp {calculateTotal(shift).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="shift-waktu">
                    <Clock size={16} style={{ display: 'inline', marginRight: '5px' }} />
                    {formatDate(shift.waktuMulai)}
                  </div>
                  <div className="shift-transaksi">
                    {shift.transaksi.length} transaksi
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShiftHistory;
