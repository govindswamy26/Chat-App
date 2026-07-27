import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, onClear, placeholder = "Search...", className = "" }) => (
    <div className={`search-bar ${className}`}>
        <Search className="search-icon" aria-hidden />
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="field"
            type="search"
            aria-label={placeholder}
        />
        {value && onClear && (
            <button type="button" className="search-clear" onClick={onClear} aria-label="Clear search">
                ×
            </button>
        )}
    </div>
);

export default SearchBar;
