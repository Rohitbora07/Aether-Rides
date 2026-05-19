'use client'
import React from 'react'
import Image from 'next/image'

type DocsPreviewProps = {
    label: string,
    url?: string
}

function DocsPreview({ label, url }: DocsPreviewProps) {
    const isImage = url?.match(/\.(jpg|jpeg|png|webp)$/i)
    const isPdf = url?.endsWith(".pdf")

    return (
        <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b text-sm font-semibold">
                {label}
            </div>

            <div className="h-52 relative flex items-center justify-center bg-white">
                {!url && (
                    <span className="text-xs text-gray-400">
                        Image Not Uploaded
                    </span>
                )}

                {isImage && (
                    <Image alt={label} src={url!} sizes="100vw"
                        className="object-cover"
                        fill />
                )}
                {
                    isPdf && (
                        <iframe src={url} title={label} className="w-full object-cover h-full" />
                    )
                }
            </div>
            {
                    url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center pt-2 bg-red-600 text-xs items-center h-8 font-medium text-white hover:bg-red-700 transition"
                        >
                            Open Full Document
                        </a>
                    )
                }
        </div>
    )
}

export default DocsPreview
