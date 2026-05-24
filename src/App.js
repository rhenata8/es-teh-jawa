// src/App.js
import { useState, useEffect } from "react";
import Portal from "./pages/Portal";
import MulaiShift from "./pages/MulaiShift";
import ShiftHistory from "./pages/ShiftHistory";
import ShiftDetail from "./pages/ShiftDetail";
import Kasir from "./pages/Kasir";
import Penjualan from "./pages/Penjualan";
import Pengeluaran from "./pages/Pengeluaran";
import Stok from "./pages/Stok";
import jenisTeh from "./data/jenisTeh";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('portal');
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  // ✅ PERBAIKAN: Gunakan data dari jenisTeh secara langsung agar properti objek sinkron
  const [globalMenuData, setGlobalMenuData] = useState(() => {
    return jenisTeh; 
  });

  // ✅ LOAD DATA DARI LOCAL STORAGE
  useEffect(() => {
    const loadData = () => {
      try {
        console.log('Loading data from localStorage...');
        
        const savedView = localStorage.getItem('tea-shop-view');
        if (savedView) setView(savedView);

        const savedShift = localStorage.getItem('tea-shop-current-shift');
        if (savedShift) setCurrentShift(JSON.parse(savedShift));

        const savedShifts = localStorage.getItem('tea-shop-shifts-history');
        if (savedShifts) setShifts(JSON.parse(savedShifts));

        const savedMenu = localStorage.getItem('tea-shop-global-menu');
        if (savedMenu) {
          setGlobalMenuData(JSON.parse(savedMenu));
        } else {
          // Jika di lokal kosong, pasang default bawaan device
          localStorage.setItem('tea-shop-global-menu', JSON.stringify(jenisTeh));
        }

        const savedSelected = localStorage.getItem('tea-shop-selected-shift');
        if (savedSelected) setSelectedShift(JSON.parse(savedSelected));
        
        console.log('Data loaded successfully!');
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ SAVE DATA KE LOCAL STORAGE
  useEffect(() => {
    if (isLoading) return;
    
    try {
      localStorage.setItem('tea-shop-view', view);
      localStorage.setItem('tea-shop-current-shift', JSON.stringify(currentShift));
      localStorage.setItem('tea-shop-shifts-history', JSON.stringify(shifts));
      localStorage.setItem('tea-shop-global-menu', JSON.stringify(globalMenuData));
      localStorage.setItem('tea-shop-selected-shift', JSON.stringify(selectedShift));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [view, currentShift, shifts, globalMenuData, selectedShift, isLoading]);

  const handleStartShift = (shiftData) => {
    const newShift = {
      ...shiftData,
      stokJenisTeh: [...globalMenuData]
    };
    setCurrentShift(newShift);
    setView('kasir');
  };

  const handleUpdateShift = (updatedShift) => {
    setCurrentShift(updatedShift);
    if (updatedShift.stokJenisTeh) {
      setGlobalMenuData(updatedShift.stokJenisTeh);
    }
  };

  const handleEndShift = () => {
    if (!currentShift) return;
    
    const completedShift = {
      ...currentShift,
      waktuSelesai: new Date().toISOString()
    };
    
    setShifts(prev => [...prev, completedShift]);
    
    const updatedMenuForNextShift = currentShift.stokJenisTeh.map(item => {
      const soldCount = getSoldCountForItem(item.namaItem, currentShift.transaksi);
      const remainingStock = Math.max(0, (item.stokAwal || 0) - soldCount);
      
      return {
        ...item,
        stokAwal: remainingStock
      };
    });
    
    setGlobalMenuData(updatedMenuForNextShift);
    setCurrentShift(null);
    setView('portal');
  };

  const getSoldCountForItem = (itemName, transaksi) => {
    let total = 0;
    (transaksi || []).forEach(t => {
      (t.items || []).forEach(item => {
        if (item.nama === itemName) {
          total += item.qty || 0;
        }
      });
    });
    return total;
  };

  const handleAddPenjualan = (transaksi) => {
    if (!currentShift) return;
    
    const updatedShift = {
      ...currentShift,
      transaksi: [
        ...(currentShift.transaksi || []),
        {
          ...transaksi,
          waktu: new Date().toISOString()
        }
      ]
    };
    
    setCurrentShift(updatedShift);
  };

  const handleNavigate = (page) => {
    setView(page);
  };

  const handleSelectShift = (shift) => {
    setSelectedShift(shift);
    setView('detail');
  };

  const handleBackToPortal = () => {
    setView('portal');
    setSelectedShift(null);
  };

  const handleBackToHistory = () => {
    setView('history');
    setSelectedShift(null);
  };

  const handleBackToKasir = () => {
    setView('kasir');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8E7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>☕</div>
          <div style={{ color: '#C85A00', fontSize: 20, fontWeight: 'bold' }}>Memuat data...</div>
        </div>
      </div>
    );
  }

  if (view === 'portal') {
    return <Portal onStartShift={() => setView('mulaiShift')} onViewHistory={() => setView('history')} />;
  }

  if (view === 'mulaiShift') {
    return <MulaiShift onBack={handleBackToPortal} onStart={handleStartShift} />;
  }

  if (view === 'history') {
    return <ShiftHistory shifts={shifts} onSelectShift={handleSelectShift} onBack={handleBackToPortal} />;
  }

  if (view === 'detail') {
    return <ShiftDetail shift={selectedShift} onBack={handleBackToHistory} />;
  }

  if (currentShift) {
    if (view === 'kasir') {
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
              <div className="sidebar-user-name">{currentShift.karyawan}</div>
              <div className="sidebar-user-shift">Shift {currentShift.shift}</div>
            </div>
            <div className="sidebar-menu">
              <div className="sidebar-menu-item active">Kasir</div>
              <div className="sidebar-menu-item" onClick={() => handleNavigate('penjualan')}>Penjualan</div>
              <div className="sidebar-menu-item" onClick={() => handleNavigate('pengeluaran')}>Pengeluaran</div>
              <div className="sidebar-menu-item" onClick={() => handleNavigate('stok')}>Stok</div>
            </div>
            <button className="sidebar-end-shift" onClick={handleEndShift}>Akhiri Shift</button>
          </div>
          <div className="main-content">
            <Kasir addPenjualan={handleAddPenjualan} shift={currentShift} onUpdateShift={handleUpdateShift} />
          </div>
        </div>
      );
    }

    if (view === 'penjualan') {
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
              <div className="sidebar-user-name">{currentShift.karyawan}</div>
              <div className="sidebar-user-shift">Shift {currentShift.shift}</div>
            </div>
            <div className="sidebar-menu">
              <div className="sidebar-menu-item" onClick={handleBackToKasir}>Kasir</div>
              <div className="sidebar-menu-item active">Penjualan</div>
              <div className="sidebar-menu-item" onClick={() => handleNavigate('pengeluaran')}>Pengeluaran</div>
              <div className="sidebar-menu-item" onClick={() => handleNavigate('stok')}>Stok</div>
            </div>
            <button className="sidebar-end-shift" onClick={handleEndShift}>Akhiri Shift</button>
          </div>
          <div className="main-content">
            <Penjualan penjualan={currentShift.transaksi || []} shift={currentShift} onUpdateShift={handleUpdateShift} />
          </div>
        </div>
      );
    }

    if (view === 'pengeluaran') {
      return <Pengeluaran shift={currentShift} onUpdateShift={handleUpdateShift} onBack={handleBackToKasir} onNavigate={handleNavigate} onEndShift={handleEndShift} />;
    }

    if (view === 'stok') {
      return <Stok shift={currentShift} onUpdateShift={handleUpdateShift} onBack={handleBackToKasir} onNavigate={handleNavigate} onEndShift={handleEndShift} />;
    }
  }

  return null;
}

export default App;