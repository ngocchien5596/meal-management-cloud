'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CurrencyInputProps {
    name?: string;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (rawValue: string) => void;
    placeholder?: string;
    required?: boolean;
    autoFocus?: boolean;
    maxLength?: number;
    className?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
}

function formatCurrency(val: string): string {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('vi-VN');
}

function parseRaw(val: string): string {
    return val.replace(/\D/g, '');
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ name, value, defaultValue, onChange, placeholder = '0', required, autoFocus, maxLength, className, label, error, disabled }, ref) => {
        const initialRaw = parseRaw(String(value ?? defaultValue ?? ''));
        const [rawValue, setRawValue] = React.useState(initialRaw);
        const [displayValue, setDisplayValue] = React.useState(formatCurrency(initialRaw));

        React.useEffect(() => {
            if (value !== undefined) {
                const raw = parseRaw(String(value));
                setRawValue(raw);
                setDisplayValue(formatCurrency(raw));
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = parseRaw(e.target.value);
            // If maxLength is set, don't allow typing beyond it
            if (maxLength && raw.length > maxLength) return;

            const formatted = formatCurrency(raw);

            setRawValue(raw);
            setDisplayValue(formatted);
            onChange?.(raw);
        };

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-black text-slate-700 ml-1 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type="text"
                        inputMode="numeric"
                        value={displayValue}
                        onChange={handleChange}
                        placeholder={placeholder}
                        required={required}
                        autoFocus={autoFocus}
                        maxLength={maxLength}
                        disabled={disabled}
                        className={cn(
                            'flex h-10 w-full rounded-xl border border-vtborder bg-white px-3 py-2 pr-10 text-sm font-bold ring-offset-white placeholder:text-vttext-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 tabular-nums tracking-wide',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-vttext-muted font-bold text-sm">
                        ₫
                    </div>
                    {name && (
                        <input
                            type="hidden"
                            name={name}
                            value={rawValue}
                        />
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
