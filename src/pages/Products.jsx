import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCardExt from '../components/ProductCardExt';
import { Package, AlertCircle } from 'lucide-react';
import './ProductsScreen.css';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Skincare', 'Laptops', 'Gaming'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const prodRes = await fetch('http://localhost:5000/api/products/getProducts');
                if (!prodRes.ok) throw new Error('Failed to fetch from DB');
                const prodData = await prodRes.json();
                setProducts(prodData);
            } catch (err) {
                console.warn("DB unavailable, loading mock products for UI demonstration.");
                setProducts([
                    { id: 101, name: 'The Derma Co 1% Salicylic Acid', price: 15.00, category: 'Skincare', rating: 4.8, image_url: '/assets/derma_co.png' },
                    { id: 102, name: 'Himalaya Purifying Neem', price: 8.50, category: 'Skincare', rating: 4.5, image_url: '/assets/himalaya.png' },
                    { id: 1, name: 'QuantumBook Pro 15', price: 1499.99, category: 'Laptops', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' },
                    { id: 2, name: 'CyberRig X10', price: 2100.00, category: 'Gaming', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?w=500' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = activeCategory === 'All' 
        ? products 
        : products.filter(p => p?.category?.toLowerCase() === activeCategory.toLowerCase());

    const handleChat = (product) => {
        navigate('/chatbot', { state: { product } });
    };

    const handleFeedback = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    const handleCompare = (product) => {
        navigate('/chatbot', { state: { product, initialMessage: `Compare ${product.name} with similar products in the ${product.category} category.` } });
    };

    return (
        <div className="products-screen-container">
            {/* Left sidebar internal to Products Screen */}
            <aside className="products-internal-sidebar glass-panel">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                    <Package className="text-accent" />
                    <h2>Product</h2>
                </div>
                
                <h4 className="text-muted" style={{textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '1rem'}}>Categories</h4>
                <ul className="category-list">
                    {categories.map(cat => (
                        <li 
                            key={cat} 
                            className={`category-item ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main grid area */}
            <main className="products-main-area">
                <h2 style={{marginBottom: '2rem'}}>Available Inventory</h2>
                
                {loading ? (
                    <div className="processing-state"><div className="spinner"></div><p>Loading products...</p></div>
                ) : error ? (
                    <div className="error-banner"><AlertCircle /> {error}</div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCardExt 
                                key={product.id} 
                                product={product} 
                                onAddChat={handleChat}
                                onViewFeedback={handleFeedback}
                                onCompare={handleCompare}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;

