import React from 'react'

const InputField = ({ icon: Icon, label, name, ...props }) => {
  return (
    <div className='space-y-4 group'>
      <label htmlFor={name} className='block text-[10px] tracking-[0.4em] text-muted uppercase'>
        {label}
      </label>
      <div className='relative border-b border-border focus-within:border-primary transition-colors pb-2'>
        <input
          id={name}
          name={name}
          {...props}
          className={`w-full bg-transparent text-lg font-serif placeholder:text-border outline-none transition-all ${Icon ? "pl-8" : ""}`}
        />
        {Icon && (
          <div className='absolute inset-y-0 left-0 flex items-center pointer-events-none'>
            <Icon className='w-4 h-4 text-muted' />
          </div>
        )}
      </div>
    </div>
  )
}

export default InputField