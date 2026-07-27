import Tooltip from "../ui/Tooltip";

const CallActionButton = ({ icon: Icon, label, onClick, active }) => (
    <Tooltip label={label}>
        <button
            type="button"
            onClick={onClick}
            className={`call-btn ${active ? "is-active" : ""}`}
            aria-label={label}
        >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>
    </Tooltip>
);

export default CallActionButton;
