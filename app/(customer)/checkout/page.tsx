import { OpenCartRedirect } from "@/components/customer/open-cart-redirect";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <OpenCartRedirect step="checkout" />;
}
