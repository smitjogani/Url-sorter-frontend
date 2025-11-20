import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Layout from './components/Layout';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/code/:code" element={<Stats />} />
            </Routes>
        </Layout>
    );
}

export default App;

