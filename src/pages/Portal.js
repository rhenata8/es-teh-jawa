import React from 'react';
import { Coffee, Plus, Clock } from 'lucide-react';

function Portal({ onStartShift, onViewHistory }) {
  return (
    <div className="portal-container">
      <div className="portal-card">
        <div className="portal-icon">
          <Coffee size={60} />
        </div>
        <h1 className="portal-title">Es Teh Jawa</h1>
        <p className="portal-subtitle">Portal Karyawan</p>
        
        <button className="portal-button primary" onClick={onStartShift}>
          <Plus size={24} />
          <div className="button-content">
            <div className="button-title">Memulai Shift Baru</div>
            <div className="button-subtitle">Mulai shift dan catat stok awal</div>
          </div>
        </button>
        
        <button className="portal-button secondary" onClick={onViewHistory}>
          <Clock size={24} />
          <div className="button-content">
            <div className="button-title">Lihat Shift Sebelumnya</div>
            <div className="button-subtitle">Riwayat shift dan penjualan</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Portal;
