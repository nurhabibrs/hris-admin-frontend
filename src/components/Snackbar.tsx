import { useEffect } from "react";

type SnackbarType = "error" | "success";

const Snackbar = ({ message, type, onClose }: { message: string; type: SnackbarType; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${type === "error" ? "bg-red-600" : "bg-green-600"
            }`}>
            <span>{message}</span>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
    );
}

export default Snackbar;