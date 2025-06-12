import { Account } from "../account/accountModel.ts"
import { Admin } from "../admin/adminModel.ts"
import { Permissions } from "../admin/permissionsModel.ts"
import { Art } from "../art/artModel.ts"
import { Discount } from "../discount/discountModel.ts"
import { Manufacturer } from "../manufacturer/manufacturerModel.ts"
import { Movement } from "../movements/movementModel.ts"
import { Order, PaymentMethod, ShippingMethod } from "../order/orderModel.ts"
import {
  GlobalDashboardStatsData,
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

interface email {
  success: boolean
  message: string
  data?: any
}
type PrixResult =
  | GlobalDashboardStatsData
  | TopPerformingItemData[]
  | Gallery
  | CarouselItem
  | CarouselItem[]
  | Account
  | Account[]
  | User
  | User[]
  | Testimonial
  | Testimonial[]
  | Admin
  | Admin[]
  | Permissions
  | Permissions[]
  | string
  | string[]
  | DiscountValues
  | Discount
  | Discount[]
  | Surcharge
  | Surcharge[]
  | Service
  | Service[]
  | Product
  | Product[]
  | Prixer
  | Prixer[]
  | Record<string, string[]>
  | Organization
  | Organization[]
  | Movement
  | Movement[]
  | Art
  | Art[]
  | Manufacturer
  | Manufacturer[]
  | Order
  | Order[]
  | OrderArchive
  | OrderArchive[]
  | PaymentMethod
  | PaymentMethod[]
  | ShippingMethod
  | ShippingMethod[]
  | TermsAndConditions
  | email

export interface PrixResponse {
  success: boolean
  message: string
  result?: PrixResult
  email?: email
}
