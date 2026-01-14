import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Package, Coffee, Edit2, Save } from 'lucide-react';

function Stok({ shift, onUpdateShift, onBack, onNavigate, onEndShift }) {
  const [openBuatTeh, setOpenBuatTeh] = useState(false);
  const [openTambahItem, setOpenTambahItem] = useState(false);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const stokDasar = shift?.stokDasar || { sisaCup: 0, cupBesar: 0, gula: 0, teh: 0 };
  const pembuatanTeh = shift?.pembuatanTeh || [];
  const stokJenisTeh = shift?.stokJenisTeh || [];

  const [localStokDasar, setLocalStokDasar] = useState({
    sisaCup: stokDasar.sisaCup ?? 0,
    cupBesar: stokDasar.cupBesar ?? 0,
    gula: stokDasar.gula ?? 0,
    teh: stokDasar.teh ?? 0
  });

  const [buatTehJenis, setBuatTehJenis] = useState('');
  const [buatTehGula, setBuatTehGula] = useState(0);
  const [buatTehTeh, setBuatTehTeh] = useState(0);

  const [itemNama, setItemNama] = useState('');
  const [itemHarga, setItemHarga] = useState(0);
  const [itemStokAwal, setItemStokAwal] = useState(0);
  const [itemSatuan, setItemSatuan] = useState('cup');

  const totalCup = useMemo(() => {
    const a = Number(localStokDasar.sisaCup) || 0;
    const b = Number(localStokDasar.cupBesar) || 0;
    return a + b;
  }, [localStokDasar]);

  const soldCountByName = useMemo(() => {
    const map = new Map();
    const transaksi = shift?.transaksi || [];
    for (const t of transaksi) {
      const items = t.items || [];
      for (const it of items) {
        const key = (it.nama || '').trim();
        const qty = Number(it.qty) || 0;
        if (!key) continue;
        map.set(key, (map.get(key) || 0) + qty);
      }
    }
    return map;
  }, [shift?.transaksi]);

  const commitStokDasar = (next) => {
    const updatedShift = {
      ...shift,
      stokDasar: {
        sisaCup: Math.max(0, Number(next.sisaCup) || 0),
        cupBesar: Math.max(0, Number(next.cupBesar) || 0),
        gula: Math.max(0, Number(next.gula) || 0),
        teh: Math.max(0, Number(next.teh) || 0)
      }
    };
    onUpdateShift(updatedShift);
  };

  const handleStokChange = (key, value) => {
    const next = { ...localStokDasar, [key]: value };
    setLocalStokDasar(next);
    commitStokDasar(next);
  };

  const resetBuatTeh = () => {
    setBuatTehJenis('');
    setBuatTehGula(0);
    setBuatTehTeh(0);
  };

  const resetTambahItem = () => {
    setItemNama('');
    setItemHarga(0);
    setItemStokAwal(0);
    setItemSatuan('cup');
  };

  const handleBuatTeh = () => {
    const gulaDipakai = Math.max(0, Number(buatTehGula) || 0);
    const tehDipakai = Math.max(0, Number(buatTehTeh) || 0);

    const gulaTersedia = Math.max(0, Number(localStokDasar.gula) || 0);
    const tehTersedia = Math.max(0, Number(localStokDasar.teh) || 0);

    const gulaFinal = Math.min(gulaDipakai, gulaTersedia);
    const tehFinal = Math.min(tehDipakai, tehTersedia);

    const record = {
      id: Date.now(),
      waktu: new Date().toISOString(),
      jenisTeh: buatTehJenis.trim(),
      gulaKg: gulaFinal,
      tehGram: tehFinal
    };

    const nextStok = {
      ...localStokDasar,
      gula: gulaTersedia - gulaFinal,
      teh: tehTersedia - tehFinal
    };

    const updatedShift = {
      ...shift,
      stokDasar: {
        sisaCup: Math.max(0, Number(nextStok.sisaCup) || 0),
        cupBesar: Math.max(0, Number(nextStok.cupBesar) || 0),
        gula: Math.max(0, Number(nextStok.gula) || 0),
        teh: Math.max(0, Number(nextStok.teh) || 0)
      },
      pembuatanTeh: [...pembuatanTeh, record]
    };

    setLocalStokDasar(nextStok);
    onUpdateShift(updatedShift);
    setOpenBuatTeh(false);
    resetBuatTeh();
  };

  const handleTambahItem = () => {
    const newItem = {
      id: Date.now(),
      namaItem: itemNama.trim(),
      harga: Math.max(0, Number(itemHarga) || 0),
      stokAwal: Math.max(0, Number(itemStokAwal) || 0),
      satuan: itemSatuan.trim()
    };

    const updatedShift = {
      ...shift,
      stokJenisTeh: [...stokJenisTeh, newItem]
    };

    onUpdateShift(updatedShift);
    setOpenTambahItem(false);
    resetTambahItem();
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemNama(item.namaItem);
    setItemHarga(item.harga);
    setItemStokAwal(item.stokAwal);
    setItemSatuan(item.satuan || 'cup');
    setOpenEditItem(true);
  };

  const handleUpdateItem = () => {
    const updatedItems = stokJenisTeh.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          namaItem: itemNama.trim(),
          harga: Math.max(0, Number(itemHarga) || 0),
          stokAwal: Math.max(0, Number(itemStokAwal) || 0),
          satuan: itemSatuan.trim()
        };
      }
      return item;
    });

    const updatedShift = {
      ...shift,
      stokJenisTeh: updatedItems
    };

    onUpdateShift(updatedShift);
    setOpenEditItem(false);
    setEditingItem(null);
    resetTambahItem();
  };

  const updateStokAwalItem = (id, value) => {
    const next = stokJenisTeh.map((it) => {
      if (it.id !== id) return it;
      return { ...it, stokAwal: Math.max(0, Number(value) || 0) };
    });

    const updatedShift = { ...shift, stokJenisTeh: next };
    onUpdateShift(updatedShift);
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
          <div className="sidebar-user-name">{shift?.karyawan || 'Karyawan'}</div>
          <div className="sidebar-user-shift">Shift {shift?.shift || 'Pagi'}</div>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-menu-item" onClick={onBack}>Kasir</div>
          <div className="sidebar-menu-item" onClick={() => onNavigate && onNavigate('penjualan')}>Penjualan</div>
          <div className="sidebar-menu-item" onClick={() => onNavigate && onNavigate('pengeluaran')}>Pengeluaran</div>
          <div className="sidebar-menu-item active">Stok</div>
        </div>

        <button className="sidebar-end-shift" onClick={() => onEndShift && onEndShift()}>
          Akhiri Shift
        </button>
      </div>

      <div className="main-content">
        <h1 className="page-title">Manajemen Stok</h1>

        <div className="stok-section">
          <div className="section-card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={20} />
              Stok Dasar
            </div>

            <table className="stok-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Jumlah</th>
                  <th>Satuan</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sisa Cup</td>
                  <td>
                    <input
                      className="stok-input"
                      type="number"
                      min="0"
                      value={localStokDasar.sisaCup}
                      onChange={(e) => handleStokChange('sisaCup', e.target.value)}
                    />
                  </td>
                  <td>pcs</td>
                  <td className="status-text warning">dari shift sebelumnya</td>
                </tr>
                <tr>
                  <td>Cup Besar</td>
                  <td>
                    <input
                      className="stok-input"
                      type="number"
                      min="0"
                      value={localStokDasar.cupBesar}
                      onChange={(e) => handleStokChange('cupBesar', e.target.value)}
                    />
                  </td>
                  <td>pcs</td>
                  <td className="status-text warning">stok baru</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700 }}>Total Cup</td>
                  <td style={{ fontWeight: 700 }}>{totalCup}</td>
                  <td style={{ fontWeight: 700 }}>pcs</td>
                  <td className="status-text success">otomatis berkurang saat transaksi</td>
                </tr>
                <tr>
                  <td>Gula</td>
                  <td>
                    <input
                      className="stok-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={localStokDasar.gula}
                      onChange={(e) => handleStokChange('gula', e.target.value)}
                    />
                  </td>
                  <td>kg</td>
                  <td className="status-text success">stok gula tersedia</td>
                </tr>
                <tr>
                  <td>Teh</td>
                  <td>
                    <input
                      className="stok-input"
                      type="number"
                      min="0"
                      step="1"
                      value={localStokDasar.teh}
                      onChange={(e) => handleStokChange('teh', e.target.value)}
                    />
                  </td>
                  <td>gram</td>
                  <td className="status-text success">stok teh tersedia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="stok-section">
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Coffee size={20} />
                Pembuatan Teh
              </div>
              <button className="add-button" onClick={() => setOpenBuatTeh(true)}>
                <Plus size={18} />
                Buat Teh Baru
              </button>
            </div>

            {pembuatanTeh.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">☕</div>
                <div className="empty-state-text">Belum ada riwayat pembuatan teh</div>
              </div>
            ) : (
              <table className="stok-table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis Teh</th>
                    <th>Gula Digunakan</th>
                    <th>Teh Digunakan</th>
                  </tr>
                </thead>
                <tbody>
                  {pembuatanTeh.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{r.jenisTeh}</td>
                      <td>{Number(r.gulaKg || 0)} kg</td>
                      <td>{Number(r.tehGram || 0)} gram</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="stok-section">
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 15 }}>
              <div>
                <div className="section-title">Menu & Stok Jenis Teh</div>
                <p style={{ color: '#666', fontSize: 14, marginTop: 5 }}>
                  Data ini akan muncul di kasir dan otomatis berkurang saat transaksi
                </p>
              </div>
              <button className="add-button" onClick={() => setOpenTambahItem(true)}>
                <Plus size={18} />
                Tambah Menu
              </button>
            </div>

            {stokJenisTeh.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-text">Belum ada menu tersedia</div>
                <p style={{ color: '#999', marginTop: 10 }}>Klik "Tambah Menu" untuk menambahkan jenis teh baru</p>
              </div>
            ) : (
              <table className="stok-table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>Nama Menu</th>
                    <th>Harga</th>
                    <th>Stok Awal</th>
                    <th>Terjual</th>
                    <th>Stok Akhir</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {stokJenisTeh.map((it) => {
                    const terjual = soldCountByName.get(it.namaItem) || 0;
                    const stokAwalNum = Math.max(0, Number(it.stokAwal) || 0);
                    const stokAkhir = Math.max(0, stokAwalNum - terjual);
                    const isLowStock = stokAkhir < 5 && stokAkhir > 0;
                    const isOutOfStock = stokAkhir === 0;
                    
                    return (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 600 }}>{it.namaItem}</td>
                        <td>Rp {Number(it.harga || 0).toLocaleString('id-ID')}</td>
                        <td>
                          <input
                            className="stok-input"
                            type="number"
                            min="0"
                            value={stokAwalNum}
                            onChange={(e) => updateStokAwalItem(it.id, e.target.value)}
                          />
                          <span style={{ marginLeft: 10, color: '#666', fontSize: 13 }}>{it.satuan}</span>
                        </td>
                        <td>{terjual}</td>
                        <td>
                          <span className={`stok-badge-table ${isOutOfStock ? 'empty' : isLowStock ? 'low' : 'available'}`}>
                            {stokAkhir}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditItem(it)}
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Buat Teh */}
        {openBuatTeh && (
          <div className="modal-overlay" onClick={() => { setOpenBuatTeh(false); resetBuatTeh(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Buat Teh Baru</div>

              <div className="section-card" style={{ padding: 16, marginBottom: 20, background: '#EAF3FF' }}>
                <div style={{ fontWeight: 700, color: '#6B3410', marginBottom: 8 }}>Stok Tersedia:</div>
                <div style={{ display: 'flex', gap: 30, color: '#3B5AA6' }}>
                  <div>Gula: <span style={{ fontWeight: 800 }}>{Number(localStokDasar.gula || 0)} kg</span></div>
                  <div>Teh: <span style={{ fontWeight: 800 }}>{Number(localStokDasar.teh || 0)} gram</span></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Jenis Teh</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Teh Manis Original"
                  value={buatTehJenis}
                  onChange={(e) => setBuatTehJenis(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Gula (kg)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.1"
                    value={buatTehGula}
                    onChange={(e) => setBuatTehGula(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Teh (gram)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="1"
                    value={buatTehTeh}
                    onChange={(e) => setBuatTehTeh(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setOpenBuatTeh(false); resetBuatTeh(); }}>
                  Batal
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!buatTehJenis.trim()}
                  onClick={handleBuatTeh}
                >
                  Buat Teh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Item */}
        {openTambahItem && (
          <div className="modal-overlay" onClick={() => { setOpenTambahItem(false); resetTambahItem(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Tambah Menu Baru</div>

              <div className="form-group">
                <label className="form-label required">Nama Menu</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Es Teh Manis"
                  value={itemNama}
                  onChange={(e) => setItemNama(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Harga</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={itemHarga}
                  onChange={(e) => setItemHarga(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Stok Awal</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={itemStokAwal}
                    onChange={(e) => setItemStokAwal(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Satuan</label>
                  <input
                    className="form-input"
                    placeholder="cup, gelas"
                    value={itemSatuan}
                    onChange={(e) => setItemSatuan(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setOpenTambahItem(false); resetTambahItem(); }}>
                  Batal
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!itemNama.trim() || !itemSatuan.trim() || !itemHarga}
                  onClick={handleTambahItem}
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Edit Item */}
        {openEditItem && (
          <div className="modal-overlay" onClick={() => { setOpenEditItem(false); setEditingItem(null); resetTambahItem(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Edit Menu</div>

              <div className="form-group">
                <label className="form-label required">Nama Menu</label>
                <input
                  className="form-input"
                  placeholder="Contoh: Es Teh Manis"
                  value={itemNama}
                  onChange={(e) => setItemNama(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Harga</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="5000"
                  value={itemHarga}
                  onChange={(e) => setItemHarga(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Stok Awal</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={itemStokAwal}
                    onChange={(e) => setItemStokAwal(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Satuan</label>
                  <input
                    className="form-input"
                    placeholder="cup, gelas"
                    value={itemSatuan}
                    onChange={(e) => setItemSatuan(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => { setOpenEditItem(false); setEditingItem(null); resetTambahItem(); }}>
                  Batal
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!itemNama.trim() || !itemSatuan.trim() || !itemHarga}
                  onClick={handleUpdateItem}
                >
                  <Save size={16} style={{ marginRight: 5 }} />
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

export default Stok;