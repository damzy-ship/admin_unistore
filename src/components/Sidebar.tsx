import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Activity, 
  Users, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Star, 
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    {
      section: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Activity, label: 'Analytics', path: '/analytics' }
      ]
    },
    {
      section: 'Management',
      items: [
        { icon: Users, label: 'Users', path: '/users' },
        { icon: ShoppingCart, label: 'Merchants', path: '/merchants' },
        { icon: Package, label: 'Products', path: '/products' }
      ]
    },
    {
      section: 'Transactions',
      items: [
        { icon: CreditCard, label: 'Invoices', path: '/invoices' }
      ]
    },
    {
      section: 'Content',
      items: [
        { icon: Star, label: 'Reviews', path: '/reviews' }
      ]
    }
  ]

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center border-b">
        <div className={`mr-3 ${collapsed ? 'mr-0' : ''}`}>
          <ShoppingBag className="text-blue-500" size={24} />
        </div>
        {!collapsed && <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-4 mb-6">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h2>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                return (
                  <li key={itemIndex}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveLink(item.path)
                          ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="text-gray-500 mr-3" size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <img 
            className="w-8 h-8 rounded-full" 
            src="https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=200&h=200" 
            alt="Admin" 
          />
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-500 hover:text-gray-700 transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex bg-white shadow-md h-full fixed flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-4">
          <button onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}

export default Sidebar