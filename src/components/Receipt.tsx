'use client';

import { CartItem } from '@/types';

interface ReceiptProps {
  items: CartItem[];
  total: number;
  orderNumber: string;
  timestamp: Date;
  onClose: () => void;
  onPrint: () => void;
}

export default function Receipt({ items, total, orderNumber, timestamp, onClose, onPrint }: ReceiptProps) {
  const tax = total * 0.08; // 8% tax
  const finalTotal = total + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Receipt Header */}
        <div className="p-6 border-b-2" style={{borderColor: '#FFE1E0'}}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{color: '#7F55B1'}}>
              PopStreet Bakes
            </h2>
            <p className="text-sm" style={{color: '#9B7EBD'}}>
              Fresh Baked Daily • Made with Love
            </p>
            <p className="text-xs mt-2" style={{color: '#9B7EBD'}}>
              123 Baker Street, Sweet City, SC 12345
            </p>
            <p className="text-xs" style={{color: '#9B7EBD'}}>
              Phone: (555) 123-BAKE
            </p>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6" id="receipt-content">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold" style={{color: '#7F55B1'}}>
              Order #{orderNumber}
            </p>
            <p className="text-sm" style={{color: '#9B7EBD'}}>
              {timestamp.toLocaleDateString()} at {timestamp.toLocaleTimeString()}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium" style={{color: '#7F55B1'}}>
                    {item.productName}
                  </p>
                  <p className="text-sm" style={{color: '#9B7EBD'}}>
                    ${item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold" style={{color: '#7F55B1'}}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t-2 pt-4 space-y-2" style={{borderColor: '#FFE1E0'}}>
            <div className="flex justify-between">
              <p style={{color: '#9B7EBD'}}>Subtotal:</p>
              <p style={{color: '#7F55B1'}}>${total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p style={{color: '#9B7EBD'}}>Tax (8%):</p>
              <p style={{color: '#7F55B1'}}>${tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 pt-2" style={{borderColor: '#F49BAB'}}>
              <p style={{color: '#7F55B1'}}>Total:</p>
              <p style={{color: '#7F55B1'}}>${finalTotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t-2" style={{borderColor: '#FFE1E0'}}>
            <p className="text-sm font-medium mb-2" style={{color: '#7F55B1'}}>
              Thank you for your purchase!
            </p>
            <p className="text-xs" style={{color: '#9B7EBD'}}>
              Follow us @PopStreetBakes
            </p>
            <p className="text-xs" style={{color: '#9B7EBD'}}>
              Visit us again soon! 🧁
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t-2 flex gap-3" style={{borderColor: '#FFE1E0'}}>
          <button
            onClick={onPrint}
            className="flex-1 py-3 px-4 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            style={{backgroundColor: '#7F55B1'}}
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            style={{
              backgroundColor: '#FFE1E0',
              color: '#7F55B1',
              border: '2px solid #F49BAB'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 