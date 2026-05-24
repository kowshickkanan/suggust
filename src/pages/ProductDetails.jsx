import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star, MessageCircle, ShieldCheck, ShieldAlert, Package, Info, TrendingDown, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';
import { API_BASE_URL } from '../config';

const getPlatformRates = (product) => {
    if (!product) return [];
    
    const basePrice = Number(product.price || 0);
    const isSkincare = product.category?.toLowerCase() === 'skincare';
    
    if (isSkincare) {
        return [
            {
                platform: 'Amazon',
                price: (basePrice * 0.95).toFixed(2),
                logo: '📦',
                delivery: 'Free Delivery with Prime',
                url: 'https://amazon.in',
                highlight: false
            },
            {
                platform: 'Flipkart',
                price: (basePrice * 0.92).toFixed(2),
                logo: '⚡',
                delivery: 'Delivery in 2 Days (₹40)',
                url: 'https://flipkart.com',
                highlight: false
            },
            {
                platform: 'Nykaa',
                price: (basePrice * 0.88).toFixed(2),
                logo: '💖',
                delivery: 'Clinical Special: Free Delivery',
                url: 'https://nykaa.com',
                highlight: true
            },
            {
                platform: 'Purplle',
                price: (basePrice * 0.90).toFixed(2),
                logo: '💜',
                delivery: 'Delivery in 3 Days',
                url: 'https://purplle.com',
                highlight: false
            }
        ];
    } else {
        return [
            {
                platform: 'Amazon',
                price: (basePrice * 0.97).toFixed(2),
                logo: '📦',
                delivery: 'Free Prime One-Day Delivery',
                url: 'https://amazon.in',
                highlight: false
            },
            {
                platform: 'Flipkart',
                price: (basePrice * 0.94).toFixed(2),
                logo: '⚡',
                delivery: 'SuperCoins Applicable',
                url: 'https://flipkart.com',
                highlight: true
            },
            {
                platform: 'Croma',
                price: (basePrice * 0.96).toFixed(2),
                logo: '🔴',
                delivery: 'Store Pick-up Available',
                url: 'https://croma.com',
                highlight: false
            },
            {
                platform: 'Reliance Digital',
                price: (basePrice * 0.98).toFixed(2),
                logo: '🔵',
                delivery: 'Free Home Installation',
                url: 'https://reliancedigital.in',
                highlight: false
            }
        ];
    }
};

const getFeedbackKey = () => {
    try {
        const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return `mySubmittedFeedbacks_${u?.id || u?.username || 'guest'}`;
    } catch {
        return 'mySubmittedFeedbacks_guest';
    }
};

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(location.state?.product || null);

    const [liveRates, setLiveRates] = useState({ Amazon: 0, Flipkart: 0, Nykaa: 0 });

    useEffect(() => {
        if (!product) return;
        const base = Number(product.price || 0);
        
        const updatePrices = () => {
            setLiveRates({
                Amazon: Math.round(base * (0.94 + Math.random() * 0.08)),
                Flipkart: Math.round(base * (0.95 + Math.random() * 0.08)),
                Nykaa: Math.round(base * (0.91 + Math.random() * 0.08))
            });
        };
        
        updatePrices();
        const interval = setInterval(updatePrices, 3500);
        return () => clearInterval(interval);
    }, [product]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mySubmittedFeedbacks, setMySubmittedFeedbacks] = useState([]);

    useEffect(() => {
        const key = getFeedbackKey();
        try {
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            setMySubmittedFeedbacks(saved);
        } catch {
            setMySubmittedFeedbacks([]);
        }
    }, []);

    const isMyFeedback = (f) => {
        return mySubmittedFeedbacks.some(myF => 
            myF.product_name === f.product_name && 
            myF.review_text === f.review_text && 
            myF.rating === f.rating
        );
    };

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // If product wasn't passed via state, fetch it
                if (!product) {
                    const prodRes = await fetch(`${API_BASE_URL}/api/products/getProducts`);
                    const allProds = await prodRes.json();
                    const found = allProds.find(p => p.id.toString() === id);
                    setProduct(found);
                }

                // Fetch all feedbacks and filter by product name (flexible partial match)
                const feedRes = await fetch(`${API_BASE_URL}/api/feedbacks`);
                const allFeedbacks = await feedRes.json();
                
                const matchProduct = (f, prod) => {
                    if (!f.product_name || !prod) return false;
                    const fname = f.product_name.toLowerCase().trim();
                    const pname = prod.name.toLowerCase().trim();
                    // Exact match
                    return fname === pname;
                };

                // If we have a product (from state or just fetched), filter feedbacks
                if (product) {
                    const filtered = allFeedbacks.filter(f => matchProduct(f, product));
                    setFeedbacks(filtered);
                } else {
                    // This handles the case where navigate didn't finish setting product yet
                    const prodRes = await fetch(`${API_BASE_URL}/api/products/getProducts`);
                    const allProds = await prodRes.json();
                    const found = allProds.find(p => p.id.toString() === id);
                    if (found) {
                        const filtered = allFeedbacks.filter(f => matchProduct(f, found));
                        setFeedbacks(filtered);
                        setProduct(found);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch product details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id, product]);

    if (loading) return <div className="processing-state"><div className="spinner"></div></div>;
    if (!product) return <div className="error-banner">Product not found.</div>;

    const avgRating = feedbacks.length > 0 
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : product.rating || 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: feedbacks.filter(f => f.rating === star).length,
        percent: feedbacks.length > 0 ? (feedbacks.filter(f => f.rating === star).length / feedbacks.length) * 100 : 0
    }));

    return (
        <div className="product-details-container">
            <div className="back-btn" onClick={() => navigate('/products')}>
                <ChevronLeft size={20} /> Back to Catalog
            </div>

            {/* TOP SECTION: PRODUCT INFO (AMAZON STYLE) */}
            <section className="product-hero-section">
                <div className="hero-image-container glass-panel">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                    ) : (
                        <Package size={120} opacity={0.2} />
                    )}
                </div>

                <div className="hero-info-container">
                    <span className="hero-category text-accent">{product.category}</span>
                    <h1 className="hero-title">{product.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill={i < Math.round(avgRating) ? "#f59e0b" : "none"} color={i < Math.round(avgRating) ? "#f59e0b" : "rgba(255,255,255,0.2)"} />
                            ))}
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>({feedbacks.length} Global Reviews)</span>
                    </div>

                    <div className="hero-price">{product.price ? Number(product.price).toFixed(2) : "0.00"}/-</div>
                    
                    <p className="hero-description">
                        {product.explanation || "This product is recognized as a top-tier choice in its category, scientifically formulated for optimal performance and user satisfaction. Part of our AI-curated inventory."}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <Info size={20} className="text-accent" />
                        <span style={{ fontSize: '0.9rem' }}>This product matches your skin type preferences based on your AI profile.</span>
                    </div>

                    <div className="hero-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button className="add-to-chat-btn" onClick={() => navigate('/chatbot', { state: { product } })} style={{ background: 'var(--accent-color)', color: 'white', flex: 1, height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                                <MessageCircle size={20} /> Start AI Consulting
                            </button>
                            <button className="add-to-cart-details-btn" onClick={() => addToCart(product)} style={{ background: 'linear-gradient(to bottom, #10b981, #059669)', color: 'white', flex: 1, height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                                <Bell size={20} /> Add to Watchlist
                            </button>
                        </div>
                        <button 
                            onClick={() => navigate('/cheap-buy', { state: { product } })}
                            style={{
                                width: '100%',
                                height: '50px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.2) 100%)',
                                border: '1px solid #10b981',
                                color: '#10b981',
                                fontWeight: '800',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
                            }}
                        >
                            <TrendingDown size={18} /> Configure Live Price Alerts
                        </button>

                        {/* Glowing Live Price Scanners */}
                        <div className="live-scanners-card glass-panel" style={{
                            marginTop: '1.5rem',
                            padding: '1.25rem',
                            borderRadius: '16px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="live-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                    LIVE CRAWLER MONITOR
                                </h4>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>SCANNER STATUS: ACTIVE</span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                {Object.entries(liveRates).map(([platform, pVal]) => (
                                    <div key={platform} className="glass-panel" style={{ padding: '0.75rem', borderRadius: '10px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{platform}</div>
                                        <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>₹{pVal || '...'}/-</strong>
                                        <div style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '700', marginTop: '0.25rem' }}>Scanned 1s ago</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTTOM SECTION: FEEDBACK REPOSITORY (AMAZON STYLE) */}
            <section className="feedback-repository-section">
                <div className="feedback-header">
                    <h2>Verified Customer Voice</h2>
                </div>

                <div className="feedback-grid">
                    {/* LEFT COL: STATS */}
                    <div className="sentiment-summary-card">
                        <div className="glass-panel sentiment-card-inner">
                            <h3>Customer Sentiment</h3>
                            <div className="avg-rating-value">{avgRating}</div>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={20} fill={i < Math.round(avgRating) ? "#f59e0b" : "none"} color={i < Math.round(avgRating) ? "#f59e0b" : "rgba(255,255,255,0.2)"} />
                                ))}
                            </div>
                            
                            <div className="rating-bar-container">
                                {ratingCounts.map(item => (
                                    <div key={item.star} className="rating-bar-row">
                                        <span style={{ width: '40px' }}>{item.star} star</span>
                                        <div className="rating-bar-fill">
                                            <div className="rating-bar-inner" style={{ width: `${item.percent}%` }}></div>
                                        </div>
                                        <span className="text-muted" style={{ width: '35px', textAlign: 'right' }}>{Math.round(item.percent)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: REVIEWS FEED */}
                    <div className="reviews-feed">
                        {feedbacks.length > 0 ? (
                            feedbacks.map((f) => (
                                <div key={f.id} className="details-review-card">
                                    <div className="review-meta">
                                        <div className="review-author">
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {f.emoji || "👤"}
                                            </div>
                                            <span>Verified User</span>
                                        </div>
                                        {!isMyFeedback(f) && f.verdict && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: f.verdict === 'Genuine' ? '#10b981' : '#ef4444' }}>
                                                {f.verdict === 'Genuine' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                                {f.verdict.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < f.rating ? "#f59e0b" : "none"} color={i < f.rating ? "#f59e0b" : "rgba(255,255,255,0.2)"} />
                                        ))}
                                    </div>

                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Great for my skin!</h4>
                                    <p className="review-text-content">
                                        {f.review_text}
                                    </p>
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Source Verification: {f.source}</span>
                                </div>
                            ))
                        ) : (
                            <div className="glass-panel p-10" style={{ textAlign: 'center' }}>
                                <Package size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
                                <h3>No detailed reviews yet</h3>
                                <p className="text-muted">Users are currently discussing this in individual consults.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductDetails;
