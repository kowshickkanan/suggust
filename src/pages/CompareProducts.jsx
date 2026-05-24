import React, { useState, useEffect } from 'react';
import { useComparison } from '../context/ComparisonContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Info, TrendingUp, ShieldCheck, Zap, Heart, GitCompare } from 'lucide-react';

const CompareProducts = () => {
    const { selectedProducts, clearComparison } = useComparison();
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [userPrefs, setUserPrefs] = useState({ skinType: 'oily', maxBudget: '1500' });
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const currentUserStr = localStorage.getItem('currentUser');
            const u = currentUserStr ? JSON.parse(currentUserStr) : null;
            const userKey = u?.id || u?.username || 'guest';
            
            const prefsStr = localStorage.getItem(`userPrefs_${userKey}`);
            if (prefsStr && prefsStr !== 'undefined' && prefsStr !== 'null') {
                const prefs = JSON.parse(prefsStr);
                if (prefs) setUserPrefs(prefs);
            }
        } catch (e) {
            console.error('Failed to parse user preferences:', e);
        }
    }, []);

    const getMatchScore = (product) => {
        if (!product) return 0;
        let match = 85; 
        
        // Budget
        if (userPrefs?.maxBudget && product.price) {
            if (Number(product.price) <= Number(userPrefs.maxBudget)) match += 10;
            else match -= 25;
        }

        // Skin type heuristics
        if (product.category && product.category.toLowerCase() === 'skincare' && userPrefs?.skinType) {
            const name = (product.name || '').toLowerCase();
            const type = (userPrefs.skinType || '').toLowerCase();
            if (type === 'oily' && (name.includes('derma') || name.includes('salicylic') || name.includes('foaming'))) match += 5;
            else if (type === 'dry' && (name.includes('mamaearth') || name.includes('hydrating') || name.includes('moistur'))) match += 5;
            else if (type === 'combination' && (name.includes('himalaya') || name.includes('neem') || name.includes('gentle'))) match += 5;
            else match -= 5;
        }
        return Math.min(99, Math.max(10, match));
    };

    useEffect(() => {
        if (selectedProducts.length === 2) {
            handleAnalysis();
        }
    }, [selectedProducts]);

    const handleAnalysis = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/compare_analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product1: selectedProducts[0],
                    product2: selectedProducts[1]
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server responded with an error');
            }
            
            setAnalysis(data.analysis || 'No analysis generated.');
        } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysis(`Unable to generate AI analysis: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (selectedProducts.length < 2) {
        return (
            <div className="compare-empty-state glass-panel">
                <GitCompare size={64} className="text-muted" />
                <h2>Select 2 Products to Compare</h2>
                <p>Go back to the products page and select at least two items to see a detailed analysis.</p>
                <button className="btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
            </div>
        );
    }

    const p1 = selectedProducts[0];
    const p2 = selectedProducts[1];
    const isSkincare = p1?.category?.toLowerCase() === 'skincare' && p2?.category?.toLowerCase() === 'skincare';

    return (
        <div className="compare-page-container">
            <header className="compare-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Product Comparison</h1>
                <button className="btn-clear-all" onClick={clearComparison}>Clear Selection</button>
            </header>

            <div className="compare-grid-layout">
                {/* Product Headers */}
                <div className="compare-row headers">
                    <div className="row-label">Product</div>
                    <div className="product-head">
                        <img src={p1.image_url} alt={p1.name} />
                        <h3>{p1.name}</h3>
                        <div className="price-tag">{p1.price}/-</div>
                    </div>
                    <div className="product-head">
                        <img src={p2.image_url} alt={p2.name} />
                        <h3>{p2.name}</h3>
                        <div className="price-tag">{p2.price}/-</div>
                    </div>
                </div>

                {/* Ratings Row */}
                <div className="compare-row">
                    <div className="row-label">Rating</div>
                    <div className="rating-cell">
                        <Star className="text-accent" fill="currentColor" size={16} />
                        <span>{p1.rating || '4.5'} / 5.0</span>
                    </div>
                    <div className="rating-cell">
                        <Star className="text-accent" fill="currentColor" size={16} />
                        <span>{p2.rating || '4.2'} / 5.0</span>
                    </div>
                </div>

                {/* Categories Row */}
                <div className="compare-row">
                    <div className="row-label">Category</div>
                    <div className="data-cell">{p1.category}</div>
                    <div className="data-cell">{p2.category}</div>
                </div>

                {/* Skincare Specifics */}
                {isSkincare && (
                    <>
                        <div className="compare-row skincare-special">
                            <div className="row-label">Recommended For</div>
                            <div className="data-cell skin-type-tags">
                                <span className="tag">Oily Skin</span>
                                <span className="tag">Acne Prone</span>
                            </div>
                            <div className="data-cell skin-type-tags">
                                <span className="tag">Dry Skin</span>
                                <span className="tag">Sensitive Skin</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Profile Match Row (Moved to bottom of table) */}
                <div className="compare-row match-row">
                    <div className="row-label">Profile Match</div>
                    <div className="data-cell">
                        <div className={`match-badge ${getMatchScore(p1) >= 80 ? 'high' : getMatchScore(p1) >= 60 ? 'medium' : 'low'}`}>
                            {getMatchScore(p1)}% Match
                        </div>
                    </div>
                    <div className="data-cell">
                        <div className={`match-badge ${getMatchScore(p2) >= 80 ? 'high' : getMatchScore(p2) >= 60 ? 'medium' : 'low'}`}>
                            {getMatchScore(p2)}% Match
                        </div>
                    </div>
                </div>

                {/* AI Smart Analysis Section */}
                <div className="comparison-analysis-container glass-panel">
                    <div className="analysis-header">
                        <Zap className="text-accent" size={24} />
                        <h2>Deep AI Intelligence Insight</h2>
                    </div>
                    
                    {loading ? (
                        <div className="analysis-loading">
                            <div className="spinner"></div>
                            <p>Gemini is synthesizing clinical data...</p>
                        </div>
                    ) : (
                        <div className="analysis-content markdown-body">
                            {typeof analysis === 'string' ? analysis.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            )) : <p>{String(analysis)}</p>}
                        </div>
                    )}
                </div>

                {/* Action Row Removed */}
            </div>

            <style jsx>{`
                .compare-page-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    color: var(--text-main);
                }

                .compare-header {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .compare-header h1 {
                    font-size: 2.5rem;
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .btn-back {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 0.75rem;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-back:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(-5px);
                }

                .btn-clear-all {
                    margin-left: auto;
                    background: none;
                    border: 1px solid rgba(255, 0, 0, 0.3);
                    color: #ff4444;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .compare-grid-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .compare-row {
                    display: grid;
                    grid-template-columns: 200px 1fr 1fr;
                    background: var(--bg-dark);
                    padding: 1.5rem;
                    align-items: center;
                }

                .compare-row.headers {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 3rem 1.5rem;
                }

                .row-label {
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                }

                .product-head {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 1rem;
                }

                .product-head img {
                    width: 180px;
                    height: 180px;
                    object-fit: contain;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
                }

                .price-tag {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--accent-color);
                }

                .rating-cell, .data-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-size: 1.1rem;
                }

                .skin-type-tags {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .tag {
                    background: rgba(99, 102, 241, 0.1);
                    color: #a5b4fc;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                .match-badge {
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 1rem;
                }
                .match-badge.high {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .match-badge.medium {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                .match-badge.low {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .comparison-analysis-container {
                    grid-column: span 3;
                    margin: 2rem;
                    padding: 2.5rem;
                    background: rgba(99, 102, 241, 0.05);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                .analysis-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .analysis-content {
                    line-height: 1.8;
                    color: rgba(255, 255, 255, 0.8);
                }

                .full-width {
                    width: 100%;
                }

                .analysis-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 3rem;
                    gap: 1rem;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid var(--accent-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CompareProducts;
