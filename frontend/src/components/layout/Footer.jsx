const Footer = () => {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Web Analyzer</h3>
                        <p className="text-sm text-slate-600">
                            AI-powered website analysis platform for competitive intelligence and business insights.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Resources</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Support</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Legal</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
                    © {new Date().getFullYear()} Web Analyzer. Built with FastAPI + React.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
