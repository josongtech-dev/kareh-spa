import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  inputClassName?: string;
  dark?: boolean;
}

const SearchableSelect = ({ value, onChange, options, placeholder, style, className, inputClassName, dark }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} style={{ position: 'relative', ...style }} className={className}>
      <input
        ref={inputRef}
        type="text"
        className={`form-control border-opacity-10 bg-transparent${inputClassName ? ` ${inputClassName}` : ''}`}
        value={open ? search : (selected?.label || '')}
        onFocus={() => setOpen(true)}
        onChange={e => { setSearch(e.target.value); setOpen(true); }}
        placeholder={placeholder}
        style={{ cursor: 'pointer', caretColor: open ? 'auto' : 'transparent', color: dark ? '#fff' : undefined }}
        readOnly={false}
        autoComplete="off"
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1050,
            maxHeight: 220,
            overflowY: 'auto',
            background: dark ? 'rgba(20,20,25,0.98)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(128, 128, 128, 0.15)',
            borderRadius: '0.5rem',
            marginTop: 2,
            boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: dark ? '#999' : '#999' }}>No matches</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: dark ? (opt.value === value ? '#b366ff' : '#fff') : (opt.value === value ? '#6a0dad' : 'inherit'),
                  background: opt.value === value ? (dark ? 'rgba(106, 13, 173, 0.25)' : 'rgba(106, 13, 173, 0.06)') : 'transparent',
                  fontWeight: opt.value === value ? 600 : 400,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = opt.value === value ? (dark ? 'rgba(106, 13, 173, 0.25)' : 'rgba(106, 13, 173, 0.06)') : 'transparent'; }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
