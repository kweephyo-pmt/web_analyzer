import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

const GoogleAuth = () => {
    const { user, login, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            await login(credentialResponse.credential);
            // Redirect to dashboard after successful login
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (user) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-4"
            >
                <div className="hidden sm:flex items-center space-x-3">
                    {user.picture && (
                        <img
                            src={user.picture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full ring-2 ring-primary-500 ring-offset-2"
                        />
                    )}
                    <div className="text-sm">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                >
                    Sign Out
                </Button>
            </motion.div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleAuth;
