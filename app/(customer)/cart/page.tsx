import { OpenCartRedirect } from "@/components/customer/open-cart-redirect";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return <OpenCartRedirect step="cart" />;
}
