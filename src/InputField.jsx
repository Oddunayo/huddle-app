export function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1 text-left">
      {label && (
        <label className="text-xs font-semibold text-gray-600 block">
          {label}
        </label>
      )}
      <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#5C54E5] focus:ring-1 focus:ring-[#5C54E5] outline-none transition disabled:bg-gray-50 ${
            icon ? 'pr-10' : ''
          } ${className}`}
          {...props}
      />
      {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        </div>
    </div>
  );
}
