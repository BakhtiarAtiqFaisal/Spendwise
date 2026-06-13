import type { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function InputField({ label, error, id, ...props }: InputFieldProps) {
  const inputId = id ?? props.name

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-xl border px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-blue-100 ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default InputField