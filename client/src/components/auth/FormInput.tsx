interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  borderColor?: string;
  focusColor?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  toggleShowPassword?: () => void;
  error?: string;
  submitted: boolean;
  autoComplete?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  borderColor = "border-indigo-200",
  focusColor = "focus:border-indigo-500",
  value,
  onChange,
  showPassword = false,
  toggleShowPassword,
  error,
  submitted,
  autoComplete,
}) => {
  const errorClass =
    "block min-h-[1rem] text-xs mt-1 transition-all duration-200";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {type === "password" ? (
        <div className="relative">
          <input
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-transparent px-3 py-2 border-b-2 ${borderColor} ${focusColor}
                       outline-none transition-colors duration-300 placeholder:text-gray-400 pr-16`}
            autoComplete={autoComplete || "current-password"}
          />
          {toggleShowPassword && (
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium
                         text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3 py-2 border-b-2 ${borderColor} ${focusColor}
                     outline-none transition-colors duration-300 placeholder:text-gray-400`}
          autoComplete={autoComplete}
        />
      )}
      <span
        className={`${errorClass} ${
          submitted && error ? "text-red-500" : "text-transparent"
        }`}
      >
        {error || "\u200b"}
      </span>
    </div>
  );
};