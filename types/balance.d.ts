/**
 * payment type
 *
 * Possible values are: credits, euros, pounds & dollars. For all other supported currencies, an ISO-4217 code is returned
 */
export type PaymentType = 'credits' | 'euros' | 'pounds' | 'dollars' | string;

export interface Balance {
  /** payment method */
  payment: 'prepaid' | 'postpaid';

  type: PaymentType;

  /** The amount of balance of the payment type. When postpaid is your payment method, the amount will be 0. */
  amount: number;
}
