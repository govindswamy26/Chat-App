export function formatMessageTime(date) {
    const parsedDate = new Date(date);
    if (!date || Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function formatMessageDate(date) {
    const parsedDate = new Date(date);
    if (!date || Number.isNaN(parsedDate.getTime())) return "";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (parsedDate.toDateString() === today.toDateString()) return "Today";
    if (parsedDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

export function isSameDay(a, b) {
    if (!a || !b) return false;
    return new Date(a).toDateString() === new Date(b).toDateString();
}

export function formatDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function passwordStrength(password) {
    if (!password) return { score: 0, label: "Enter a password" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
    return { score, label: labels[Math.min(score, labels.length - 1)] };
}
