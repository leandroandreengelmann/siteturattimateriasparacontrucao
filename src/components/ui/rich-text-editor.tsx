'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
    ],
}

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
]

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    return (
        <div className="rich-text-editor bg-muted/30 border border-border/50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <style jsx global>{`
                .rich-text-editor .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    padding: 12px 16px;
                    background: rgba(0, 0, 0, 0.02);
                }
                .rich-text-editor .ql-container.ql-snow {
                    border: none;
                    min-height: 250px;
                    font-size: 16px;
                    font-family: inherit;
                }
                .rich-text-editor .ql-editor {
                    padding: 20px;
                    color: #18181b;
                    font-weight: 500;
                }
                .rich-text-editor .ql-editor.ql-blank::before {
                    color: #a1a1aa;
                    font-style: normal;
                    font-weight: 500;
                    left: 20px;
                }
                .rich-text-editor .ql-snow .ql-stroke {
                    stroke: #71717a;
                    stroke-width: 2px;
                }
                .rich-text-editor .ql-snow .ql-picker {
                    color: #71717a;
                    font-weight: 600;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    )
}
