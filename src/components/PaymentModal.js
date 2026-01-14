import React from "react";
import { CreditCard, Banknote, X } from "lucide-react";
import "../App.css";

export default function PaymentModal({ total, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h3 className="payment-modal-title">Pilih Metode Pembayaran</h3>
        <p className="payment-modal-total">Rp {total.toLocaleString('id-ID')}</p>

        <div className="payment-methods-grid">
          <button
            className="payment-method-card qris"
            onClick={() => onConfirm("QRIS")}
          >
            <div className="payment-icon-wrapper">
              <CreditCard size={32} />
            </div>
            <div className="payment-method-info">
              <div className="payment-method-name">QRIS</div>
              <div className="payment-method-desc">Scan QR Code</div>
            </div>
          </button>

          <button
            className="payment-method-card cash"
            onClick={() => onConfirm("TUNAI")}
          >
            <div className="payment-icon-wrapper">
              <Banknote size={32} />
            </div>
            <div className="payment-method-info">
              <div className="payment-method-name">Tunai</div>
              <div className="payment-method-desc">Bayar Cash</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}