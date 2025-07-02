import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';
import useHelpStore from '../stores/useHelpStore';

interface SmartHelpTooltipProps {
    helpId: string;
    content: string;
    title?: string;
    children?: React.ReactNode;
    showOnFirstVisit?: boolean;
    delayMs?: number;
    className?: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
}

const SmartHelpTooltip: React.FC<SmartHelpTooltipProps> = ({
    helpId,
    content,
    title,
    children,
    showOnFirstVisit = true,
    delayMs = 1000,
    className = '',
    position = 'top',
}) => {
    const {
        hasHelpBeenShown,
        markHelpShown,
        helpEnabled,
        devMode,
        activeForceHelp,
        clearForceHelp
    } = useHelpStore();

    const [isVisible, setIsVisible] = useState(false);
    const [userDismissed, setUserDismissed] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    };

    // Handle force show from store
    useEffect(() => {
        if (activeForceHelp === helpId) {
            setIsVisible(true);
            setUserDismissed(false);
            clearForceHelp();
        }
    }, [activeForceHelp, helpId, clearForceHelp]);

    // Auto-show logic for first-time users
    useEffect(() => {
        if (!helpEnabled || userDismissed) return;

        const shouldShow = showOnFirstVisit && !hasHelpBeenShown(helpId);
        const shouldShowInDev = devMode;

        if (shouldShow || shouldShowInDev) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, delayMs);

            return () => clearTimeout(timer);
        }
    }, [helpId, showOnFirstVisit, hasHelpBeenShown, helpEnabled, devMode, delayMs, userDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        setUserDismissed(true);
        markHelpShown(helpId);
    };

    const handleToggle = () => {
        setIsVisible(!isVisible);
        if (!isVisible) {
            markHelpShown(helpId);
        }
    };

    if (!helpEnabled) return <>{children}</>;

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => !userDismissed && setIsVisible(true)}
                onMouseLeave={() => !showOnFirstVisit && setIsVisible(false)}
                className="inline-block"
            >
                {children || (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleToggle}
                        className="p-1 h-6 w-6 text-cyan-400 hover:text-green-400 transition-colors"
                    >
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} ${className}`}
                >
                    <div className="bg-black border-2 border-cyan-400 rounded-lg shadow-xl p-4 max-w-xs animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="flex items-start justify-between mb-2">
                            {title && (
                                <h4 className="text-cyan-400 font-mono font-bold text-sm">
                                    {title}
                                </h4>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDismiss}
                                className="p-1 h-5 w-5 text-green-400 hover:text-red-400 ml-2 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-green-400 text-xs leading-relaxed font-mono">
                            {content}
                        </p>

                        {/* Show hint about marking as seen */}
                        {showOnFirstVisit && !hasHelpBeenShown(helpId) && (
                            <div className="mt-2 pt-2 border-t border-cyan-400/30">
                                <p className="text-yellow-400 text-xs font-mono">
                                    💡 This help will auto-hide after viewing
                                </p>
                            </div>
                        )}

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

export default SmartHelpTooltip;
