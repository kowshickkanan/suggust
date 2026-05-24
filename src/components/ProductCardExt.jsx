import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Package, Star, GitCompare, Check, TrendingDown, Bell } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';

const ProductCardExt = ({ product, onAddChat, onViewFeedback }) => {
    const navigate = useNavigate();
    const { selectedProducts, addToComparison } = useComparison();
    const { addToCart } = useCart();
    const isSelected = selectedProducts.some(p => p.id === product.id);

    return (
        <div className={`glass-panel ext-product-card p-4 ${isSelected ? 'selected-card' : ''}`}>
            <div className="ext-card-image">
                {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{width:'100%', height:'100%', objectFit:'contain'}} />
                ) : (
                    <Package size={48} className="text-muted" opacity={0.5} />
                )}
            </div>
            <div className="ext-card-content">
                <p className="text-main" style={{fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0.5rem', marginLeft: '15px', flex: 1}}>
                    {product.name} - This is a highly recommended {product.category.toLowerCase()} item. Explore details and feedback below!
                </p>

                {/* Deal Comparison & Purchase Row */}
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0 15px', marginBottom: '0.75rem', width: '100%' }}>
                    <button 
                        className="cheap-buy-btn"
                        onClick={() => navigate('/cheap-buy', { state: { product } })}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-main)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <TrendingDown size={14} />
                        Cheap Buy
                    </button>

                    <button 
                        onClick={() => addToCart(product)}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(to bottom, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Bell size={14} />
                        Watchlist
                    </button>
                </div>

                <div style={{display: 'flex', gap: '2px', width: '100%', marginTop: 'auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <button 
                        className="add-to-chat-btn" 
                        onClick={() => onAddChat(product)} 
                        style={{flex: 1, margin: 0, borderRadius: 0, padding: '0.8rem 0.5rem', background: 'var(--accent-color)', color: 'white', border: 'none', fontSize: '0.85rem', fontWeight: '700'}}
                    >
                        <MessageCircle size={16} /> CHAT
                    </button>
                    <button 
                        className={`compare-btn ${isSelected ? 'active' : ''}`} 
                        onClick={() => addToComparison(product)}
                        style={{
                            flex: 1, 
                            margin: 0, 
                            borderRadius: 0, 
                            padding: '0.8rem 0.5rem', 
                            background: isSelected ? 'var(--accent-color)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                            color: 'white', 
                            border: 'none', 
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.85rem', 
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isSelected ? <Check size={16} /> : <GitCompare size={16} />}
                        {isSelected ? 'SELECTED' : 'COMPARE'}
                    </button>
                    <button 
                        className="add-to-chat-btn" 
                        onClick={() => onViewFeedback(product)} 
                        style={{flex: 1, margin: 0, borderRadius: 0, padding: '0.8rem 0.5rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', border: 'none', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: '700'}}
                    >
                        <Star size={16} /> FEEDBACK
                    </button>
                </div>
            </div>
            <style jsx>{`
                .selected-card {
                    border: 1px solid var(--accent-color) !important;
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
                }
            `}</style>
        </div>
    );
};

export default ProductCardExt;
