import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import assets from "../assets/assets";

const AuthShell = ({ eyebrow = "QUICKCHAT", title, description, children }) => (
    <main className="min-h-screen px-4 py-8 sm:px-6 flex items-center justify-center">
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-lg)]"
        >
            <section className="hidden lg:flex min-h-[640px] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)] via-[var(--color-primary)] to-[#312e81]" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
                <div className="relative flex items-center gap-3">
                    <img src={assets.logo_icon} alt="QuickChat" className="w-11 h-11 drop-shadow-lg" />
                    <span className="font-display text-2xl font-bold text-white tracking-tight">QuickChat</span>
                </div>
                <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium mb-6 backdrop-blur">
                        <Sparkles className="w-3.5 h-3.5" />
                        Premium messaging experience
                    </div>
                    <h2 className="font-display text-4xl leading-tight font-bold max-w-sm text-white">Conversations that feel close.</h2>
                    <p className="mt-5 text-white/80 leading-relaxed max-w-sm text-body">
                        A calm, focused place to share messages, moments, and the everyday details that matter.
                    </p>
                </div>
                <p className="relative text-sm text-white/60">Private by design · Always connected</p>
            </section>

            <section className="glass-panel p-7 sm:p-10 lg:p-12 flex items-center bg-[var(--color-card)]">
                <div className="w-full max-w-md mx-auto">
                    <p className="text-label text-[var(--color-primary)]">{eyebrow}</p>
                    <h1 className="font-display text-3xl font-bold mt-3 text-[var(--color-text)]">{title}</h1>
                    {description && <p className="mt-3 text-[var(--color-muted)] leading-relaxed text-body">{description}</p>}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-8"
                    >
                        {children}
                    </motion.div>
                </div>
            </section>
        </motion.div>
    </main>
);

export default AuthShell;
