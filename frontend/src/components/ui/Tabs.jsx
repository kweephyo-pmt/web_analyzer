import { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, defaultTab = 0, onChange, layoutId = 'activeTab' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabClick = (index) => {
        setActiveTab(index);
        if (onChange) onChange(index);
    };

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabClick(index)}
                        className={`
              relative w-full rounded-lg py-2.5 px-4 text-sm font-medium
              transition-all duration-200 focus:outline-none
              ${activeTab === index
                                ? 'text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }
            `}
                    >
                        {activeTab === index && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg shadow-md"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
            >
                {tabs[activeTab].content}
            </motion.div>
        </div>
    );
};

export default Tabs;
