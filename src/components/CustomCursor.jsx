import React, { useEffect, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dotPosition, setDotPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [activeLabel, setActiveLabel] = useState('');

    useEffect(() => {
        const moveCursor = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setTimeout(() => {
                setDotPosition({ x: e.clientX, y: e.clientY });
            }, 40);
        };

        const handleHover = (e) => {
            const el = e.target.closest('button, a, input, textarea, .toggle-link, .nav-item');
            if (el) {
                setIsHovering(true);
                // Extract some text for the AI probe to "read"
                const label = el.innerText || el.placeholder || el.getAttribute('aria-label') || 'OBJECT';
                setActiveLabel(label.split(' ')[0].toUpperCase());
            } else {
                setIsHovering(false);
                setActiveLabel('');
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, []);

    return (
        <>
            {/* The main AI Probe Ring */}
            <div
                className={`ai-probe-ring ${isHovering ? 'hover' : ''}`}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
            >
                <div className="probe-crosshair-h"></div>
                <div className="probe-crosshair-v"></div>
                {isHovering && <span className="probe-data-label">{activeLabel}_LINKED</span>}
            </div>

            {/* The Neural Core Dot */}
            <div
                className={`ai-neural-core ${isHovering ? 'hover' : ''}`}
                style={{ left: `${dotPosition.x}px`, top: `${dotPosition.y}px` }}
            >
                <div className="core-glow"></div>
            </div>
        </>
    );
};

export default CustomCursor;
