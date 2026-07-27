import { useContext, useMemo, useState } from "react";
import { ArrowLeft, Mail, User } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import AuthShell from "../components/AuthShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { passwordStrength } from "../lib/utils";

const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-600"];

const LoginPage = () => {
    const [mode, setMode] = useState("signup");
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [verificationSent, setVerificationSent] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const { login, requestPasswordReset } = useContext(AuthContext);

    const strength = useMemo(() => passwordStrength(password), [password]);

    const goToLogin = () => {
        setMode("login");
        setStep(1);
        setVerificationSent(false);
        setForgotPassword(false);
        setResetEmailSent(false);
    };

    const submitAuth = async (event) => {
        event.preventDefault();
        if (mode === "signup" && step === 1) return setStep(2);
        const result = await login(mode === "signup" ? "signup" : "login", { fullName, email, password, bio });
        if (mode === "signup" && result?.success) setVerificationSent(true);
    };

    const submitForgot = async (event) => {
        event.preventDefault();
        const result = await requestPasswordReset(email);
        if (result?.success) setResetEmailSent(true);
    };

    const title = forgotPassword
        ? "Reset your password"
        : verificationSent
          ? "Check your inbox"
          : mode === "signup"
            ? step === 1
                ? "Create your account"
                : "Tell us about yourself"
            : "Welcome back";

    const description = forgotPassword
        ? "We'll send a secure password reset link to your email."
        : verificationSent
          ? `We sent a verification link to ${email}.`
          : mode === "signup"
            ? "Start connecting with the people who matter."
            : "Sign in to continue your conversations.";

    const PasswordField = ({ showStrength }) => (
        <div>
            <Input
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                minLength={6}
                required
                placeholder="At least 6 characters"
            />
            {showStrength && password && (
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
    );

    return (
        <AuthShell title={title} description={description}>
            {forgotPassword ? (
                resetEmailSent ? (
                    <div className="space-y-5">
                        <div className="card p-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            If an account exists for this email, a reset link is on its way. It expires in 15 minutes.
                        </div>
                        <Button className="w-full py-3" onClick={goToLogin}>
                            Back to sign in
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={submitForgot} className="space-y-5">
                        <Input label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
                        <Button type="submit" className="w-full py-3 gap-2">
                            <Mail className="w-4 h-4" />
                            Send reset link
                        </Button>
                        <button type="button" onClick={goToLogin} className="w-full text-sm text-[var(--color-primary)] hover:underline">
                            Back to sign in
                        </button>
                    </form>
                )
            ) : verificationSent ? (
                <div className="space-y-5">
                    <div className="card p-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        Open the link in your email to verify your address. Your account will be created after verification.
                    </div>
                    <Button className="w-full py-3" onClick={goToLogin}>
                        Continue to sign in
                    </Button>
                </div>
            ) : (
                <form onSubmit={submitAuth} className="space-y-5">
                    {mode === "signup" && step === 1 && (
                        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your name" />
                    )}
                    {step === 1 && (
                        <>
                            <Input label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
                            <PasswordField showStrength={mode === "signup"} />
                        </>
                    )}
                    {mode === "signup" && step === 2 && (
                        <>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                A short bio
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="Tell your contacts a little about you"
                                    className="field mt-2 resize-none"
                                />
                            </label>
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        </>
                    )}
                    <Button type="submit" className="w-full py-3 gap-2">
                        {mode === "signup" ? (
                            step === 1 ? (
                                "Continue"
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send verification link
                                </>
                            )
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                    {mode === "login" ? (
                        <div className="flex justify-between text-sm">
                            <button type="button" onClick={() => setForgotPassword(true)} className="text-[var(--color-primary)] hover:underline">
                                Forgot password?
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("signup");
                                    setStep(1);
                                }}
                                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                            >
                                Create an account
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--color-muted)] text-center">
                            Already have an account?{" "}
                            <button type="button" onClick={goToLogin} className="text-[var(--color-primary)] hover:underline">
                                Sign in
                            </button>
                        </p>
                    )}
                </form>
            )}
        </AuthShell>
    );
};

export default LoginPage;
