/**
 * ZarinPal Payment Gateway integration
 * Docs: https://docs.zarinpal.com/paymentGateway/
 *
 * Environment Variables:
 *   ZARINPAL_MERCHANT_ID  — Merchant ID from ZarinPal dashboard
 *   ZARINPAL_SANDBOX      — "true" to use sandbox, "false" or unset for production
 *   NEXTAUTH_URL          — Your site URL (used for callback)
 *
 * Sandbox test cards: any random cards will work — use test merchant ID
 * https://sandbox.zarinpal.com/
 */

const SANDBOX_MERCHANT = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"; // sandbox test merchant
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== "false"; // default: sandbox
const MERCHANT = process.env.ZARINPAL_MERCHANT_ID || SANDBOX_MERCHANT;

const API_BASE = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://payment.zarinpal.com/pg/v4/payment";

const START_PAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://payment.zarinpal.com/pg/StartPay";

export interface PaymentRequestPayload {
  amount: number; // Amount in Toman (ZarinPal now uses IRR, but we'll convert)
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRequestResult {
  ok: boolean;
  authority?: string;
  paymentUrl?: string;
  error?: string;
  errorCode?: number | string;
  sandbox: boolean;
}

export interface PaymentVerifyResult {
  ok: boolean;
  refId?: string;
  amount?: number;
  cardPan?: string;
  error?: string;
  errorCode?: number | string;
  sandbox: boolean;
}

/**
 * Request a new payment authority from ZarinPal.
 * Amount should be in Toman (تومان). We convert to Rial (×10) as ZarinPal expects Rial.
 */
export async function requestPayment(payload: PaymentRequestPayload): Promise<PaymentRequestResult> {
  const amountInRial = Math.round(payload.amount * 10);
  if (amountInRial < 10000) {
    return { ok: false, error: "حداقل مبلغ ۱,۰۰۰ تومان است", sandbox: IS_SANDBOX };
  }

  const body = {
    merchant_id: MERCHANT,
    amount: amountInRial,
    description: payload.description || "پرداخت آنلاین",
    callback_url: payload.callbackUrl,
    metadata: {
      mobile: payload.mobile || "",
      email: payload.email || "",
      ...(payload.metadata || {}),
    },
  };

  try {
    const res = await fetch(`${API_BASE}/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    // ZarinPal v4 response format
    if (data?.data?.code === 100 && data?.data?.authority) {
      return {
        ok: true,
        authority: data.data.authority,
        paymentUrl: `${START_PAY_URL}/${data.data.authority}`,
        sandbox: IS_SANDBOX,
      };
    }
    return {
      ok: false,
      error: data?.errors?.message || data?.data?.message || "خطا در ایجاد درخواست پرداخت",
      errorCode: data?.errors?.code || data?.data?.code,
      sandbox: IS_SANDBOX,
    };
  } catch (e: any) {
    console.error("ZarinPal request error:", e);
    return {
      ok: false,
      error: "خطا در ارتباط با درگاه پرداخت: " + (e?.message || "unknown"),
      sandbox: IS_SANDBOX,
    };
  }
}

/**
 * Verify a payment after the user returns from ZarinPal gateway.
 * The `authority` and `amount` MUST match the initial request.
 */
export async function verifyPayment(authority: string, amountToman: number): Promise<PaymentVerifyResult> {
  const amountInRial = Math.round(amountToman * 10);
  const body = {
    merchant_id: MERCHANT,
    amount: amountInRial,
    authority,
  };

  try {
    const res = await fetch(`${API_BASE}/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    // Code 100 = success (first verify), 101 = already verified
    if (data?.data?.code === 100 || data?.data?.code === 101) {
      return {
        ok: true,
        refId: String(data.data.ref_id || ""),
        amount: amountToman,
        cardPan: data.data.card_pan || "",
        sandbox: IS_SANDBOX,
      };
    }
    return {
      ok: false,
      error: data?.errors?.message || data?.data?.message || "پرداخت تأیید نشد",
      errorCode: data?.errors?.code || data?.data?.code,
      sandbox: IS_SANDBOX,
    };
  } catch (e: any) {
    console.error("ZarinPal verify error:", e);
    return {
      ok: false,
      error: "خطا در ارتباط با درگاه پرداخت: " + (e?.message || "unknown"),
      sandbox: IS_SANDBOX,
    };
  }
}

export const ZarinPalStatus = {
  isSandbox: IS_SANDBOX,
  merchantConfigured: MERCHANT !== SANDBOX_MERCHANT,
};
