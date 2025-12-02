import { ObjectId } from 'mongodb';
import { Art } from '../art/artModel.ts';
import { Product, VariantAttribute } from '../product/productModel.ts';
import mongoose, { Schema, Document } from 'mongoose';
// Main Order interface
export interface Order {
  // _id?: ObjectId;
  // _id?: ObjectId;
  number?: number;
  lines: OrderLine[]; // requests
  createdOn: Date;
  createdBy: string;
  history?: HistoryEntry[];
  updates?: [Date, string][]; // updates when and by whom
  consumerDetails?: ConsumerDetails;
  payment: PaymentDetails;
  shipping: ShippingDetails;
  billing: BillingDetails;

  totalUnits: number;
  status: [OrderStatus, Date][];
  subTotal: number;
  discount?: number;
  surcharge?: number;
  shippingCost?: number;
  tax: Tax[];
  totalWithoutTax: number; // Base Imponible
  total: number; // Final order total (subTotal + tax + shipping - discount)

  seller?: string;
  observations?: string;

  commissionsProcessed?: boolean; // Flag to indicate if commissions have been processed
}

export interface HistoryEntry {
  timestamp: Date;
  user: string;
  description: string;
}

interface PickedArt
  extends Pick<
    Art,
    'artId' | 'title' | 'largeThumbUrl' | 'prixerUsername' | 'exclusive' | '_id'
  > { }

export interface CustomImage {
  url: string
  title: string
  description?: string
  prixerUsername?: string
}
interface PickedProduct
  extends Pick<Product, '_id' | 'name' | 'productionTime' | 'sources' | 'variants'> {
  selection?: VariantAttribute[];
}

interface Item {
  sku: string;
  art?: PickedArt | CustomImage;
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
  Pending = 0, // Order submitted, awaiting payment confirmation for this item's order
  Impression = 1, // Payment attempt was unsuccessful for this item's order
  Production = 2, // Payment successful, ready for processing this item
  ReadyToShip = 3, // This item is produced, packed, and waiting for carrier pickup
  Delivered = 4, // Carrier confirmed delivery of this item
  Finished = 5, // This item was canceled from the order
  Paused = 6, // Processing for this item is temporarily paused (e.g., stock issue for this item)
  Canceled = 7, // Customer has requested a return for this item
}

export enum GlobalPaymentStatus {
  Pending = 0, // Order submitted, awaiting payment confirmation for this item's order
  Credited = 2, // Payment successful, ready for processing this item
  Paid = 1, // Payment attempt was unsuccessful for this item's order

  Cancelled = 3, // Customer has requested a return for this item
  // Giftcard = 3, // This item is produced, packed, and waiting for carrier pickup
  // Gift = 4, // Carrier confirmed delivery of this item
}
export interface ConsumerDetails {
  basic?: BasicInfo;
  selectedAddress?: BasicAddress;
  addresses?: BasicAddress[];
  paymentMethods?: PaymentMethod[];
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

export interface BasicInfo {
  id?: string;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
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
  createdOn: Date;
  lastFourDigits?: string; // Optional, last four digits of a card
  method: PaymentMethod;
}
interface PaymentDetails {
  total: number;
  payment: Payment[];
  status: [GlobalPaymentStatus, Date][];
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

export interface Tax {
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

export interface OrderDocument extends Order, Document {}

const itemSchema = new Schema<Item>(
  {
    sku: { type: String, required: true },
    art: { type: Schema.Types.Mixed },
    product: { type: Object, required: true },
    price: { type: String, required: true },
    discount: Number,
    surcharge: Number,
  },
  { _id: false }
);

const orderLineSchema = new Schema<OrderLine>(
  {
    id: { type: String, required: true },
    item: { type: itemSchema, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    status: { type: [[Number, Date]], required: true },
    discount: Number,
    surcharge: Number,
  },
  { _id: false }
);

const paymentSchema = new Schema<Payment>(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    voucher: String,
    method: { type: Object, required: true },
    amount: String,
    createdOn: { type: Date, default: Date.now },
  },
  { _id: false }
);

const paymentDetailsSchema = new Schema<PaymentDetails>(
  {
    total: { type: Number, required: true },
    payment: { type: [paymentSchema], required: true },
    status: { type: [[Number, Date]], required: true },
  },
  { _id: false }
);

const historyEntrySchema = new Schema<HistoryEntry>(
  {
    timestamp: { type: Date, required: true },
    user: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const basicInfoSchema = new Schema<BasicInfo>(
  {
    id: String,
    name: String,
    lastName: String,
    email: String,
    phone: String,
    shortAddress: String,
  },
  { _id: false }
);

const basicAddressSchema = new Schema<BasicAddress>(
  {
    line1: { type: String, required: true },
    line2: String,
    reference: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: String,
  },
  { _id: false }
);

const taxSchema = new Schema<Tax>(
  {
    id: String,
    name: { type: String, required: true },
    value: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const shippingDetailsSchema = new Schema<ShippingDetails>(
  {
    method: { type: Object, required: true },
    country: { type: String, required: true },
    address: { type: basicAddressSchema, required: true },
    estimatedDeliveryDate: Date,
  },
  { _id: false }
);

const billingDetailsSchema = new Schema<BillingDetails>(
  {
    billTo: basicInfoSchema,
    address: {
      recepient: basicInfoSchema,
      address: basicAddressSchema,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    number: { type: Number, unique: true, sparse: true },
    lines: { type: [orderLineSchema], required: true },
    createdOn: { type: Date, default: Date.now, required: true },
    createdBy: { type: String, required: true },
    history: [historyEntrySchema],
    consumerDetails: {
      basic: basicInfoSchema,
      addresses: [basicAddressSchema],
    },
    payment: { type: paymentDetailsSchema, required: true },
    shipping: { type: shippingDetailsSchema, required: true },
    billing: { type: billingDetailsSchema, required: true },
    totalUnits: { type: Number, required: true },
    status: { type: [[Number, Date]], required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    surcharge: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: [taxSchema],
    totalWithoutTax: { type: Number },
    total: { type: Number, required: true },
    seller: String,
    observations: String,
    commissionsProcessed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema);

export default OrderModel;