import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Enhanced Input Component with floating labels and validation
 * 
 * @param {string} label - Input label
 * @param {string} type - Input type
 * @param {string} error - Error message
 * @param {string} success - Success message
 * @param {boolean} required - Required field
 * @param {React.ReactNode} icon - Icon component (from lucide-react)
 * @param {string} helperText - Helper text below input
 * @param {string} className - Additional CSS classes
 */
const Input = ({
  label,
  type = 'text',
  error,
  success,
  required = false,
  icon: Icon,
  helperText,
  className = '',
  value,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const getInputClasses = () => {
    let classes = 'input-modern peer';
    if (error) classes += ' input-error';
    if (success) classes += ' input-success';
    if (Icon) classes += ' pl-12';
    if (type === 'password') classes += ' pr-12';
    return classes;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Icon */}
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none z-10">
          <Icon size={20} />
        </div>
      )}

      {/* Input */}
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`${getInputClasses()} ${className}`}
        placeholder={isFloating ? '' : label}
        {...props}
      />

      {/* Floating Label */}
      {label && (
        <motion.label
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-bold ${
            Icon ? 'left-12' : 'left-4'
          } ${
            isFloating
              ? '-top-2.5 text-xs bg-base3 px-2 text-primary'
              : 'top-1/2 -translate-y-1/2 text-sm text-text/60'
          }`}
          animate={{
            y: isFloating ? 0 : 0,
            scale: isFloating ? 1 : 1,
          }}
        >
          {label}
          {required && <span className="text-red ml-1">*</span>}
        </motion.label>
      )}

      {/* Password Toggle */}
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text/40 hover:text-primary transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}

      {/* Validation Icons */}
      {(error || success) && type !== 'password' && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {error && <AlertCircle size={20} className="text-red" />}
          {success && <CheckCircle2 size={20} className="text-green" />}
        </div>
      )}

      {/* Helper Text / Error / Success Messages */}
      <AnimatePresence mode="wait">
        {(error || success || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-xs font-bold flex items-center gap-1.5"
          >
            {error && (
              <>
                <AlertCircle size={14} className="text-red" />
                <span className="text-red">{error}</span>
              </>
            )}
            {success && !error && (
              <>
                <CheckCircle2 size={14} className="text-green" />
                <span className="text-green">{success}</span>
              </>
            )}
            {helperText && !error && !success && (
              <span className="text-text/60">{helperText}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Textarea Component with similar styling
 */
export const Textarea = ({
  label,
  error,
  success,
  required = false,
  helperText,
  className = '',
  value,
  onChange,
  rows = 4,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  const getTextareaClasses = () => {
    let classes = 'input-modern resize-none';
    if (error) classes += ' input-error';
    if (success) classes += ' input-success';
    return classes;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Textarea */}
      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={getTextareaClasses()}
        placeholder={isFloating ? '' : label}
        rows={rows}
        {...props}
      />

      {/* Floating Label */}
      {label && (
        <motion.label
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-bold ${
            isFloating
              ? '-top-2.5 text-xs bg-base3 px-2 text-primary'
              : 'top-4 text-sm text-text/60'
          }`}
        >
          {label}
          {required && <span className="text-red ml-1">*</span>}
        </motion.label>
      )}

      {/* Helper Text / Error / Success Messages */}
      <AnimatePresence mode="wait">
        {(error || success || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-xs font-bold flex items-center gap-1.5"
          >
            {error && (
              <>
                <AlertCircle size={14} className="text-red" />
                <span className="text-red">{error}</span>
              </>
            )}
            {success && !error && (
              <>
                <CheckCircle2 size={14} className="text-green" />
                <span className="text-green">{success}</span>
              </>
            )}
            {helperText && !error && !success && (
              <span className="text-text/60">{helperText}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
