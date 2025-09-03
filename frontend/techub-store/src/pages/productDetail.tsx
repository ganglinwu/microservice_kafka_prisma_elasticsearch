import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Product } from "../models/products";
import { useCartStore } from "../models/cartStore.ts";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/product/${id}`,
          //  `https://api.escuelajs.co/api/v1/products/${id}`,
        );
        if (!response.ok) {
          throw new Error(
            `Something went wrong. HTTP Status Code:${response.status}`,
          );
        }
        const result = await response.json();
        setProduct(result);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-96 object-cover rounded-lg shadow-sm"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl font-bold text-green-600 mb-6">
            ${product.price}
          </p>
          <p className="text-gray-700 mb-6">{product.description}</p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            onClick={() => addItem(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
