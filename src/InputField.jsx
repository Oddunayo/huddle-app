export function InputField({ label, type = "text", name, value, onChange, placeholder, required = false, disabled = false }) {
    return (
        <div>
            {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
            <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 sm:text-sm"
            />
        </div>
    );
}