import { ObjectId } from "mongodb";
import { Art } from "../art/artModel.ts";
import { Product, VariantAttribute } from "../product/productModel.ts";

// Main Order interface
export interface Order {
  _id?: ObjectId;
  number?: number;
  lines: OrderLine[]; // requests
  createdOn: Date;
  createdBy: string;
  updates?: [Date, string][]; // updates when and by whom
  consumerDetails?: ConsumerDetails;
  payment: PaymentDetails;
  shipping: ShippingDetails;
  billing: BillingDetails;

  totalUnits: number;

  subTotal: number;
  discount?: number;
  surcharge?: number;
  shippingCost?: number;
  tax: Tax[];
  totalWithoutTax: number; // Base Imponible
  total: number; // Final order total (subTotal + tax + shipping - discount)

  seller?: string;
  observations?: string;
}

interface PickedArt
  extends Pick<
    Art,
    'artId' | 'title' | 'largeThumbUrl' | 'prixerUsername' | 'exclusive' | '_id'
  > { }

interface PickedProduct
  extends Pick<
    Product,
    | '_id'
    | 'name'
    | 'productionTime'
    | 'sources'
    | 'variants'
  > {
  selection?: VariantAttribute[];
}

interface Item {
  sku: string;
  art?: PickedArt;
  product: PickedProduct;
  price: string;
  discount?: number;
  surcharge?: number;
}

export interface OrderLine {
  id: string; // Unique identifier, same as CartLine
  item: Item; // The purchased item, same as CartLine
  quantity: number; // Quantity purchased
  pricePerUnit: number; // The price of one unit at the time of purchase
  discount?: number; // Discount applied to the line
  surcharge?: number; // Surcharge applied to the line
  subtotal: number; // Total for the line (quantity * pricePerUnit - discount)
  status: [OrderStatus, Date][];
}

export enum OrderStatus {
  // Initial states (post-order submission)
  PendingPayment = 0, // Order submitted, awaiting payment confirmation for this item's order
  PaymentFailed = 1,  // Payment attempt was unsuccessful for this item's order

  // Active processing states
  PaymentConfirmed = 2, // Payment successful, ready for processing this item
  Processing = 3,       // This item is being actively worked on (e.g., photo review, printing, painting)
  ReadyToShip = 4,      // This item is produced, packed, and waiting for carrier pickup

  // Shipping & Delivery states
  Shipped = 5,          // This item has been handed over to the shipping carrier
  InTransit = 6,        // Optional: This item is currently with the carrier on its way
  Delivered = 7,        // Carrier confirmed delivery of this item

  // Exception/Completion states
  Canceled = 8,         // This item was canceled from the order
  OnHold = 9,           // Processing for this item is temporarily paused (e.g., stock issue for this item)

  // Return states
  ReturnRequested = 10, // Customer has requested a return for this item
  ReturnReceived = 11,  // This returned item has been received back
  Refunded = 12,        // Refund issued for this returned/canceled item
}

interface ConsumerDetails {
  basic: BasicInfo;
  selectedAddress: BasicAddress;
  addresses: BasicAddress[];
  paymentMethods: PaymentMethod[];
}

interface BasicAddress {
  line1: string;
  line2?: string;
  reference?: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

interface BasicInfo {
  id?: string;
  name: string;
  lastName: string;
  email?: string;
  phone: string;
  shortAddress?: string;
}

export interface PaymentMethod {
  _id?: ObjectId;
  active: boolean;
  createdBy: string;
  createdOn: Date;
  name: string;
  instructions?: string;
  // lastFourDigits?: string; // Optional, last four digits of a card
  // voucher?: Payment; // Optional, voucher for bank transfer or task payment
  // metadata?: string;
  // amount?: string;
}

interface Payment {
  id: string;
  description: string;
  voucher?: string;
  metadata?: string;
  amount?: string;
  lastFourDigits?: string; // Optional, last four digits of a card
  method: PaymentMethod;
}
interface PaymentDetails {
  total: number;
  installments: Payment[];
}

interface ShippingDetails {
  method: ShippingMethod;
  country: string;
  address: BasicAddress;
  preferredDeliveryDate?: Date;
  estimatedShippingDate?: Date;
  estimatedDeliveryDate?: Date;
}

interface BillingDetails {
  billTo?: BasicInfo;
  address?: Address;
}

interface Address {
  recepient: BasicInfo;
  address: BasicAddress;
}

interface Tax {
  id?: string;
  name: string;
  value: number;
  amount: number;
}

export interface ShippingMethod {
  _id?: ObjectId;
  active: boolean;
  name: string;
  createdOn: Date;
  createdBy: String;
  price: string;
}
