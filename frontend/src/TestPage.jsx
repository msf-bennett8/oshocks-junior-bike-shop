import React, { useState, useEffect } from 'react';
import { productAPI } from './services/api';

const TestPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...');
      const response = await productAPI.getProducts({ per_page: 12 });
      console.log('✅ Products loaded:', response.data);
      setProducts(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading products...</h2>
        <div>Please wait...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>Error!</h2>
        <p>{error}</p>
        <button onClick={loadProducts}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <h1>Products ({products.length})</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h3>{product.name}</h3>
            <p>Price: KES {product.price}</p>
            <p>Brand: {product.brand}</p>
            <p>Condition: {product.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage;
