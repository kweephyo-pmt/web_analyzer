const Footer = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
                    © {new Date().getFullYear()} Web Analyzer. Developed by Phyo Min Thein.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
