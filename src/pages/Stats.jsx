import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLinkByCode, deleteLink } from '../services/api';

function Stats() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [link, setLink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadStats();
    }, [code]);

    // Poll for clicks updates every 3 seconds so UI updates without full reload
    useEffect(() => {
        if (!code) return;
        const interval = setInterval(async () => {
            try {
                const data = await getLinkByCode(code);
                // Update only clicks and lastClicked to avoid clobbering transient UI state
                setLink((prev) => (prev ? { ...prev, clicks: data.clicks, lastClicked: data.lastClicked } : data));
            } catch (err) {
                // ignore polling errors silently
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [code]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(false);
            const data = await getLinkByCode(code);
            setLink(data);
        } catch (err) {
            setError(true);
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the link with code "${code}"?`)) {
            return;
        }

        try {
            await deleteLink(code);
            navigate('/');
        } catch (err) {
            alert('Failed to delete link. Please try again.');
            console.error('Error deleting link:', err);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // Show feedback (you could add a toast notification here)
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    const getShortLink = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/${code}`;
    };

    if (loading) {
        return (
            <div className="stats-container">
                <a href="/" className="btn btn-secondary">
                    ← Back to Dashboard
                </a>
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading link statistics...</p>
                </div>
            </div>
        );
    }

    if (error || !link) {
        return (
            <div className="stats-container">
                <a href="/" className="btn btn-secondary">
                    ← Back to Dashboard
                </a>
                <div className="error-state">
                    <p>❌ Link not found or failed to load.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="stats-container">
            <a href="/" className="btn btn-secondary">
                ← Back to Dashboard
            </a>

            <div className="card stats-card">
                <h2>Link Details</h2>

                <div className="stats-grid">
                    <div className="stat-item">
                        <label>Short Code</label>
                        <div className="stat-value code-value">
                            <span>{link.code}</span>
                            <button
                                className="btn-icon-small"
                                onClick={() => copyToClipboard(link.code)}
                                title="Copy code"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    <div className="stat-item">
                        <label>Target URL</label>
                        <div className="stat-value url-value">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.url}
                            </a>
                            <button
                                className="btn-icon-small"
                                onClick={() => copyToClipboard(link.url)}
                                title="Copy URL"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    <div className="stat-item">
                        <label>Total Clicks</label>
                        <div className="stat-value large">{link.clicks || 0}</div>
                    </div>

                    <div className="stat-item">
                        <label>Last Clicked</label>
                        <div className="stat-value">{formatDate(link.lastClicked)}</div>
                    </div>

                    <div className="stat-item">
                        <label>Created At</label>
                        <div className="stat-value">{formatDate(link.createdAt)}</div>
                    </div>

                    <div className="stat-item">
                        <label>Short Link</label>
                        <div className="stat-value link-value">
                            <a href={getShortLink()} target="_blank" rel="noopener noreferrer">
                                {getShortLink()}
                            </a>
                            <button
                                className="btn-icon-small"
                                onClick={() => copyToClipboard(getShortLink())}
                                title="Copy short link"
                            >
                                📋
                            </button>
                        </div>
                    </div>
                </div>

                <div className="actions-section">
                    <button className="btn btn-danger" onClick={handleDelete}>
                        Delete Link
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Stats;

