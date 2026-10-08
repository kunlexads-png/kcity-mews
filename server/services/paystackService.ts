import crypto from 'crypto';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // in kobo
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    };
  };
}

class PaystackService {
  private secretKey: string;
  private publicKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_sample_paystack_key';
  }

  public getPublicKey(): string {
    return this.publicKey;
  }

  public isLiveConfigured(): boolean {
    return Boolean(this.secretKey && this.secretKey.startsWith('sk_'));
  }

  /**
   * Initializes a transaction with Paystack
   * @param email Customer email
   * @param amountInNaira Amount in NGN
   * @param reference Unique reference
   * @param callbackUrl Redirect URL after payment
   * @param metadata Additional order metadata
   */
  public async initializeTransaction(
    email: string,
    amountInNaira: number,
    reference: string,
    callbackUrl: string,
    metadata: Record<string, any> = {}
  ): Promise<PaystackInitResponse> {
    const amountInKobo = Math.round(amountInNaira * 100);

    if (this.isLiveConfigured()) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: amountInKobo,
            reference,
            callback_url: callbackUrl,
            currency: 'NGN',
            metadata,
          }),
        });

        const data = await response.json();
        return data as PaystackInitResponse;
      } catch (error: any) {
        console.error('[Paystack Init Error]:', error);
        throw new Error('Failed to initialize Paystack transaction: ' + error.message);
      }
    }

    // Interactive dev test mode when user has not yet configured secret key in .env
    console.log(`[Paystack Dev Mode] Generating test authorization for ref: ${reference}`);
    return {
      status: true,
      message: 'Authorization URL created (Sandbox mode)',
      data: {
        authorization_url: `${callbackUrl}?reference=${reference}&status=test_flow`,
        access_code: 'access_' + Math.random().toString(36).substring(2, 9),
        reference,
      },
    };
  }

  /**
   * Server-side payment verification
   * @param reference Transaction reference
   */
  public async verifyTransaction(reference: string, expectedAmountNaira?: number): Promise<PaystackVerifyResponse> {
    if (this.isLiveConfigured()) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        });

        const data: PaystackVerifyResponse = await response.json();

        if (!data.status || data.data.status !== 'success') {
          return data;
        }

        // Validate amount to protect against tampering
        if (expectedAmountNaira) {
          const expectedKobo = Math.round(expectedAmountNaira * 100);
          if (data.data.amount < expectedKobo) {
            console.error(`[Paystack Tampering Alert] Expected ${expectedKobo} kobo, received ${data.data.amount}`);
            return {
              status: false,
              message: 'Amount mismatch detected. Payment cannot be accepted.',
              data: {
                ...data.data,
                status: 'failed',
              },
            };
          }
        }

        return data;
      } catch (error: any) {
        console.error('[Paystack Verify Error]:', error);
        throw new Error('Failed to verify Paystack transaction: ' + error.message);
      }
    }

    // Dev sandbox verification
    console.log(`[Paystack Dev Verify] Verifying reference: ${reference}`);
    const amountInKobo = expectedAmountNaira ? Math.round(expectedAmountNaira * 100) : 5000000;

    return {
      status: true,
      message: 'Verification successful (Sandbox mode)',
      data: {
        id: Math.floor(Math.random() * 1000000),
        domain: 'test',
        status: 'success',
        reference,
        amount: amountInKobo,
        message: 'Approved',
        gateway_response: 'Successful Paystack Sandbox Transaction',
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
        ip_address: '127.0.0.1',
        customer: {
          id: 101,
          first_name: 'Customer',
          last_name: 'Mews',
          email: 'customer@kcitymews.com',
          phone: '+234 801 234 5678',
        },
      },
    };
  }

  /**
   * Verify Paystack Webhook HMAC SHA512 signature
   */
  public verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || this.secretKey;
    if (!webhookSecret) return true;

    const hash = crypto.createHmac('sha512', webhookSecret).update(payload).digest('hex');
    return hash === signature;
  }
}

export const paystackService = new PaystackService();
