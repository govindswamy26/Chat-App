import { forwardRef } from "react";

const Input = forwardRef(({ label, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? `${label.replace(/\s+/g, "-").toLowerCase()}-input` : undefined);
    return (
        <label className="block text-sm font-medium text-[var(--color-text-secondary)]" htmlFor={inputId}>
            {label}
            <input ref={ref} id={inputId} className={`field mt-2 ${className}`} {...props} />
        </label>
    );
});

Input.displayName = "Input";

export default Input;
