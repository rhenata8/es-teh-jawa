import React, { useState } from 'react';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';

function MulaiShift({ onBack, onStart }) {
  const [nama, setNama] = useState('');
  const [shift, setShift] = useState('');
  const [stok, setStok] = useState({
    sisaCup: 0,
    cupBesar: 0,
    gula: 0,
    teh: 0,
    esBatu: 0  // ✅ TAMBAHAN
  });

  const handleChange = (key, value) => {
    setStok(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!nama.trim() || !shift.trim()) return alert('Lengkapi nama dan shift.');
    const newShift = {
      id: Date.now(),
      karyawan: nama.trim(),
      shift: shift,
      waktuMulai: new Date().toISOString(),
      waktuSelesai: null,
      transaksi: [],
      pengeluaran: [],
      stokDasar: {
        sisaCup: Number(stok.sisaCup) || 0,
        cupBesar: Number(stok.cupBesar) || 0,
        gula: Number(stok.gula) || 0,
        teh: Number(stok.teh) || 0,
        esBatu: Number(stok.esBatu) || 0  // ✅ TAMBAHAN
      },
      pembuatanTeh: [],
      stokJenisTeh: []
    };
    onStart(newShift);
  };

  return (
    <div className="portal-container">
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <div className="header-bar">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} /> Kembali
          </button>
          <h2 style={{ color: '#A04B00', fontWeight: 700 }}>Mulai Shift Baru</h2>
        </div>

        <div className="section-card">
          <h3 className="section-title">Informasi Karyawan</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Nama Karyawan</label>
              <input
                className="form-input"
                placeholder="Masukkan nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Shift</label>
              <select
                className="form-input"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="">Pilih shift</option>
                <option value="Pagi">Pagi</option>
                <option value="Siang">Siang</option>
                <option value="Malam">Malam</option>
              </select>
            </div>
          </div>

          <h3 className="section-title" style={{ marginTop: 20 }}>Stok Awal</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sisa Cup</label>
              <input
                type="number"
                className="form-input"
                value={stok.sisaCup}
                onChange={(e) => handleChange('sisaCup', e.target.value)}
              />
              <small className="form-hint">dari shift sebelumnya</small>
            </div>
            <div className="form-group">
              <label className="form-label">Cup Besar</label>
              <input
                type="number"
                className="form-input"
                value={stok.cupBesar}
                onChange={(e) => handleChange('cupBesar', e.target.value)}
              />
              <small className="form-hint">stok baru</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gula (kg)</label>
              <input
                type="number"
                className="form-input"
                value={stok.gula}
                onChange={(e) => handleChange('gula', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teh (gram)</label>
              <input
                type="number"
                className="form-input"
                value={stok.teh}
                onChange={(e) => handleChange('teh', e.target.value)}
              />
            </div>
          </div>

          {/* ✅ TAMBAHAN: Input Es Batu */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Es Batu (kg)</label>
              <input
                type="number"
                className="form-input"
                value={stok.esBatu}
                onChange={(e) => handleChange('esBatu', e.target.value)}
              />
              <small className="form-hint">stok es batu tersedia</small>
            </div>
            <div className="form-group">
              {/* Empty space for grid alignment */}
            </div>
          </div>

          <button className="beautiful-primary-button" onClick={handleSubmit}>
            <div className="button-icon-wrapper">
              <ClipboardCheck size={24} />
            </div>
            <div className="button-text-wrapper">
              <div className="button-main-text">Mulai Shift & Buka Kasir</div>
              <div className="button-sub-text">Siap melayani pelanggan</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MulaiShift;