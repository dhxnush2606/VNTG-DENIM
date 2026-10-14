import { CartPage } from "@/components/storefront/cart-page";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";

export default function CartRoute() {
  return <><SiteHeader /><CartPage /><SiteFooter /></>;
}
