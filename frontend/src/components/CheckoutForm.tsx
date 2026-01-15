import React, { useState } from 'react';
import './CheckoutForm.css';

interface CheckoutFormProps {
  onSubmit: (address: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ address?: string }>({});

  // Debug: Log when component mounts or props change
  React.useEffect(() => {
    console.log('📋 CheckoutForm mounted. isLoading:', isLoading);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { address?: string } = {};
    
    if (!address.trim()) {
      newErrors.address = 'Please enter a delivery address';
    } else if (address.trim().length < 10) {
      newErrors.address = 'Please enter a complete address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(address.trim());
  };

  return (
    <div className="checkout-form-container">
      <div className="checkout-form">
        <h2>📍 Delivery Address</h2>
        <p className="checkout-description">
          Please enter your delivery address to complete your order.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="address">Full Address *</label>
            <textarea
              id="address"
              name="address"
              value={address}
              onChange={(e) => {
                console.log('📝 Address input changed:', e.target.value);
                setAddress(e.target.value);
                if (errors.address) {
                  setErrors({ ...errors, address: undefined });
                }
              }}
              onFocus={() => {
                console.log('📝 Address field focused, isLoading:', isLoading);
              }}
              placeholder="e.g., 123 Main Street, London, SW1A 1AA"
              rows={4}
              className={errors.address ? 'error' : ''}
              disabled={isLoading}
              autoFocus={!isLoading}
              style={{ 
                width: '100%',
                resize: 'vertical',
                pointerEvents: isLoading ? 'none' : 'auto',
                userSelect: 'text',
                WebkitUserSelect: 'text',
                cursor: isLoading ? 'not-allowed' : 'text',
                zIndex: 1
              }}
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          <div className="form-actions">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !address.trim()}
            >
              {isLoading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
