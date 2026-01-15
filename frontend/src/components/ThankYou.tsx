import React from 'react';
import './ThankYou.css';

interface ThankYouProps {
  orderNumber?: string;
  store?: string;
  address?: string;
  onNewOrder?: () => void;
}

export const ThankYou: React.FC<ThankYouProps> = ({
  orderNumber,
  store,
  address,
  onNewOrder,
}) => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <div className="success-icon">✓</div>
        <h1>Thank You!</h1>
        <p className="thank-you-message">
          Your order has been confirmed and will be delivered soon.
        </p>

        {orderNumber && (
          <div className="order-info">
            <div className="info-item">
              <span className="info-label">Order Number:</span>
              <span className="info-value">{orderNumber}</span>
            </div>
            {store && (
              <div className="info-item">
                <span className="info-label">Store:</span>
                <span className="info-value">{store}</span>
              </div>
            )}
            {address && (
              <div className="info-item">
                <span className="info-label">Delivery Address:</span>
                <span className="info-value">{address}</span>
              </div>
            )}
          </div>
        )}

        {onNewOrder && (
          <button onClick={onNewOrder} className="new-order-button">
            Place New Order
          </button>
        )}
      </div>
    </div>
  );
};
