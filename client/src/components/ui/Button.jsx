import { forwardRef } from "react";

const variants = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    ghost: "btn btn-ghost",
    danger: "btn btn-danger",
};

const Button = forwardRef(({ variant = "primary", className = "", type = "button", children, ...props }, ref) => (
    <button ref={ref} type={type} className={`${variants[variant] || variants.primary} ${className}`} {...props}>
        {children}
    </button>
));

Button.displayName = "Button";

export default Button;
