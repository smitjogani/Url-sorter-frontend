import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLink, getLinks, deleteLink } from '../services/api';

function Dashboard() {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [code, setCode] = useState('');
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState({ url: '', code: '' });
    const [success, setSuccess] = useState('');
    const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

    useEffect(() => {
        loadLinks();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = links.filter(
                (link) =>
                    link.code.toLowerCase().includes(search.toLowerCase()) ||
                    link.url.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredLinks(filtered);
        } else {
            setFilteredLinks(links);
        }
    }, [search, links]);

    const loadLinks = async () => {
        try {
            setLoading(true);
            const data = await getLinks();
            setLinks(data);
            setFilteredLinks(data);
        } catch (err) {
            console.error('Error loading links:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({ url: '', code: '' });
        setSuccess('');

        // Validate URL
        if (!url || !isValidUrl(url)) {
            setError({ ...error, url: 'Please enter a valid URL (must start with http:// or https://)' });
            return;
        }

        // Validate code if provided
        if (code && (code.length < 6 || code.length > 8)) {
            setError({ ...error, code: 'Code must be 6-8 characters' });
            return;
        }

        if (code && !/^[A-Za-z0-9]+$/.test(code)) {
            setError({ ...error, code: 'Code must contain only letters and numbers' });
            return;
        }

        try {
            setSubmitting(true);
            const newLink = await createLink(url, code || undefined);

            setSuccess(`✅ Link created! Short code: ${newLink.code}`);
            setUrl('');
            setCode('');

            // Reload links
            await loadLinks();
        } catch (err) {
            if (err.message.includes('already exists')) {
                setError({ ...error, code: 'This code already exists. Please choose another.' });
            } else {
                setError({ ...error, url: err.message || 'Failed to create link' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (linkCode) => {
        if (!window.confirm(`Are you sure you want to delete the link with code "${linkCode}"?`)) {
            return;
        }

        try {
            await deleteLink(linkCode);
            await loadLinks();
        } catch (err) {
            alert('Failed to delete link. Please try again.');
            console.error('Error deleting link:', err);
        }
    };

    const handleSort = (field) => {
        let direction = 'asc';
        if (sortConfig.field === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ field, direction });

        const sorted = [...filteredLinks].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (field === 'clicks') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (field === 'lastClicked') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();

            if (direction === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });

        setFilteredLinks(sorted);
    };

    const isValidUrl = (string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    const truncateUrl = (url, maxLength) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    return (
        <>
            {/* Add Link Form */}
            <section className="card form-section">
                <h2>Create Short Link</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="url">Target URL *</label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                        />
                        <span className="error-message">{error.url}</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">Custom Code (Optional)</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                                setCode(value);
                                setError({ ...error, code: '' });
                            }}
                            placeholder="6-8 characters (letters & numbers)"
                            maxLength="8"
                        />
                        <span className="help-text">Leave empty for auto-generated code</span>
                        <span className="error-message">{error.code}</span>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? '⏳ Creating...' : 'Create Link'}
                    </button>
                </form>

                {success && <div className="success-message">{success}</div>}
            </section>

            {/* Search/Filter */}
            <section className="search-section">
                <div className="search-box">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by code or URL..."
                    />
                    {search && (
                        <button
                            type="button"
                            className="btn-icon"
                            onClick={() => setSearch('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </section>

            {/* Links Table */}
            <section className="card table-section">
                <div className="table-header">
                    <h2>All Links</h2>
                    <span className="badge">{filteredLinks.length} link{filteredLinks.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading links...</p>
                    </div>
                ) : filteredLinks.length === 0 ? (
                    <div className="empty-state">
                        <p>📭 {search ? 'No links found.' : 'No links yet. Create your first short link above!'}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => handleSort('code')}
                                        data-sorted={sortConfig.field === 'code' ? sortConfig.direction : null}
                                    >
                                        Short Code
                                        <span className="sort-indicator"></span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('url')}
                                        data-sorted={sortConfig.field === 'url' ? sortConfig.direction : null}
                                    >
                                        Target URL
                                        <span className="sort-indicator"></span>
                                    </th>
                                    <th
                                        className="text-center"
                                        onClick={() => handleSort('clicks')}
                                        data-sorted={sortConfig.field === 'clicks' ? sortConfig.direction : null}
                                    >
                                        Clicks
                                        <span className="sort-indicator"></span>
                                    </th>
                                    <th
                                        className="text-center"
                                        onClick={() => handleSort('lastClicked')}
                                        data-sorted={sortConfig.field === 'lastClicked' ? sortConfig.direction : null}
                                    >
                                        Last Clicked
                                        <span className="sort-indicator"></span>
                                    </th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLinks.map((link) => (
                                    <tr key={link.id}>
                                        <td className="code-cell">{link.code}</td>
                                        <td className="url-cell" title={link.url}>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                {truncateUrl(link.url, 50)}
                                            </a>
                                        </td>
                                        <td className="text-center">{link.clicks || 0}</td>
                                        <td className="text-center">{formatDate(link.lastClicked)}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn action-btn-view"
                                                onClick={() => navigate(`/code/${link.code}`)}
                                            >
                                                View Stats
                                            </button>
                                            <button
                                                className="action-btn action-btn-delete"
                                                onClick={() => handleDelete(link.code)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}

export default Dashboard;

