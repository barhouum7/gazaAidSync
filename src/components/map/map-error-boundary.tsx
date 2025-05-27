'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Map Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
        return (
            <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
                <h2 className="text-xl font-semibold mb-2">Map Loading Error</h2>
                <p className="text-gray-600 mb-4">
                We&apos;re having trouble loading the map. Please try refreshing the page.
                </p>
                <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                Refresh Page
                </button>
            </div>
            </div>
        );
        }

        return this.props.children;
    }
}

export default MapErrorBoundary;