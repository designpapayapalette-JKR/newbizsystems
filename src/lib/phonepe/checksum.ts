import crypto from "crypto";

/**
 * Compute checksum for PhonePe Pay API (/pg/v1/pay)
 * Formula: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
 */
export function computePayChecksum(payload: object, saltKey: string, saltIndex: string): string {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const hashInput = base64Payload + "/pg/v1/pay" + saltKey;
  const sha256 = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${saltIndex}`;
}

/**
 * Compute checksum for status check API (/pg/v1/status/{merchantId}/{merchantOrderId})
 */
export function computeStatusChecksum(merchantId: string, merchantOrderId: string, saltKey: string, saltIndex: string): string {
  const hashInput = `/pg/v1/status/${merchantId}/${merchantOrderId}` + saltKey;
  const sha256 = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${sha256}###${saltIndex}`;
}

/**
 * Verify webhook response checksum
 */
export function verifyWebhookChecksum(base64Response: string, receivedChecksum: string, saltKey: string, saltIndex: string): boolean {
  const hashInput = base64Response + saltKey;
  const sha256 = crypto.createHash("sha256").update(hashInput).digest("hex");
  const expected = `${sha256}###${saltIndex}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedChecksum));
  } catch {
    return false;
  }
}

export function getBase64Payload(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
