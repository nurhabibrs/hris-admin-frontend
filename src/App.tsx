import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import AppRouter from './routes/AppRouter'

function App() {
  const initUser = useAuthStore((state) => state.initUser)

  useEffect(() => {
    initUser()
  }, [initUser])

  return <AppRouter />
}

export default App
