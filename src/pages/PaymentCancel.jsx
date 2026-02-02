// PaymentCancel.jsx
import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <XCircle size={48} className="text-red-600 mx-auto" />
        <h2 className="text-xl font-bold mt-4">Payment Cancelled</h2>
        <p className="text-gray-600 mt-2">
          You cancelled the payment.
        </p>

        <Link
          to="/dashboard/billing"
          className="inline-block mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
        >
          Back to Billing
        </Link>
      </div>
    </div>
  );
}
