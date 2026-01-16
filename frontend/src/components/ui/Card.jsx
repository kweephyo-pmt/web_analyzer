import { motion } from 'framer-motion';

const Card = ({
    children,
    variant = 'default',
    className = '',
    hover = true,
    ...props
}) => {
    const variants = {
        default: 'bg-white shadow-md',
        glass: 'glass shadow-lg',
        bordered: 'bg-white border-2 border-slate-200',
        elevated: 'bg-white shadow-xl',
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
