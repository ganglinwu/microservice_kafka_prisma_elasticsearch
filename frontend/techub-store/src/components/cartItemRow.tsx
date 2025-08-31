import type { CartItem } from "../models/cartStore";
import { Trash } from "lucide-react";
import { useCartStore } from "../models/cartStore";

interface CartItemRowProps {
  item: CartItem;
}

function CartItemRow({ item }: CartItemRowProps) {
  const { removeItem, updateQuantity } = useCartStore();
  return (
    <div className="flex relative shadow-md rounded-lg mb-4 w-full">
      <div className="flex items-center w-full gap-4 p-4 border rounded-lg">
        <img className="h-30 w-30 m-4" src={item.image} />
        <div className="">
          <div>{item.title}</div>
          <div className="text-gray-700">Price: ${item.price}</div>
          <div className="flex gap-2 mb-2">
            <div>Qty: </div>
            <button
              className="h-6 w-6 bg-gray-200 hover:bg-gray-300"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
            <div>{item.quantity}</div>
            <button
              className="h-6 w-6 bg-gray-200 hover:bg-gray-300"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              -
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                const userConfirm = confirm("Are you sure you want to remove?");
                if (userConfirm) {
                  removeItem(item.id);
                }
              }}
            >
              <Trash size={20} />
            </button>
          </div>
        </div>
        <div className="self-end mb-2 flex-1">
          <div className="text-right">
            Item Subtotal:{" "}
            <span className="text-green-700">
              ${item.price * item.quantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemRow;
