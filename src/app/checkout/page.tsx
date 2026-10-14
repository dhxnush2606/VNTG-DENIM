import { CheckoutPage } from "@/components/storefront/checkout-page";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";

export default function CheckoutRoute() {
  return <><SiteHeader /><CheckoutPage /><SiteFooter /></>;
}
