import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import AppRouter from './routes/AppRouter'
import { ToastContainer } from 'react-toastify'

function App() {
  const initUser = useAuthStore((state) => state.initUser)

  useEffect(() => {
    initUser()
  }, [initUser])

  return (
    <>
      <ToastContainer />
      <AppRouter />
    </>
  )
}

export default App
