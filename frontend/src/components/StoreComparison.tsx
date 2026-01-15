import React from 'react';
import { StoreComparison } from '../types';
import './StoreComparison.css';

interface StoreComparisonProps {
  comparisons: StoreComparison[];
  onSelectStore?: (store: string, total: number) => void;
  selectedStore?: string;
}

export const StoreComparisonDisplay: React.FC<StoreComparisonProps> = ({
  comparisons,
  onSelectStore,
  selectedStore,
}) => {

  // Debug logging
  React.useEffect(() => {
    console.log('🔄 StoreComparisonDisplay received comparisons:', comparisons);
    comparisons.forEach((comp, idx) => {
      console.log(`  Store ${idx + 1}: ${comp.store}, Total: £${comp.total}, Items: ${comp.items?.length || 0}`);
      if (comp.items) {
        console.log(`    Items:`, comp.items.map((i: any) => `${i.item}: £${i.price}`));
      }
    });
  }, [comparisons]);

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  const sortedByPrice = [...comparisons].sort((a, b) => a.total - b.total);
  const sortedByTime = [...comparisons].sort((a, b) => a.deliveryTimeHours - b.deliveryTimeHours);
  const cheapest = sortedByPrice[0];
  const fastest = sortedByTime[0];

  return (
    <div className="store-comparison">
      <h3>🏪 Compare Stores</h3>
      <p className="comparison-subtitle">Click on a store card to see individual item prices</p>
      <div className="comparison-cards">
        {comparisons.map((comparison) => {
          const isCheapest = comparison.store === cheapest.store;
          const isFastest = comparison.store === fastest.store;
          const isSelected = comparison.store === selectedStore;

          return (
            <div
              key={comparison.store}
              className={`store-card ${isSelected ? 'selected' : ''} ${
                isCheapest ? 'cheapest' : ''
              } ${isFastest ? 'fastest' : ''}`}
            >
              <div className="store-card-header">
                <div className="store-name-section">
                  <div className="store-name">{comparison.store}</div>
                  <div className="store-badges">
                    {isCheapest && <span className="badge cheapest-badge">💰 Cheapest</span>}
                    {isFastest && <span className="badge fastest-badge">⚡ Fastest</span>}
                  </div>
                </div>
              </div>

              {/* Individual Item Prices - Always show as tiles */}
              <div className="store-items-section">
                {comparison.items && comparison.items.length > 0 ? (
                  <div className="items-grid">
                    {comparison.items.map((item, idx) => (
                      <div key={`${comparison.store}-${item.item}-${idx}`} className={`item-tile ${!item.found ? 'item-not-found' : ''}`}>
                        <div className="item-tile-name">{item.item}</div>
                        <div className="item-tile-price">£{item.price.toFixed(2)}</div>
                        {!item.found && <div className="item-estimated">Estimated</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="items-placeholder">No items available</div>
                )}
              </div>

              <div className="store-details">
                <div className="detail-item total-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value total-price">£{comparison.total.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery:</span>
                  <span className="detail-value">
                    {comparison.deliveryTimeHours} hour{comparison.deliveryTimeHours > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {onSelectStore && (
                <button
                  className={`select-button ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStore(comparison.store, comparison.total);
                  }}
                >
                  {isSelected ? 'Selected ✓' : 'Select Store'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
