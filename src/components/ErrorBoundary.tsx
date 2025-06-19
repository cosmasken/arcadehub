
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, errorMessage: error.message };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-mono text-red-400">ERROR</h1>
                        <p className="text-green-400 mt-2">{this.state.errorMessage}</p>
                        <button
                            className="mt-4 bg-yellow-400 text-black font-mono px-4 py-2 rounded"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
