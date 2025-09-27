import React from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 lg:ml-0">
      <Sidebar />
      <div className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  )
}

export default Layout