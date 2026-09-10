import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ScanProject } from './pages/ScanProject';
import { Findings } from './pages/Findings';
import { FindingDetail } from './pages/FindingDetail';
import { Dependencies } from './pages/Dependencies';
import { Secrets } from './pages/Secrets';
import { ApiSecurity } from './pages/ApiSecurity';
import { SecurityScore } from './pages/SecurityScore';
import { ScanHistory } from './pages/ScanHistory';
import { Remediation } from './pages/Remediation';
import { Verification } from './pages/Verification';
import { CliPlayground } from './pages/CliPlayground';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanProject />} />
            <Route path="/findings" element={<Findings />} />
            <Route path="/findings/:id" element={<FindingDetail />} />
            <Route path="/dependencies" element={<Dependencies />} />
            <Route path="/secrets" element={<Secrets />} />
            <Route path="/api-security" element={<ApiSecurity />} />
            <Route path="/security-score" element={<SecurityScore />} />
            <Route path="/scan-history" element={<ScanHistory />} />
            <Route path="/remediation" element={<Remediation />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/cli" element={<CliPlayground />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
