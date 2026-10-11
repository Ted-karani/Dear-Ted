import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { loadData, saveData } from '../utils/storage'

const AppDataContext = createContext(null)

// Wrap the app in this once. Any page can then read and change the saved data.
export function AppDataProvider({ children }) {
  const [data, setData] = useState(loadData)
  const [saveFailed, setSaveFailed] = useState(false)
  const firstRun = useRef(true)

  // Every time data changes, save it. We skip the very first run so we never overwrite old data on load.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    setSaveFailed(!saveData(data))
  }, [data])

  // update({ ... }) merges changes. update(prev => newData) gives full control.
  const update = useCallback((change) => {
    setData((prev) => (typeof change === 'function' ? change(prev) : { ...prev, ...change }))
  }, [])

  return <AppDataContext.Provider value={{ data, update, saveFailed }}>{children}</AppDataContext.Provider>
}

export const useAppData = () => useContext(AppDataContext)
