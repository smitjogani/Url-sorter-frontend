const API_URL = 'https://url-sorter-backend.onrender.com';

/**
 * Create a new short link
 */
export async function createLink(url, code = null) {
    const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, code }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create link');
    }

    return response.json();
}

/**
 * Get all links
 */
export async function getLinks(search = '') {
    const url = search
        ? `${API_URL}/api/links?search=${encodeURIComponent(search)}`
        : `${API_URL}/api/links`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch links');
    }

    return response.json();
}

/**
 * Get link by code
 */
export async function getLinkByCode(code) {
    const response = await fetch(`${API_URL}/api/links/${code}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Link not found');
        }
        throw new Error('Failed to fetch link');
    }

    return response.json();
}

/**
 * Delete link by code
 */
export async function deleteLink(code) {
    const response = await fetch(`${API_URL}/api/links/${code}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Link not found');
        }
        throw new Error('Failed to delete link');
    }
}

