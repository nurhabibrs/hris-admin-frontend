import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import Snackbar from "../components/Snackbar"
import ReactLogo from "../assets/react.svg"

export default function LoginPage() {
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [snackbar, setSnackbar] = useState<{ message: string; type: "error" | "success" } | null>(null)

    const closeSnackbar = useCallback(() => {
        setError(null)
        setSnackbar(null)
    }, [])

    const handleLogin = async () => {
        try {
            await login(email, password)
            navigate("/")
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Login gagal"
            setError(message)
            setSnackbar({ message, type: "error" })
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            {error && <Snackbar message={error} type="error" onClose={closeSnackbar} />}
            {snackbar && <Snackbar message={snackbar.message} type={snackbar.type} onClose={closeSnackbar} />}
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-200 rounded-xl mb-4">
                        <img src={ReactLogo} alt="HRIS Logo" className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to {import.meta.env.VITE_APP_NAME}!</h1>
                    <p className="text-slate-600">Sign in with your {import.meta.env.VITE_APP_NAME} email to continue</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-200">
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <input
                        className="border w-full p-2 mb-4 rounded"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="relative">
                        <input
                            className="border w-full p-2 mb-4 rounded"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 top-2 text-slate-600 hover:text-slate-900"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="ml-3 text-base font-semibold text-slate-700">{'Login'}</span>
                    </button>
                    </form>
                </div>
            </div>
        </div>
    )
}