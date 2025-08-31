import { useCartStore } from "../models/cartStore";
import CartItemRow from "../components/cartItemRow";
import { Link } from "react-router-dom";

function CartList() {
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  return (
    <div>
      <div className="flex space-around w-full p-2">
        <div className="flex-1">
          Items: <span>{getTotalItems()}</span>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => {
              const userConfirm = confirm(
                "Do you wish to clear ALL items in the cart?",
              );
              if (userConfirm) {
                clearCart();
              }
            }}
            className="bg-orange-500 text-white hover:bg-orange-300 shadow-md rounded-xl px-3 py-3"
          >
            Clear Cart
          </button>
        </div>
      </div>
      <div className="w-full">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-auto bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="text-right mb-1">
          Cart Sub-total:{" "}
          <span className="text-gray-600">${getTotalPrice()}</span>
        </div>
        <div className="text-right mb-1">
          Tax (GST 9%):{" "}
          <span className="text-gray-600">
            ${(0.09 * getTotalPrice()).toFixed(2)}
          </span>
        </div>
        <div className="text-right mb-1">
          Checkout Total :{" "}
          <span className="text-green-600">
            ${(1.09 * getTotalPrice()).toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex justify-end mt-2 gap-2">
        <Link to={"/"}>
          <button className="bg-blue-500 text-white hover:bg-blue-300 shadow-lg rounded-xl px-3 py-3">
            Continue Shopping
          </button>
        </Link>
        <button className="bg-green-500 text-white hover:bg-green-300 shadow-lg rounded-xl px-3 py-3">
          Checkout
        </button>
      </div>
    </div>
  );
}

export default CartList;
