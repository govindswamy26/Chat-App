import { useState } from "react";

const Tooltip = ({ label, children, position = "top" }) => {
    const [visible, setVisible] = useState(false);
    const positions = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    };

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            {visible && label && (
                <span
                    role="tooltip"
                    className={`pointer-events-none absolute z-50 whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white bg-[#1e293b] shadow-[var(--shadow-md)] ${positions[position]}`}
                >
                    {label}
                </span>
            )}
        </span>
    );
};

export default Tooltip;
