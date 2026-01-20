import React, { useEffect, useState } from 'react'
import { Check, X, ArrowRight, RefreshCw } from 'lucide-react'

interface StatusFeedbackProps {
    type: 'success' | 'error'
    title: string
    message: string
    onAction: () => void
    actionLabel: string
}

const StatusFeedback: React.FC<StatusFeedbackProps> = ({
    type,
    title,
    message,
    onAction,
    actionLabel
}) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger animation on mount
        const timer = setTimeout(() => setIsVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in-up">
            <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(var(--color-ring), 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(var(--color-ring), 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(var(--color-ring), 0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out 0.2s forwards;
          opacity: 0; /* Initial state before animation starts */
        }
      `}</style>

            {/* Icon Circle */}
            <div
                className={`relative flex items-center justify-center w-20 h-20 rounded-full mb-6 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    } animate-scale-in transition-all duration-300 transform`}
                style={{
                    '--color-ring': type === 'success' ? '34, 197, 94' : '239, 68, 68'
                } as React.CSSProperties}
            >
                {/* Outer Ring Pulse */}
                <div className={`absolute inset-0 rounded-full opacity-75 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                    style={{ animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />

                {/* Icon */}
                <div className={`relative z-10 p-4 rounded-full ${type === 'success' ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'
                    } shadow-lg`}>
                    {type === 'success' ? (
                        <Check size={32} strokeWidth={3} />
                    ) : (
                        <X size={32} strokeWidth={3} />
                    )}
                </div>
            </div>

            {/* Text Content */}
            <div className={`transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h3 className={`text-2xl font-bold mb-2 ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    {message}
                </p>

                {/* Action Button */}
                <button
                    onClick={onAction}
                    className={`group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'success'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500'
                        }`}
                >
                    <span>{actionLabel}</span>
                    {type === 'success' ? (
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                    ) : (
                        <RefreshCw className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default StatusFeedback
