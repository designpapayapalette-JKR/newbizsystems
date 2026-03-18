import { computePayChecksum, computeStatusChecksum, getBase64Payload } from "./checksum";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_KEY_INDEX ?? "1";
const API_URL = process.env.PHONEPE_API_URL ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface InitiatePaymentParams {
  merchantOrderId: string;     // your payments.id (UUID)
  amount: number;              // in PAISE (rupees × 100)
  redirectUrl: string;         // where PhonePe redirects after payment
  mobileNumber?: string;
  userId?: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  paymentUrl: string | null;
  error?: string;
}

export async function initiatePhonePePayment(params: InitiatePaymentParams): Promise<PhonePePaymentResponse> {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: params.merchantOrderId,
    merchantUserId: params.userId ? `USER_${params.userId.slice(0, 12)}` : "USER_DEFAULT",
    amount: params.amount,
    redirectUrl: params.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: `${APP_URL}/api/webhooks/phonepe`,
    mobileNumber: params.mobileNumber,
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const base64Payload = getBase64Payload(payload);
  const checksum = computePayChecksum(payload, SALT_KEY, SALT_INDEX);

  try {
    const response = await fetch(`${API_URL}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        Accept: "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return { success: true, paymentUrl: data.data.instrumentResponse.redirectInfo.url };
    }

    return { success: false, paymentUrl: null, error: data.message ?? "PhonePe initiation failed" };
  } catch (err) {
    return { success: false, paymentUrl: null, error: String(err) };
  }
}

export async function checkPhonePeStatus(merchantOrderId: string): Promise<{
  success: boolean;
  status: string;
  transactionId?: string;
  amount?: number;
}> {
  const checksum = computeStatusChecksum(MERCHANT_ID, merchantOrderId, SALT_KEY, SALT_INDEX);

  try {
    const response = await fetch(`${API_URL}/pg/v1/status/${MERCHANT_ID}/${merchantOrderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    return {
      success: data.success,
      status: data.code ?? "UNKNOWN",
      transactionId: data.data?.transactionId,
      amount: data.data?.amount,
    };
  } catch {
    return { success: false, status: "ERROR" };
  }
}
