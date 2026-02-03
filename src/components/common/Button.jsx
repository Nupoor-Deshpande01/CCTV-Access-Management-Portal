import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    block = false,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? '' : `btn-${variant}`;
    const blockClass = block ? 'btn-block' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${blockClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
