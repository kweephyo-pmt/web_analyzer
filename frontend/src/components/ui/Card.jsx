import { motion } from 'framer-motion';

const Card = ({
    children,
    variant = 'default',
    className = '',
    hover = true,
    ...props
}) => {
    const variants = {
        default: 'bg-white shadow-lg border border-slate-200',
        glass: 'glass shadow-xl border border-white/20',
        bordered: 'bg-white border-2 border-slate-300 shadow-md',
        elevated: 'bg-white shadow-2xl border border-slate-100',
        prominent: 'bg-white shadow-2xl border-2 border-primary-200 hover:border-primary-300',
    };

    const hoverClass = hover ? 'card-hover' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-6 ${variants[variant]} ${hoverClass} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
