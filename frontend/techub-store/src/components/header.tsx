import { useCartStore } from "../models/cartStore";
import { Link } from "react-router-dom";
function Header() {
  const { getTotalItems } = useCartStore();
  return (
    <header className="flex justify-between items-center p-4 shadow-md hover:text-blue-600">
      <div className="flex-shrink-0 items-center">
        <Link to={"/"}>
          <div>TechHub</div>
        </Link>
      </div>
      <nav className="hidden md:flex-shrink-0 space-x-6">
        <a>Home</a>
        <a>Products</a>
        <a>Categories</a>
      </nav>
      <div className="flex-shrink-0 items-center space-x-4">
        <button>Search</button>
        <button>Account</button>
        <Link to={"/cart"}>
          <button>Cart ({getTotalItems()})</button>
        </Link>
      </div>
    </header>
  );
}

export default Header;
