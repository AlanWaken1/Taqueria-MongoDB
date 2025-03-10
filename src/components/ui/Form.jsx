// src/components/ui/Form.jsx
export const FormInput = ({ label, type, name, value, onChange, placeholder, required = false }) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type || 'text'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-[#334155] border border-[#475569] rounded-md p-2.5 text-white 
                   focus:border-[#38bdf8] focus:ring focus:ring-[#38bdf8]/20 transition-all 
                   placeholder:text-gray-400"
          required={required}
        />
      </div>
    );
  };
  
  export const FormSelect = ({ label, name, value, onChange, options, required = false }) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-[#334155] border border-[#475569] rounded-md p-2.5 text-white 
                   focus:border-[#38bdf8] focus:ring focus:ring-[#38bdf8]/20 transition-all 
                   appearance-none"
          required={required}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export const FormTextarea = ({ label, name, value, onChange, placeholder, rows = 4, required = false }) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-[#334155] border border-[#475569] rounded-md p-2.5 text-white 
                    focus:border-[#38bdf8] focus:ring focus:ring-[#38bdf8]/20 transition-all 
                    resize-none placeholder:text-gray-400"
          required={required}
        />
      </div>
    );
  };
  
  export const FormButton = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
    const variants = {
      primary: 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-white',
      secondary: 'bg-[#334155] hover:bg-[#475569] text-white',
      success: 'bg-[#4ade80] hover:bg-[#22c55e] text-white',
      danger: 'bg-[#f87171] hover:bg-[#ef4444] text-white',
      warning: 'bg-[#fbbf24] hover:bg-[#f59e0b] text-white',
    };
  
    return (
      <button
        type={type}
        onClick={onClick}
        className={`px-4 py-2.5 rounded-md font-medium transition-colors ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export const FormCard = ({ title, children, footer }) => {
    return (
      <div className="bg-[#1e293b] border border-[#334155] rounded-lg shadow-lg overflow-hidden">
        {title && (
          <div className="border-b border-[#334155] px-5 py-3 bg-[#1e293b]">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="border-t border-[#334155] px-5 py-3 bg-[#334155]/30 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    );
  };