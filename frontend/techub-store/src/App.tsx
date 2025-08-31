import Header from "./components/header";
import ProductGrid from "./components/productGrid";
import ProductDetail from "./pages/productDetail";
import Checkout from "./pages/checkout";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://api.escuelajs.co/api/v1/products?offset=0&limit=5",
        );
        if (!response.ok) {
          throw new Error(
            `Something went wrong. HTTP Status Code: ${response.status}`,
          );
        }
        const result = await response.json();
        setProducts(result);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<ProductGrid products={products} />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Checkout />} />
      </Routes>
    </div>
  );
}

export default App;
