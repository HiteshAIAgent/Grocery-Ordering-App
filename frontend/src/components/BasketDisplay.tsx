import React from 'react';
import './BasketDisplay.css';

interface BasketDisplayProps {
  items: string[];
  selectedStore?: string;
  total?: number;
  deliveryTime?: string;
}

export const BasketDisplay: React.FC<BasketDisplayProps> = ({
  items,
  selectedStore,
  total,
  deliveryTime,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="basket-display">
      <div className="basket-header">
        <h2>🛒 Your Basket</h2>
        {selectedStore && (
          <div className="store-badge">{selectedStore}</div>
        )}
      </div>

      <div className="basket-items">
        {items.map((item, index) => (
          <div key={index} className="basket-item">
            <span className="item-name">{item}</span>
          </div>
        ))}
      </div>

      {(total !== undefined || deliveryTime) && (
        <div className="basket-summary">
          {total !== undefined && (
            <div className="summary-row">
              <span>Total:</span>
              <span className="total-price">£{total.toFixed(2)}</span>
            </div>
          )}
          {deliveryTime && (
            <div className="summary-row">
              <span>Delivery:</span>
              <span>{deliveryTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
