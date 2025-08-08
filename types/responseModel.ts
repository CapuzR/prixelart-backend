import { Account } from "../account/accountModel.ts"
import { Admin } from "../admin/adminModel.ts"
import { PermissionsV2 } from "../admin/permissionsModel.ts"
import { Art } from "../art/artModel.ts"
import { Discount } from "../discount/discountModel.ts"
import { Manufacturer } from "../manufacturer/manufacturerModel.ts"
import { Movement } from "../movements/movementModel.ts"
import { Order, PaymentMethod, ShippingMethod } from "../order/orderModel.ts"
import {
  GlobalDashboardStatsData,
  PerformanceData,
  TopPerformingItemData,
} from "../order/orderService.ts"
import { OrderArchive } from "../orderArchive/orderArchiveModel.ts"
import { Organization } from "../organizations/organizationModel.ts"
import {
  CarouselItem,
  TermsAndConditions,
} from "../preferences/preferencesModel.ts"
import { Prixer } from "../prixer/prixerModel.ts"
import { Product } from "../product/productModel.ts"
import { Service } from "../serviceOfPrixers/serviceModel.ts"
import { Surcharge } from "../surcharge/surchargeModel.ts"
import { Testimonial } from "../testimonials/testimonialModel.ts"
import { User } from "../user/userModel.ts"

type DiscountValues = number[]
type Gallery = { arts: Art[]; length: number }

export interface GalleryResult {
  arts: Art[];
  hasMore: boolean;
}

interface email {
  success: boolean
  message: string
  data?: any
}
type PrixResult =
  | Account
  | Account[]
  | Admin
  | Admin[]
  | Art
  | Art[]
  | CarouselItem
  | CarouselItem[]
  | Discount
  | Discount[]
  | DiscountValues
  | email
  | Gallery
  | GalleryResult
  | GlobalDashboardStatsData
  | Manufacturer
  | Manufacturer[]
  | Movement
  | Movement[]
  | Order
  | Order[]
  | OrderArchive
  | OrderArchive[]
  | Organization
  | Organization[]
  | PaymentMethod
  | PaymentMethod[]
  | PerformanceData[]
  | PermissionsV2
  | PermissionsV2[]
  | Prixer
  | Prixer[]
  | Product
  | Product[]
  | Service
  | Service[]
  | ShippingMethod
  | ShippingMethod[]
  | string
  | string[]
  | Surcharge
  | Surcharge[]
  | TermsAndConditions
  | Testimonial
  | Testimonial[]
  | TopPerformingItemData[]
  | User
  | User[]
  | Record<string, string[]>


export interface PrixResponse {
  success: boolean
  message: string
  result?: PrixResult
  email?: email
}

export interface PermissionsResponse {
  success: boolean
  message: string
  result?: PermissionsV2
}