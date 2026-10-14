import { AccountPage } from "@/components/storefront/account-page";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";

export default function AccountRoute() {
  return <><SiteHeader /><AccountPage /><SiteFooter /></>;
}
