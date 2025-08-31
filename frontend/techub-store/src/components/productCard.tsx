import type { Product } from "../models/products";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
        <div className="font-semibold text-lg mb-2">{product.title}</div>
        <div className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </div>
        <div className="text-lg font-bold text-green-600">{product.price}</div>
      </div>
    </Link>
  );
}

export default ProductCard;
