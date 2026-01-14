import { useState, useEffect } from "react";
import PaymentModal from "../components/PaymentModal";
import "../App.css";

export default function Kasir({ addPenjualan, shift, onUpdateShift }) {
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  // Get menu from stokJenisTeh
  const menu = shift?.stokJenisTeh || [];

  const addToCart = (item) => {
    // Check if there's enough stock
    const currentStok = item.stokAwal || 0;
    const currentInCart = cart.find(c => c.id === item.id)?.qty || 0;
    const soldCount = getSoldCount(item.namaItem);
    const availableStok = currentStok - soldCount - currentInCart;

    if (availableStok <= 0) {
      alert(`Stok ${item.namaItem} habis!`);
      return;
    }

    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { 
        id: item.id, 
        nama: item.namaItem, 
        harga: item.harga,
        qty: 1 
      }]);
    }
  };

  const getSoldCount = (namaItem) => {
    const transaksi = shift?.transaksi || [];
    let total = 0;
    transaksi.forEach(t => {
      t.items?.forEach(item => {
        if (item.nama === namaItem) {
          total += item.qty || 0;
        }
      });
    });
    return total;
  };

  const getAvailableStok = (item) => {
    const soldCount = getSoldCount(item.namaItem);
    const currentStok = item.stokAwal || 0;
    return Math.max(0, currentStok - soldCount);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    // Check stock availability
    const cartItem = cart.find(c => c.id === itemId);
    const menuItem = menu.find(m => m.id === itemId);
    if (menuItem) {
      const soldCount = getSoldCount(menuItem.namaItem);
      const availableStok = menuItem.stokAwal - soldCount;
      
      if (newQty > availableStok) {
        alert(`Stok tidak cukup! Tersisa ${availableStok} cup`);
        return;
      }
    }

    setCart(
      cart.map((c) =>
        c.id === itemId ? { ...c, qty: newQty } : c
      )
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.harga * item.qty,
    0
  );

  // PERBAIKAN: Fungsi ini yang diperbaiki
  const handleConfirmPayment = (metode) => {
    // Calculate total cups used
    const totalCups = cart.reduce((sum, item) => sum + item.qty, 0);
    
    // Check if enough cups available
    const currentCups = (shift?.stokDasar?.sisaCup || 0) + (shift?.stokDasar?.cupBesar || 0);
    if (totalCups > currentCups) {
      alert(`Stok cup tidak cukup! Tersisa ${currentCups} cup`);
      return;
    }

    // Create transaction object
    const newTransaction = {
      metode,
      total,
      items: cart,
      waktu: new Date().toISOString()
    };

    // Add transaction
    addPenjualan(newTransaction);

    // Update cup stock AND add transaction to shift
    const updatedShift = {
      ...shift,
      stokDasar: {
        ...shift.stokDasar,
        sisaCup: Math.max(0, currentCups - totalCups),
        cupBesar: 0
      },
      transaksi: [...(shift.transaksi || []), newTransaction]
    };
    onUpdateShift(updatedShift);

    setCart([]);
    setShowPayment(false);
    alert(`Pembayaran berhasil!\nTotal: Rp ${total.toLocaleString('id-ID')}\nCup digunakan: ${totalCups}`);
  };

  return (
    <>
      <h1 className="page-title">Kasir</h1>
      
      {menu.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">Belum ada menu tersedia</p>
          <p style={{ color: '#666', marginTop: 10 }}>Silakan tambahkan menu di halaman Stok terlebih dahulu</p>
        </div>
      ) : (
        <div className="kasir-container">
          <div className="menu-section">
            <div className="section-card">
              <h2 className="section-title">Menu Teh</h2>
              <div className="menu-grid">
                {menu.map((item) => {
                  const availableStok = getAvailableStok(item);
                  const isOutOfStock = availableStok === 0;
                  
                  return (
                    <div
                      key={item.id}
                      className={`menu-item ${isOutOfStock ? 'out-of-stock' : ''}`}
                      onClick={() => !isOutOfStock && addToCart(item)}
                    >
                      <h4 className="menu-item-name">{item.namaItem}</h4>
                      <p className="menu-item-price">Rp {item.harga?.toLocaleString('id-ID')}</p>
                      <span className={`stok-badge ${isOutOfStock ? 'empty' : availableStok < 5 ? 'low' : 'available'}`}>
                        {isOutOfStock ? 'Habis' : `Stok: ${availableStok}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="cart-section">
            <div className="section-card">
              <h2 className="section-title">Pesanan</h2>

              {/* Cup Stock Info */}
              <div className="cup-stock-info">
                <span>Cup Tersedia:</span>
                <strong>{((shift?.stokDasar?.sisaCup || 0) + (shift?.stokDasar?.cupBesar || 0))} pcs</strong>
              </div>

              {cart.length === 0 ? (
                <p className="cart-empty">Belum ada pesanan</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-header">
                          <span className="cart-item-name">{item.nama}</span>
                          <button 
                            className="cart-item-remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.qty - 1)}
                            >
                              −
                            </button>
                            <span className="quantity-value">{item.qty}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => updateQuantity(item.id, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="cart-item-price">
                            Rp {(item.qty * item.harga).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-total">
                    <div className="cart-total-row">
                      <span>Total</span>
                      <strong className="cart-total-amount">Rp {total.toLocaleString('id-ID')}</strong>
                    </div>
                    <button
                      className="cart-checkout-btn"
                      onClick={() => setShowPayment(true)}
                    >
                      Bayar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {showPayment && (
            <PaymentModal
              total={total}
              onConfirm={handleConfirmPayment}
              onClose={() => setShowPayment(false)}
            />
          )}
        </div>
      )}
    </>
  );
}