// src/pages/Kasir.js
import React, { useState, useMemo } from "react";
import PaymentModal from "../components/PaymentModal";
import "../App.css";

export default function Kasir({ addPenjualan, shift, onUpdateShift }) {
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  
  // ✅ State Baru untuk Fitur Pembayaran & Kembalian
  const [uangDiterimaInput, setUangDiterimaInput] = useState("");

  const menu = shift?.stokJenisTeh || [];

  const addToCart = (item) => {
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
      setCart(cart.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
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
    const newCart = cart.filter(c => c.id !== itemId);
    setCart(newCart);
    if (newCart.length === 0) setUangDiterimaInput("");
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    const menuItem = menu.find(m => m.id === itemId);
    if (menuItem) {
      const soldCount = getSoldCount(menuItem.namaItem);
      const availableStok = menuItem.stokAwal - soldCount;
      
      if (newQty > availableStok) {
        alert(`Stok tidak cukup! Tersisa ${availableStok} cup`);
        return;
      }
    }

    setCart(cart.map((c) => c.id === itemId ? { ...c, qty: newQty } : c));
  };

  const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const totalQtyInCart = cart.reduce((sum, item) => sum + item.qty, 0);

  // ✅ LOGIKA OTOMATIS TAMBAH "000": Mengonversi input ringkas (cth: 50 -> 50000)
  const nominalUangDiterima = useMemo(() => {
    const nilaiMentah = parseInt(uangDiterimaInput) || 0;
    if (nilaiMentah > 0 && nilaiMentah < 1000) {
      return nilaiMentah * 1000;
    }
    return nilaiMentah;
  }, [uangDiterimaInput]);

  // ✅ Hitung nilai sisa kembalian uang secara live
  const kembalian = useMemo(() => {
    if (nominalUangDiterima <= 0) return 0;
    return nominalUangDiterima - total;
  }, [nominalUangDiterima, total]);

  const handleConfirmPayment = (metode) => {
    const totalCups = cart.reduce((sum, item) => sum + item.qty, 0);
    const currentCups = (shift?.stokDasar?.sisaCup || 0) + (shift?.stokDasar?.cupBesar || 0);
    
    if (totalCups > currentCups) {
      alert(`Stok cup tidak cukup! Tersisa ${currentCups} cup`);
      return;
    }

    // Validasi nominal pembayaran jika menggunakan metode Tunai
    if (metode === "TUNAI" && nominalUangDiterima < total) {
      alert(`Uang yang diterima (Rp ${nominalUangDiterima.toLocaleString('id-ID')}) kurang dari total tagihan!`);
      return;
    }

    let totalSusuDibutuhkan = 0;
    cart.forEach(item => {
      const namaSaja = item.nama.toLowerCase();
      if (namaSaja.includes("milk") || namaSaja.includes("thai tea") || namaSaja.includes("matcha")) {
        totalSusuDibutuhkan += 0.5 * item.qty;
      }
    });

    const stokSusuSekarang = shift?.stokDasar?.susu || 0;
    if (totalSusuDibutuhkan > stokSusuSekarang) {
      alert(`Stok Susu tidak cukup! Dibutuhkan ${totalSusuDibutuhkan} sachet, sisa stok: ${stokSusuSekarang} sachet`);
      return;
    }

    const newTransaction = {
      id: Date.now(),
      metode,
      total,
      items: cart,
      waktu: new Date().toISOString(),
      uangDiterima: metode === "TUNAI" ? nominalUangDiterima : total,
      kembalian: metode === "TUNAI" ? kembalian : 0
    };

    addPenjualan(newTransaction);

    const updatedShift = {
      ...shift,
      stokDasar: {
        ...shift.stokDasar,
        sisaCup: Math.max(0, currentCups - totalCups),
        cupBesar: 0,
        susu: Math.max(0, stokSusuSekarang - totalSusuDibutuhkan)
      },
      transaksi: [...(shift.transaksi || []), newTransaction]
    };
    
    onUpdateShift(updatedShift);
    setCart([]);
    setUangDiterimaInput("");
    setShowPayment(false);
    alert(`Pembayaran sukses! Kembalian: Rp ${newTransaction.kembalian.toLocaleString('id-ID')}`);
  };

  return (
    <>
      <h1 className="page-title">Kasir</h1>
      {menu.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">Belum ada menu tersedia</p>
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
                      <span className={`stok-badge ${isOutOfStock ? 'empty' : 'available'}`}>
                        {isOutOfStock ? 'Habis' : `Stok: ${availableStok}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {totalQtyInCart > 0 && (
                <div style={{ marginTop: '20px', padding: '12px', background: '#FFF0F5', borderRadius: '8px', borderLeft: '5px solid #FF69B4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: '#C71585' }}>
                    <span>Estimasi Cup Dipilih:</span>
                    <span>{totalQtyInCart} Cup</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="cart-section">
            <div className="section-card">
              <h2 className="section-title">Pesanan</h2>
              <div className="cup-stock-info" style={{ marginBottom: 15 }}>
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
                          <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>×</button>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.qty - 1)}>−</button>
                            <span className="quantity-value">{item.qty}</span>
                            <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                          </div>
                          <span className="cart-item-price">Rp {(item.qty * item.harga).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ✅ INTERFACE BARU: Input Nominal Bayar & Template Shortcut Uang */}
                  <div className="payment-calculation-zone" style={{ marginTop: "15px", paddingTop: "15px", borderTop: "2px dashed #EEE" }}>
                    <div className="form-group" style={{ marginBottom: "10px" }}>
                      <label className="form-label" style={{ fontWeight: "bold", fontSize: "13px", color: "#666" }}>
                        Uang Diterima (Ketik "50" untuk 50.000)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Masukkan nominal..."
                        style={{ fontSize: "16px", fontWeight: "600", padding: "8px" }}
                        value={uangDiterimaInput}
                        onChange={(e) => setUangDiterimaInput(e.target.value)}
                      />
                    </div>

                    {/* ✅ TOMBOL CEPAT TEMPLATE PECAHAN RUPIAH */}
                    <div className="money-templates-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "12px" }}>
                      <button type="button" onClick={() => setUangDiterimaInput(total.toString())} style={{ padding: "6px 2px", fontSize: "11px", fontWeight: "bold", background: "#E6F4EA", border: "1px solid #A3CFBB", borderRadius: "4px", cursor: "pointer" }}>Uang Pas</button>
                      <button type="button" onClick={() => setUangDiterimaInput("10")} style={{ padding: "6px 2px", fontSize: "11px", background: "#F1F3F4", border: "1px solid #DADCE0", borderRadius: "4px", cursor: "pointer" }}>10k</button>
                      <button type="button" onClick={() => setUangDiterimaInput("20")} style={{ padding: "6px 2px", fontSize: "11px", background: "#F1F3F4", border: "1px solid #DADCE0", borderRadius: "4px", cursor: "pointer" }}>20k</button>
                      <button type="button" onClick={() => setUangDiterimaInput("50")} style={{ padding: "6px 2px", fontSize: "11px", background: "#F1F3F4", border: "1px solid #DADCE0", borderRadius: "4px", cursor: "pointer" }}>50k</button>
                      <button type="button" onClick={() => setUangDiterimaInput("100")} style={{ padding: "6px 2px", fontSize: "11px", background: "#F1F3F4", border: "1px solid #DADCE0", borderRadius: "4px", cursor: "pointer" }}>100k</button>
                    </div>

                    {/* Konfirmasi Pembacaan Format Real Nominal & Kembalian */}
                    {nominalUangDiterima > 0 && (
                      <div style={{ padding: "10px", background: "#F8F9FA", borderRadius: "6px", fontSize: "13px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span>Total Cash:</span>
                          <span style={{ fontWeight: "600" }}>Rp {nominalUangDiterima.toLocaleString('id-ID')}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Kembalian:</span>
                          <span style={{ fontWeight: "700", color: kembalian >= 0 ? "#1e7e34" : "#dc3545" }}>
                            {kembalian >= 0 ? `Rp ${kembalian.toLocaleString('id-ID')}` : "Uang Kurang"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cart-total">
                    <div className="cart-total-row" style={{ marginBottom: '10px' }}>
                      <span>Total Bayar:</span>
                      <strong>Rp {total.toLocaleString('id-ID')}</strong>
                    </div>
                    <button className="cart-checkout-btn" onClick={() => setShowPayment(true)}>Bayar</button>
                  </div>
                </>
              )}
            </div>
          </div>
          {showPayment && (
            <PaymentModal total={total} onConfirm={handleConfirmPayment} onClose={() => setShowPayment(false)} />
          )}
        </div>
      )}
    </>
  );
}