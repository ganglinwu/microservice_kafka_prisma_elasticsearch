import CartList from "../pages/cartList";
import { useCartStore } from "../models/cartStore";
import EmptyCart from "./emptyCart";

function Checkout() {
  const { items } = useCartStore();
  return (
    <div className="flex-col space-between justify-between h-screen max-w-4xl mx-auto md:p-6 p-4">
      <div>{items.length === 0 ? <EmptyCart /> : <CartList />}</div>
    </div>
  );
}

export default Checkout;
