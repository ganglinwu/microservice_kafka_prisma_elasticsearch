import { Link } from "react-router-dom";

function EmptyCart() {
  return (
    <div className="text-center py-12">
      Cart is empty, let's go{" "}
      <Link to="/">
        <a className="text-blue-500">shopping!</a>
      </Link>
    </div>
  );
}

export default EmptyCart;
