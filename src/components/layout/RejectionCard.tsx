import { AlertTriangle } from 'lucide-react'
import React from 'react'

type RejectionCardProps = {
    title: string,
    reason: string,
    actionLabel: string,
    onAction: () => void
}

function RejectionCard({ title, reason, actionLabel, onAction }: RejectionCardProps) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-semibold text-sm sm:text-base">
                <AlertTriangle size={18} />
                {title}
            </div>

            <div className="bg-white border rounded-xl p-4 text-sm sm:text-base">
                {reason}
            </div>
            {
                onAction && (
                    <button
                        onClick={onAction}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        {actionLabel || "Retry"}
                    </button>
                )
            }
        </div>
    )
}

export default RejectionCard
