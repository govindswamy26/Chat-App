import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Bell,
    Camera,
    Globe,
    Lock,
    Moon,
    Palette,
    Shield,
    Sun,
    User,
} from "lucide-react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";

const SettingCard = ({ icon: Icon, title, description, children }) => (
    <div className="card p-5">
        <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-[var(--color-primary)]/12 text-[var(--color-primary)] shrink-0">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">{description}</p>
            </div>
        </div>
        {children}
    </div>
);

const ProfilePage = () => {
    const { authUser, updateProfile } = useContext(AuthContext);
    const { friendData } = useContext(ChatContext);
    const { theme, setTheme } = useTheme();
    const [selectedImg, setSelectedImg] = useState(null);
    const [name, setName] = useState(authUser.fullName);
    const [bio, setBio] = useState(authUser.bio);
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        if (!selectedImg) {
            updateProfile({ fullName: name, bio });
            navigate("/");
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            await updateProfile({ profilePic: reader.result, fullName: name, bio });
            navigate("/");
        };
        reader.readAsDataURL(selectedImg);
    };

    const preview = selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon;
    const friendCount = friendData.friendCount || authUser?.friends?.length || 0;

    return (
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to messages
                </button>

                <div className="card overflow-hidden shadow-[var(--shadow-lg)]">
                    <div className="h-36 sm:h-44 bg-gradient-to-br from-[var(--color-secondary)] via-[var(--color-primary)] to-[#312e81] relative">
                        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,white,transparent_50%)]" />
                    </div>

                    <div className="px-6 sm:px-10 pb-10 -mt-14 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                            <div className="relative shrink-0">
                                <Avatar src={preview} alt={name} size="xl" className="ring-4 ring-[var(--color-card)]" />
                                <label
                                    htmlFor="avatar"
                                    className="absolute -right-1 -bottom-1 w-10 h-10 grid place-items-center rounded-xl bg-[var(--color-primary)] text-white cursor-pointer shadow-[var(--shadow-md)] hover:scale-105 transition-transform"
                                    aria-label="Change profile photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </label>
                                <input id="avatar" onChange={(e) => setSelectedImg(e.target.files[0])} accept="image/png,image/jpeg" type="file" hidden />
                            </div>
                            <div className="flex-1 min-w-0 pt-2">
                                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text)]">{name || "Your profile"}</h1>
                                <p className="text-[var(--color-muted)] mt-1">{bio || "Make your profile feel like you."}</p>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-elevated)] text-sm">
                                        <User className="w-4 h-4 text-[var(--color-primary)]" />
                                        <strong>{friendCount}</strong> friends
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-10 grid lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <SettingCard icon={User} title="Account" description="Update how others see you">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-4">
                                        Display name
                                        <input value={name} onChange={(e) => setName(e.target.value)} required className="field mt-2" placeholder="Your name" />
                                    </label>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                                        Bio
                                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required rows={4} className="field mt-2 resize-none" placeholder="Write a short introduction" />
                                    </label>
                                </SettingCard>

                                <Button type="submit" className="w-full py-3">
                                    Save changes
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <SettingCard icon={Palette} title="Appearance" description="Customize how QuickChat looks">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setTheme("light")}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                theme === "light"
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                                            }`}
                                        >
                                            <Sun className="w-5 h-5" />
                                            Light
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTheme("dark")}
                                            className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                theme === "dark"
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                                            }`}
                                        >
                                            <Moon className="w-5 h-5" />
                                            Dark
                                        </button>
                                    </div>
                                </SettingCard>

                                <SettingCard icon={Bell} title="Notifications" description="Manage how you stay updated">
                                    <p className="text-sm text-[var(--color-muted)]">Browser notifications for new messages will be available in a future update.</p>
                                </SettingCard>

                                <SettingCard icon={Shield} title="Privacy" description="Control your visibility and data">
                                    <p className="text-sm text-[var(--color-muted)]">Your conversations are private to you and your friends. End-to-end encryption is planned for a future release.</p>
                                </SettingCard>

                                <SettingCard icon={Globe} title="Language & accessibility" description="Regional and accessibility preferences">
                                    <p className="text-sm text-[var(--color-muted)]">English (US) · High contrast mode and screen reader labels are enabled across the app.</p>
                                </SettingCard>

                                <SettingCard icon={Lock} title="Security" description="Keep your account safe">
                                    <p className="text-sm text-[var(--color-muted)]">Use Forgot password on the sign-in page to reset your password via email.</p>
                                </SettingCard>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
