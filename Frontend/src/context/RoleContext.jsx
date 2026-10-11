import { createContext, useContext, useMemo, useState } from 'react'

const RoleContext = createContext(null)
const STORAGE_KEY = 'careline_role'

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'admin',
  )

  const setRole = (next) => {
    localStorage.setItem(STORAGE_KEY, next)
    setRoleState(next)
  }

  const value = useMemo(() => ({ role, setRole }), [role])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
