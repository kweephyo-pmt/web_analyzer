const Badge = ({
    children,
    color = 'blue',
    size = 'md',
    variant = 'solid',
    className = ''
}) => {
    const colors = {
        blue: {
            solid: 'bg-blue-600 text-white',
            outline: 'border-2 border-blue-600 text-blue-600',
            soft: 'bg-blue-100 text-blue-700',
        },
        green: {
            solid: 'bg-emerald-600 text-white',
            outline: 'border-2 border-emerald-600 text-emerald-600',
            soft: 'bg-emerald-100 text-emerald-700',
        },
        yellow: {
            solid: 'bg-amber-600 text-white',
            outline: 'border-2 border-amber-600 text-amber-600',
            soft: 'bg-amber-100 text-amber-700',
        },
        amber: {
            solid: 'bg-amber-600 text-white',
            outline: 'border-2 border-amber-600 text-amber-600',
            soft: 'bg-amber-100 text-amber-700',
        },
        red: {
            solid: 'bg-red-600 text-white',
            outline: 'border-2 border-red-600 text-red-600',
            soft: 'bg-red-100 text-red-700',
        },
        purple: {
            solid: 'bg-purple-600 text-white',
            outline: 'border-2 border-purple-600 text-purple-600',
            soft: 'bg-purple-100 text-purple-700',
        },
        indigo: {
            solid: 'bg-indigo-600 text-white',
            outline: 'border-2 border-indigo-600 text-indigo-600',
            soft: 'bg-indigo-100 text-indigo-700',
        },
        cyan: {
            solid: 'bg-cyan-600 text-white',
            outline: 'border-2 border-cyan-600 text-cyan-600',
            soft: 'bg-cyan-100 text-cyan-700',
        },
        gray: {
            solid: 'bg-slate-600 text-white',
            outline: 'border-2 border-slate-600 text-slate-600',
            soft: 'bg-slate-100 text-slate-700',
        },
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    // Fallback to blue if color is not defined
    const colorClasses = colors[color] || colors.blue;
    const variantClass = colorClasses[variant] || colorClasses.solid;

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variantClass} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
