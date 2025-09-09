
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfReaderProps {
    file: string | File;
    onClose: () => void;
}

const PdfReader: React.FC<PdfReaderProps> = ({ file, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    };

    const onDocumentLoadError = () => {
        setError('Failed to load PDF.');
        setLoading(false);
    };

    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
    const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
    const downloadPdf = () => {
        if (typeof file === 'string') {
            const link = document.createElement('a');
            link.href = file;
            link.download = 'document.pdf';
            link.click();
        } else {
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'document.pdf';
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurry Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 flex flex-col z-10">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <div className="flex gap-2">
                        <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Prev</button>
                        <span className="px-2 py-1">Page {pageNumber} / {numPages}</span>
                        <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={zoomOut} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">-</button>
                        <button onClick={zoomIn} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">+</button>
                        <button onClick={downloadPdf} className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">Download</button>
                        <button onClick={onClose} className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600">Close</button>
                    </div>
                </div>
                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                    {loading && <span className="text-gray-500">Loading PDF...</span>}
                    {error && <span className="text-red-500">{error}</span>}
                    {!loading && !error && (
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading=""
                            error=""
                        >
                            <Page pageNumber={pageNumber} scale={scale} />
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfReader;
