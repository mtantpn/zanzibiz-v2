export class MockPaymentProcessor {
  static generateTransactionReference(method) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = method === 'mpesa' ? 'MPE' : 'CRD';
    return `${prefix}${timestamp}${random}`;
  }

  static async processMpesaPayment(phoneNumber, amount, businessIdentifier) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionRef = this.generateTransactionReference('mpesa');
        const success = Math.random() > 0.1;

        resolve({
          success,
          transactionReference: transactionRef,
          message: success
            ? `Mock M-Pesa payment of ${amount} tokens initiated. Transaction: ${transactionRef}`
            : 'Mock payment failed. Please try again.',
          amount,
          phoneNumber,
          businessIdentifier
        });
      }, 2000);
    });
  }

  static async processCardPayment(amount, businessIdentifier) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionRef = this.generateTransactionReference('card');
        const success = Math.random() > 0.1;

        resolve({
          success,
          transactionReference: transactionRef,
          message: success
            ? `Mock card payment of ${amount} tokens completed. Transaction: ${transactionRef}`
            : 'Mock payment failed. Please try again.',
          amount,
          businessIdentifier
        });
      }, 2000);
    });
  }

  static async completePayment(purchaseId, supabaseClient) {
    const { data: purchase, error: fetchError } = await supabaseClient
      .from('token_purchases')
      .select('*')
      .eq('id', purchaseId)
      .maybeSingle();

    if (fetchError || !purchase) {
      throw new Error('Purchase not found');
    }

    const { data, error } = await supabaseClient
      .from('token_purchases')
      .update({
        payment_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const { error: profileError } = await supabaseClient.rpc('add_tokens_to_business', {
      purchase_id: purchaseId,
      token_amount: purchase.amount
    });

    if (profileError) {
      throw profileError;
    }

    return data;
  }
}
