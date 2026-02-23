
import React from 'react';
import { handlePayment } from '@/lib/razorpay';

interface SubscriptionCardProps {
  planName: string;
  description: string;
  price: number;
  // Plan identifiers required by handlePayment
  planDocumentId: string;
  tierId: string;
  durationCode: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    mobile: string;
    profileId: string;
  };
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  planName,
  description,
  price,
  planDocumentId,
  tierId,
  durationCode,
  user,
}) => {
  const [loading, setLoading] = React.useState(false);

  const onPay = async () => {
    try {
      setLoading(true);
      await handlePayment(
        {
          documentId: planDocumentId,
          current_price: price,
          plan_name: planName,
          tier_id: tierId,
          duration_code: durationCode,
        },
        user
      );
    } catch (error) {
      console.error('Payment failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold text-gray-800">{planName}</h2>
      <p className="text-gray-600 mt-2">{description}</p>
      <div className="mt-4 text-3xl font-bold text-gray-900">₹{price}</div>

      <button
        onClick={onPay}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default SubscriptionCard;
