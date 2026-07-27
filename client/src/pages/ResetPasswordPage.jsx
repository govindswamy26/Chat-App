import { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Lock } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { passwordStrength } from "../lib/utils";

const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-600"];

const ResetPasswordPage = () => {
    const { axios } = useContext(AuthContext);
    const [params] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState({ success: false, message: "" });
    const [submitting, setSubmitting] = useState(false);

    const strength = useMemo(() => passwordStrength(password), [password]);

    const submit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setStatus({ success: false, message: "The passwords do not match." });
        const email = params.get("email");
        const token = params.get("token");
        if (!email || !token) return setStatus({ success: false, message: "This reset link is invalid." });
        setSubmitting(true);
        try {
            const { data } = await axios.post("/api/auth/reset-password", { email, token, password });
            setStatus({ success: data.success, message: data.message });
        } catch {
            setStatus({ success: false, message: "We couldn't update your password. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            eyebrow="ACCOUNT SECURITY"
            title={status.success ? "Password updated" : "Choose a new password"}
            description={status.success ? status.message : "Use at least 6 characters and keep it unique to QuickChat."}
        >
            {status.success ? (
                <div className="card p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl grid place-items-center bg-[var(--color-success)]/12">
                        <CheckCircle2 className="w-7 h-7 text-[var(--color-success)]" />
                    </div>
                    <Link to="/login" className="block">
                        <Button className="w-full py-3">Go to sign in</Button>
                    </Link>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Input label="New password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required placeholder="Enter new password" />
                        {password && (
                            <div className="mt-3">
                                <div className="flex gap-1">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <span
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${i < strength.score ? strengthColors[strength.score] : "bg-[var(--color-border-strong)]"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--color-muted)] mt-1.5">{strength.label}</p>
                            </div>
                        )}
                    </div>
                    <Input label="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" minLength={6} required placeholder="Repeat new password" />
                    {status.message && <p className="text-sm text-[var(--color-error)]">{status.message}</p>}
                    <Button type="submit" disabled={submitting} className="w-full py-3 gap-2">
                        <Lock className="w-4 h-4" />
                        {submitting ? "Updating password..." : "Update password"}
                    </Button>
                </form>
            )}
        </AuthShell>
    );
};

export default ResetPasswordPage;
