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
  const [view, setView] = useState('portal');
  const [currentShift, setCurrentShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);

  // Global persistent menu data that carries over between shifts
  const [globalMenuData, setGlobalMenuData] = useState(() => {
    // Initialize from jenisTeh template
    return jenisTeh.map(item => ({
      id: item.id,
      namaItem: item.nama,
      harga: item.harga,
      stokAwal: item.stok,
      satuan: 'cup'
    }));
  });

  // PERBAIKAN: Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load view
        const viewData = await window.storage.get('current-view');
        if (viewData?.value) {
          setView(viewData.value);
        }

        // Load current shift
        const shiftData = await window.storage.get('current-shift');
        if (shiftData?.value) {
          setCurrentShift(JSON.parse(shiftData.value));
        }

        // Load shifts history
        const shiftsData = await window.storage.get('shifts-history');
        if (shiftsData?.value) {
          setShifts(JSON.parse(shiftsData.value));
        }

        // Load global menu data
        const menuData = await window.storage.get('global-menu');
        if (menuData?.value) {
          setGlobalMenuData(JSON.parse(menuData.value));
        }

        // Load selected shift
        const selectedData = await window.storage.get('selected-shift');
        if (selectedData?.value) {
          setSelectedShift(JSON.parse(selectedData.value));
        }
      } catch (error) {
        console.log('No saved data found, starting fresh');
      }
    };

    loadData();
  }, []);

  // PERBAIKAN: Save data to storage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await window.storage.set('current-view', view);
        await window.storage.set('current-shift', JSON.stringify(currentShift));
        await window.storage.set('shifts-history', JSON.stringify(shifts));
        await window.storage.set('global-menu', JSON.stringify(globalMenuData));
        await window.storage.set('selected-shift', JSON.stringify(selectedShift));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };

    saveData();
  }, [view, currentShift, shifts, globalMenuData, selectedShift]);

  const handleStartShift = (shiftData) => {
    // Start new shift with current global menu data
    const newShift = {
      ...shiftData,
      stokJenisTeh: [...globalMenuData] // Copy current menu data to new shift
    };
    setCurrentShift(newShift);
    setView('kasir');
  };

  const handleUpdateShift = (updatedShift) => {
    setCurrentShift(updatedShift);
    
    // Update global menu data if stokJenisTeh changed
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
    
    // Preserve menu data for next shift but reset stokAwal to current remaining stock
    const updatedMenuForNextShift = currentShift.stokJenisTeh.map(item => {
      const soldCount = getSoldCountForItem(item.namaItem, currentShift.transaksi);
      const remainingStock = Math.max(0, (item.stokAwal || 0) - soldCount);
      
      return {
        ...item,
        stokAwal: remainingStock // Next shift starts with remaining stock
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
        ...currentShift.transaksi,
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

  // Portal View
  if (view === 'portal') {
    return (
      <Portal 
        onStartShift={() => setView('mulaiShift')}
        onViewHistory={() => setView('history')}
      />
    );
  }

  // Mulai Shift View
  if (view === 'mulaiShift') {
    return (
      <MulaiShift 
        onBack={handleBackToPortal}
        onStart={handleStartShift}
      />
    );
  }

  // Shift History View
  if (view === 'history') {
    return (
      <ShiftHistory 
        shifts={shifts}
        onSelectShift={handleSelectShift}
        onBack={handleBackToPortal}
      />
    );
  }

  // Shift Detail View
  if (view === 'detail') {
    return (
      <ShiftDetail 
        shift={selectedShift}
        onBack={handleBackToHistory}
      />
    );
  }

  // Active Shift Views
  if (currentShift) {
    // Kasir View
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

            <button className="sidebar-end-shift" onClick={handleEndShift}>
              Akhiri Shift
            </button>
          </div>

          <div className="main-content">
            <Kasir 
              addPenjualan={handleAddPenjualan} 
              shift={currentShift}
              onUpdateShift={handleUpdateShift}
            />
          </div>
        </div>
      );
    }

    // Penjualan View
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

            <button className="sidebar-end-shift" onClick={handleEndShift}>
              Akhiri Shift
            </button>
          </div>

          <div className="main-content">
            <Penjualan penjualan={currentShift.transaksi || []} />
          </div>
        </div>
      );
    }

    // Pengeluaran View
    if (view === 'pengeluaran') {
      return (
        <Pengeluaran 
          shift={currentShift}
          onUpdateShift={handleUpdateShift}
          onBack={handleBackToKasir}
          onNavigate={handleNavigate}
          onEndShift={handleEndShift}
        />
      );
    }

    // Stok View
    if (view === 'stok') {
      return (
        <Stok 
          shift={currentShift}
          onUpdateShift={handleUpdateShift}
          onBack={handleBackToKasir}
          onNavigate={handleNavigate}
          onEndShift={handleEndShift}
        />
      );
    }
  }

  return null;
}

export default App;