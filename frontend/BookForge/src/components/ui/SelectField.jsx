import React from 'react'
import { ChevronDown } from 'lucide-react'

const SelectField = ({ icon: Icon, label, name, options, ...props }) => {
  return (
    <div className="space-y-4 group">
      <label htmlFor={name} className="block text-[10px] tracking-[0.4em] text-muted uppercase">
        {label}
      </label>
      <div className="relative border-b border-border focus-within:border-primary transition-colors pb-2 flex items-center">
        {Icon && (
          <div className="absolute left-0 pointer-events-none">
            <Icon className="w-4 h-4 text-muted" />
          </div>
        )}
        <select
          id={name}
          name={name}
          {...props}
          className={`w-full bg-transparent text-lg font-serif appearance-none outline-none cursor-pointer ${Icon ? "pl-8" : ""}`}
        >
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option} className="bg-white text-primary">
              {option.label || option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none ml-2">
          <ChevronDown size={14} className="text-muted" />
        </div>
      </div>
    </div>
  )
}

export default SelectField