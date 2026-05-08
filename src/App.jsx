import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LiveFeed from './pages/LiveFeed.jsx'
import SmartMoney from './pages/SmartMoney.jsx'
import TokenScreener from './pages/TokenScreener.jsx'
import Alerts from './pages/Alerts.jsx'
import Heatmap from './pages/Heatmap.jsx'
import SettingsPage from './pages/Settings.jsx'
import { useWhaleTransactions } from './hooks/useWhaleTransactions.js'
import { useApp } from './context/AppContext.jsx'
import { formatUSD } from './utils/formatters.js'

function AppShell() {
  const { alerts } = useApp()
  const { volume24h, activeWhales, transactions } = useWhaleTransactions(false)

  const stats = {
    volume: formatUSD(volume24h, true),
    whales: activeWhales,
    txCount: transactions.length,
    alerts: alerts.filter((a) => a.enabled).length,
  }

  return (
    <Layout stats={stats}>
      <Routes>
        <Route path="/" element={<LiveFeed />} />
        <Route path="/wallets" element={<SmartMoney />} />
        <Route path="/screener" element={<TokenScreener />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return <AppShell />
}
