/**
 * Compress image file before upload
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
        // Only compress images
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob && blob.size < file.size) {
                            // Only use compressed version if it's smaller
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    file.type,
                    quality
                );
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
    });
}

/** Default chunk size: 5MB for smoother large uploads (e.g. 1GB = 200 chunks) */
export const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

/** Use chunked upload for files larger than this (5MB) */
export const CHUNK_THRESHOLD = DEFAULT_CHUNK_SIZE;

/**
 * Split file into chunks for chunked upload
 */
export function splitFileIntoChunks(file, chunkSize = DEFAULT_CHUNK_SIZE) {
    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        chunks.push({
            chunk,
            index: chunkIndex++,
            start,
            end,
            total: file.size,
        });
        start = end;
    }

    return chunks;
}

/**
 * Upload file in chunks (for large files, e.g. 1GB). Batch-wise and server-friendly.
 * @param {Object} initPayload - Extra keys to send in init (e.g. { body: 'message text' })
 */
export async function uploadFileInChunks(
    file,
    uploadUrl,
    headers = {},
    onProgress = null,
    chunkSize = DEFAULT_CHUNK_SIZE,
    initPayload = {}
) {
    if (file.size <= chunkSize) {
        return uploadFileDirectly(file, uploadUrl, headers, onProgress);
    }

    const totalChunks = Math.ceil(file.size / chunkSize);
    const initBody = {
        filename: file.name,
        filetype: file.type || 'application/octet-stream',
        filesize: file.size,
        total_chunks: totalChunks,
        ...initPayload,
    };

    const sessionResponse = await fetch(`${uploadUrl}/init`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(initBody),
    });

    if (!sessionResponse.ok) {
        const err = await sessionResponse.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to initialize chunked upload');
    }

    const { session_id } = await sessionResponse.json();
    const chunks = splitFileIntoChunks(file, chunkSize);
    let uploadedBytes = 0;

    for (const chunkData of chunks) {
        const formData = new FormData();
        formData.append('chunk', chunkData.chunk);
        formData.append('session_id', session_id);
        formData.append('chunk_index', String(chunkData.index));
        formData.append('total_chunks', String(chunks.length));

        const chunkRes = await fetch(`${uploadUrl}/chunk`, {
            method: 'POST',
            headers: { Accept: 'application/json', ...headers },
            body: formData,
        });
        if (!chunkRes.ok) {
            const err = await chunkRes.json().catch(() => ({}));
            throw new Error(err.message || 'Chunk upload failed');
        }

        uploadedBytes += chunkData.chunk.size;
        if (onProgress) {
            onProgress(Math.round((uploadedBytes / file.size) * 100), uploadedBytes, file.size);
        }
    }

    const finalizeResponse = await fetch(`${uploadUrl}/finalize`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify({ session_id }),
    });

    if (!finalizeResponse.ok) {
        const err = await finalizeResponse.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to finalize chunked upload');
    }

    return finalizeResponse.json();
}

/**
 * Upload file directly (for smaller files or when chunking not needed)
 * Can accept either a File or FormData
 * Uses axios for better CORS handling and consistency
 */
export async function uploadFileDirectly(data, uploadUrl, headers = {}, onProgress = null) {
    // Import axios dynamically to avoid circular dependencies
    const axios = (await import('../api/axios')).default;
    
    const formData = data instanceof FormData ? data : (() => {
        const fd = new FormData();
        fd.append('file', data);
        return fd;
    })();

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...headers,
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent, progressEvent.loaded, progressEvent.total);
            }
        },
    };

    // Extract relative path from full URL if needed
    let apiPath = uploadUrl;
    if (uploadUrl.startsWith('http://') || uploadUrl.startsWith('https://')) {
        // Extract path from full URL
        try {
            const url = new URL(uploadUrl);
            apiPath = url.pathname;
        } catch {
            // If URL parsing fails, try to extract path manually
            const match = uploadUrl.match(/\/api\/.*$/);
            if (match) {
                apiPath = match[0];
            }
        }
    }

    const response = await axios.post(apiPath, formData, config);
    return response.data;
}

/**
 * Optimized file upload: compress images, use chunked upload for large files (smooth 1GB+).
 */
export async function optimizedFileUpload(file, uploadUrl, options = {}) {
    const {
        compressImages = true,
        maxImageWidth = 1920,
        maxImageHeight = 1080,
        imageQuality = 0.8,
        useChunking = true,
        chunkSize = DEFAULT_CHUNK_SIZE,
        onProgress = null,
        headers = {},
        initPayload = {},
    } = options;

    let fileToUpload = file;
    if (compressImages && file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, maxImageWidth, maxImageHeight, imageQuality);
    }

    if (useChunking && fileToUpload.size > chunkSize) {
        return uploadFileInChunks(
            fileToUpload,
            uploadUrl,
            headers,
            onProgress,
            chunkSize,
            initPayload
        );
    }

    return uploadFileDirectly(fileToUpload, uploadUrl, headers, onProgress);
}
