import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
    content: string;
    title?: string;
    children?: React.ReactNode;
    triggerOnMount?: boolean;
    persistOnHover?: boolean;
    className?: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
    content,
    title,
    children,
    triggerOnMount = false,
    persistOnHover = true,
    className = '',
    position = 'top',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);

    useEffect(() => {
        if (triggerOnMount && !hasBeenShown) {
            setIsVisible(true);
            setHasBeenShown(true);
        }
    }, [triggerOnMount, hasBeenShown]);

    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    };

    const handleToggle = () => {
        setIsVisible(!isVisible);
        setHasBeenShown(true);
    };

    const handleMouseEnter = () => {
        if (persistOnHover) {
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        if (persistOnHover && !triggerOnMount) {
            setIsVisible(false);
        }
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-block"
            >
                {children || (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleToggle}
                        className="p-1 h-6 w-6 text-cyan-400 hover:text-green-400"
                    >
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} ${className}`}
                >
                    <div className="bg-black border-2 border-cyan-400 rounded-lg shadow-xl p-4 max-w-xs">
                        <div className="flex items-start justify-between mb-2">
                            {title && (
                                <h4 className="text-cyan-400 font-mono font-bold text-sm">
                                    {title}
                                </h4>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsVisible(false)}
                                className="p-1 h-5 w-5 text-green-400 hover:text-red-400 ml-2"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-green-400 text-xs leading-relaxed font-mono">
                            {content}
                        </p>
                        {/* Arrow */}
                        <div className={`absolute w-0 h-0 ${position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cyan-400' : ''
                            } ${position === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-cyan-400' : ''} ${position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-cyan-400' : ''
                            } ${position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-cyan-400' : ''}`} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpTooltip;
