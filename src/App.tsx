import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Users from './pages/Users'
import Merchants from './pages/Merchants'
import Products from './pages/Products'
import Invoices from './pages/Invoices'
import Reviews from './pages/Reviews'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/users" element={<Users />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/products" element={<Products />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App