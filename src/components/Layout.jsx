import { Link } from 'react-router-dom';

function Layout({ children }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="container">
                <header>
                    <h1>🔗 TinyLink</h1>
                    <p className="subtitle">Professional URL Shortener</p>
                </header>
                <main>{children}</main>
                <footer>
                    <p>
                        Built with ❤️ |{' '}
                        <a href="/healthz" target="_blank" rel="noopener noreferrer">
                            Health Check
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default Layout;

