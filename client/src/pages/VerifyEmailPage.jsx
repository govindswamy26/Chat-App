import { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";

const VerifyEmailPage = () => {
    const { axios } = useContext(AuthContext);
    const [params] = useSearchParams();
    const hasStartedVerification = useRef(false);
    const [status, setStatus] = useState({ loading: true, success: false, message: "Securing your account..." });

    useEffect(() => {
        if (hasStartedVerification.current) return;
        hasStartedVerification.current = true;

        const verify = async () => {
            const email = params.get("email");
            const token = params.get("token");
            if (!email || !token) {
                return setStatus({ loading: false, success: false, message: "This verification link is invalid." });
            }
            try {
                const { data } = await axios.post("/api/auth/verify-email", { email, token });
                setStatus({ loading: false, success: data.success, message: data.message });
            } catch {
                setStatus({ loading: false, success: false, message: "We couldn't verify your email. Please try again." });
            }
        };

        verify();
    }, [axios, params]);

    const icon = status.loading ? (
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-primary)]" />
    ) : status.success ? (
        <CheckCircle2 className="w-7 h-7 text-[var(--color-success)]" />
    ) : (
        <AlertCircle className="w-7 h-7 text-[var(--color-error)]" />
    );

    const iconBg = status.loading
        ? "bg-[var(--color-primary)]/12"
        : status.success
          ? "bg-[var(--color-success)]/12"
          : "bg-[var(--color-error)]/12";

    return (
        <AuthShell
            eyebrow="ACCOUNT SECURITY"
            title={status.loading ? "Verifying your email" : status.success ? "You're all set" : "Verification failed"}
            description={status.message}
        >
            <div className="card p-8 text-center space-y-6">
                <div className={`mx-auto w-16 h-16 rounded-2xl grid place-items-center ${iconBg}`}>{icon}</div>
                {!status.loading && (
                    <Link to="/login" className="block">
                        <Button className="w-full py-3">Go to sign in</Button>
                    </Link>
                )}
            </div>
        </AuthShell>
    );
};

export default VerifyEmailPage;
