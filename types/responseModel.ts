import { Account } from "../account/accountModel";
import { Admin } from "../admin/adminModel";
import { Permissions } from "../admin/permissionsModel";
import { Art } from "../art/artModel";
import { Discount } from "../discount/discountModel";
import { Manufacturer } from "../manufacturer/manufacturerModel";
import { Movement } from "../movements/movementModel";
import { Order, PaymentMethod, ShippingMethod } from "../order/orderModel";
import { GlobalDashboardStatsData, TopPerformingItemData } from "../order/orderService";
import { OrderArchive } from "../orderArchive/orderArchiveModel";
import { Organization } from "../organizations/organizationModel";
import { CarouselItem, TermsAndConditions } from "../preferences/preferencesModel";
import { Prixer } from "../prixer/prixerModel";
import { Product } from "../product/productModel";
import { Service } from "../serviceOfPrixers/serviceModel";
import { Surcharge } from "../surcharge/surchargeModel";
import { Testimonial } from "../testimonials/testimonialModel";
import { User } from "../user/userModel";

type DiscountValues = number[];
type Gallery = { arts: Art[]; length: number };

type PrixResult = GlobalDashboardStatsData | TopPerformingItemData[] | Gallery | CarouselItem | CarouselItem[] | Account | Account[] | User | User[] | Testimonial | Testimonial[] | Admin | Admin[] | Permissions | Permissions[] | string | string[] | DiscountValues | Discount | Discount[] | Surcharge | Surcharge[] | Service | Service[] | Product | Product[] | Prixer | Prixer[] | Record<string, string[]> | Organization | Organization[] | Movement | Movement[] | Art | Art[] | Manufacturer | Manufacturer[] | Order | Order[] | OrderArchive | OrderArchive[] | PaymentMethod | PaymentMethod[] | ShippingMethod | ShippingMethod[] | TermsAndConditions;

export interface PrixResponse {
    success: boolean;
    message: string;
    result?: PrixResult;
}