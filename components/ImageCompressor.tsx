
import React, { useState, useCallback, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

const UploadIcon = () => (
    <svg className="w-10 h-10 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

interface CompressedFile {
    originalFile: File;
    dataUrl: string;
    newSize: number;
}

interface ImageCompressorProps {
    onBack?: () => void;
}

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const compressImage = (file: File, quality: number, format: 'jpeg' | 'png' | 'webp'): Promise<CompressedFile> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Optional: resize large images to a max dimension to prevent browser crashes
                const MAX_WIDTH = 2560;
                const MAX_HEIGHT = 2560;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                const mimeType = `image/${format}`;
                const dataUrl = canvas.toDataURL(mimeType, format !== 'png' ? quality / 100 : undefined);
                
                const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
                const byteCharacters = atob(base64Data);
                const newSize = byteCharacters.length;

                resolve({ originalFile: file, dataUrl, newSize });
            };
            img.onerror = () => reject(new Error(`Could not load image: ${file.name}. It might be corrupted or an unsupported format.`));
        };
        reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
    });
};


export const ImageCompressor: React.FC<ImageCompressorProps> = ({ onBack }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
    const [quality, setQuality] = useState<number>(80);
    const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
    const [isCompressing, setIsCompressing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            // FIX: Explicitly type `newFiles` as `File[]` to ensure correct type propagation.
            const newFiles: File[] = Array.from(event.target.files);
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles]
            });
            setCompressedFiles([]); // Reset results when new files are added
        }
    };

    const handleCompress = useCallback(async () => {
        if (files.length === 0) return;
        setIsCompressing(true);
        setError(null);
        setCompressedFiles([]);

        try {
            const compressedPromises = files.map(file => compressImage(file, quality, outputFormat));
            const results = await Promise.all(compressedPromises);
            setCompressedFiles(results);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during image compression.');
            }
        } finally {
            setIsCompressing(false);
        }
    }, [files, quality, outputFormat]);

    const handleDownload = (file: CompressedFile) => {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        const name = file.originalFile.name.substring(0, file.originalFile.name.lastIndexOf('.')) || file.originalFile.name;
        link.download = `${name}.${outputFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAll = () => {
        compressedFiles.forEach(handleDownload);
    };
    
    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            // FIX: Explicitly type `newFiles` as `File[]` to ensure correct type propagation.
             const newFiles: File[] = Array.from(event.dataTransfer.files);
            setFiles(prev => {
                const existingNames = new Set(prev.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
                return [...prev, ...uniqueNewFiles]
            });
            setCompressedFiles([]);
            event.dataTransfer.clearData();
        }
    };

    return (
        <section className="relative w-full bg-gray-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700 mt-8 animate-fade-in">
            {onBack && (
                <button 
                    onClick={onBack} 
                    className="absolute top-4 left-4 flex items-center px-4 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all duration-300 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Article
                </button>
            )}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-500">
                    Bulk Image Compressor
                </h2>
                <p className="mt-2 text-gray-400">Optimize your images for faster load times and better SEO.</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Settings */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">Quality: {quality}%</label>
                            <input
                                type="range"
                                id="quality"
                                min="1"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                disabled={outputFormat === 'png'}
                            />
                            {outputFormat === 'png' && <p className="text-xs text-gray-500 mt-1">Quality setting does not apply to PNG format.</p>}
                        </div>
                        <div>
                            <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                            <select
                                id="format"
                                value={outputFormat}
                                onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                            >
                                <option value="jpeg">JPEG</option>
                                <option value="webp">WebP</option>
                                <option value="png">PNG</option>
                            </select>
                        </div>
                    </div>
                    {/* File Input */}
                    <div>
                         <label
                            htmlFor="dropzone-file"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                         >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadIcon />
                                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP, BMP</p>
                            </div>
                            <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-gray-300 mb-2">Selected files ({files.length}):</h4>
                        <div className="max-h-32 overflow-y-auto bg-gray-900/50 p-3 rounded-md border border-gray-700 space-y-1">
                            {files.map(file => (
                                <p key={file.name} className="text-sm text-gray-400 truncate">{file.name}</p>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={handleCompress}
                        disabled={isCompressing || files.length === 0}
                        className="px-8 py-3 font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg shadow-lg hover:from-blue-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCompressing ? 'Compressing...' : `Compress ${files.length} Image${files.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>

            {isCompressing && <LoadingSpinner message="Compressing images, please wait..." />}
            {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
            
            {compressedFiles.length > 0 && !isCompressing && (
                <div className="mt-12">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-200">Compression Results</h3>
                         <button
                            onClick={handleDownloadAll}
                            className="flex-shrink-0 flex items-center justify-center px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all"
                            >
                            <DownloadIcon />
                            Download All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {compressedFiles.map((cFile, index) => {
                            const reduction = ((cFile.originalFile.size - cFile.newSize) / cFile.originalFile.size) * 100;
                            return (
                                <div key={index} className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
                                    <img src={cFile.dataUrl} alt={`Compressed ${cFile.originalFile.name}`} className="w-full h-40 object-contain rounded-md mb-4 bg-gray-800" />
                                    <h4 className="font-semibold text-gray-200 truncate mb-2">{cFile.originalFile.name}</h4>
                                    <div className="text-sm space-y-1 text-gray-400">
                                        <p>Original: <span className="font-medium text-gray-300">{formatBytes(cFile.originalFile.size)}</span></p>
                                        <p>Compressed: <span className="font-medium text-gray-300">{formatBytes(cFile.newSize)}</span></p>
                                        <p>Reduction: <span className={`font-bold ${reduction > 0 ? 'text-green-400' : 'text-red-400'}`}>{reduction.toFixed(1)}%</span></p>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(cFile)}
                                        className="w-full mt-4 flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-sky-600 rounded-md shadow-sm hover:bg-sky-700 transition-colors"
                                    >
                                        <DownloadIcon /> Download
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};