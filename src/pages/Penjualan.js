import React, { useMemo, useState } from 'react';
import { ShoppingBag, DollarSign, CreditCard, Filter } from 'lucide-react';

export default function Penjualan({ penjualan }) {
  const [filterMetode, setFilterMetode] = useState('SEMUA');
  const [filterJenisTeh, setFilterJenisTeh] = useState('SEMUA');

  // Get unique tea types from all transactions
  const jenisTehList = useMemo(() => {
    const types = new Set();
    penjualan.forEach(t => {
      t.items?.forEach(item => {
        if (item.nama) types.add(item.nama);
      });
    });
    return Array.from(types).sort();
  }, [penjualan]);

  // Filter transactions
  const filteredPenjualan = useMemo(() => {
    return penjualan.filter(t => {
      // Filter by payment method
      if (filterMetode !== 'SEMUA' && t.metode !== filterMetode) {
        return false;
      }
      
      // Filter by tea type
      if (filterJenisTeh !== 'SEMUA') {
        const hasTeaType = t.items?.some(item => item.nama === filterJenisTeh);
        if (!hasTeaType) return false;
      }
      
      return true;
    });
  }, [penjualan, filterMetode, filterJenisTeh]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    const total = filteredPenjualan.reduce((sum, t) => sum + t.total, 0);
    const qris = filteredPenjualan.filter(t => t.metode === 'QRIS').reduce((sum, t) => sum + t.total, 0);
    const tunai = filteredPenjualan.filter(t => t.metode === 'TUNAI').reduce((sum, t) => sum + t.total, 0);
    
    // Count tea types
    const teaCount = {};
    filteredPenjualan.forEach(t => {
      t.items?.forEach(item => {
        if (item.nama) {
          teaCount[item.nama] = (teaCount[item.nama] || 0) + item.qty;
        }
      });
    });
    
    return { 
      total, 
      qris, 
      tunai, 
      count: filteredPenjualan.length,
      teaCount 
    };
  }, [filteredPenjualan]);

  return (
    <>
      <h1 className="page-title">Data Penjualan</h1>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-card">
          <div className="filter-header">
            <Filter size={20} />
            <span>Filter Data</span>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label className="filter-label">Metode Pembayaran</label>
              <select 
                className="filter-select"
                value={filterMetode}
                onChange={(e) => setFilterMetode(e.target.value)}
              >
                <option value="SEMUA">Semua Metode</option>
                <option value="QRIS">QRIS</option>
                <option value="TUNAI">Tunai</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Jenis Teh</label>
              <select 
                className="filter-select"
                value={filterJenisTeh}
                onChange={(e) => setFilterJenisTeh(e.target.value)}
              >
                <option value="SEMUA">Semua Jenis</option>
                {jenisTehList.map(tea => (
                  <option key={tea} value={tea}>{tea}</option>
                ))}
              </select>
            </div>

            {(filterMetode !== 'SEMUA' || filterJenisTeh !== 'SEMUA') && (
              <button 
                className="filter-reset-btn"
                onClick={() => {
                  setFilterMetode('SEMUA');
                  setFilterJenisTeh('SEMUA');
                }}
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-header">
            <DollarSign size={22} />
            <div className="stat-title">Total Penjualan</div>
          </div>
          <div className="stat-amount">Rp {stats.total.toLocaleString('id-ID')}</div>
          <div className="stat-subtitle">{stats.count} transaksi</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-header">
            <CreditCard size={22} />
            <div className="stat-title">Pembayaran QRIS</div>
          </div>
          <div className="stat-amount">Rp {stats.qris.toLocaleString('id-ID')}</div>
          <div className="stat-subtitle">
            {filteredPenjualan.filter(t => t.metode === 'QRIS').length} transaksi
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <ShoppingBag size={22} />
            <div className="stat-title">Pembayaran Tunai</div>
          </div>
          <div className="stat-amount">Rp {stats.tunai.toLocaleString('id-ID')}</div>
          <div className="stat-subtitle">
            {filteredPenjualan.filter(t => t.metode === 'TUNAI').length} transaksi
          </div>
        </div>
      </div>

      {/* Tea Count Section */}
      {Object.keys(stats.teaCount).length > 0 && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <h3 className="section-title">Jumlah Terjual per Jenis</h3>
          <div className="tea-count-grid">
            {Object.entries(stats.teaCount)
              .sort((a, b) => b[1] - a[1])
              .map(([tea, count]) => (
                <div key={tea} className="tea-count-item">
                  <div className="tea-count-name">{tea}</div>
                  <div className="tea-count-badge">{count} cup</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="table-container">
        <h3 className="section-title">Rincian Transaksi</h3>
        {filteredPenjualan.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p className="empty-state-text">
              {penjualan.length === 0 
                ? 'Belum ada transaksi' 
                : 'Tidak ada transaksi yang sesuai dengan filter'}
            </p>
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
              {filteredPenjualan.map((t, i) => (
                <tr key={i}>
                  <td>{new Date(t.waktu).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}</td>
                  <td>
                    {t.items?.map((item, idx) => (
                      <div key={idx} className="transaction-item">
                        {item.nama} <span className="item-qty">({item.qty}x)</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    <span className={`payment-badge ${t.metode?.toLowerCase()}`}>
                      {t.metode}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#C85A00' }}>
                    Rp {t.total.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}