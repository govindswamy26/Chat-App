import { AlertTriangle } from "lucide-react";
import { Component } from "react";
import Button from "./ui/Button";

class ChatPanelBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidUpdate(previousProps) {
        if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
            this.setState({ error: null });
        }
    }

    render() {
        if (this.state.error) {
            return (
                <section className="min-h-0 flex items-center justify-center p-8 text-center bg-[var(--color-bg-elevated)]/40">
                    <div className="card max-w-sm p-8">
                        <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center bg-[var(--color-error)]/12 text-[var(--color-error)] mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <p className="font-semibold text-[var(--color-text)]">This conversation could not be displayed.</p>
                        <p className="text-sm text-[var(--color-muted)] mt-2">Choose another conversation, then try this one again.</p>
                        {import.meta.env.DEV && (
                            <p className="text-xs text-[var(--color-muted)] mt-4 break-words font-mono">{this.state.error.message}</p>
                        )}
                        <Button variant="secondary" className="mt-6 w-full" onClick={() => this.setState({ error: null })}>
                            Try again
                        </Button>
                    </div>
                </section>
            );
        }

        return this.props.children;
    }
}

export default ChatPanelBoundary;
