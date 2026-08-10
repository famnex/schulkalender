import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught UI Error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = window.location.pathname;
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Fehler beim Laden der Kalenderansicht
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                            Es ist ein Problem beim Darstellen des Kalenders aufgetreten. Dies kann durch ein ungewöhnliches Datumsformat oder ein Browser-Problem verursacht werden.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <RefreshCw size={18} />
                            Ansicht zurücksetzen
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
