import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Layout from '@/components/Layout'
import { RoleProvider } from '@/context/RoleContext'
import Availability from '@/pages/Availability'
import Book from '@/pages/Book'
import Doctors from '@/pages/Doctors'
import Home from '@/pages/Home'
import Patients from '@/pages/Patients'

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="availability" element={<Availability />} />
            <Route path="book" element={<Book />} />
            <Route path="patients" element={<Patients />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </RoleProvider>
  )
}
