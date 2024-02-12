import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import GoogleLogo from '../assets/google_logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const auth = getAuth();
    const navigate = useNavigate();

    const checkUserExists = async (user) => {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        return docSnap.exists();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Reset error state
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Check if user exists in Firestore
            const userExists = await checkUserExists(userCredential.user);
            if (userExists) {
                navigate('/dashboard');
            } else {
                setError('User does not exist.');
            }
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid credentials. Please check your email and password.');
            } else {
                console.error('Error in login:', error.message);
                setError('Login failed. Please try again.');
            }
        }
    };

    const handleGoogleSignIn = async () => {
        setError(''); // Reset error state
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // Check if user exists in Firestore
            const userExists = await checkUserExists(result.user);
            if (userExists) {
                navigate('/dashboard');
            } else {
                setError('User does not exist.');
            }
        } catch (error) {
            console.error('Error in Google sign-in:', error.message);
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-wrap justify-center items-center h-screen bg-base-200">
            {error && (
                <div role="alert" className="fixed inset-x-0 bottom-0 mb-4 flex justify-center px-4">
                    <div className="alert alert-error text-center p-2 rounded-md text-sm flex items-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title">Login to your account</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="password">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input input-bordered"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">Login</button>
                        </div>
                        <div className="divider">OR</div>
                        <div className="form-control">
                            {/*<img src={GoogleLogo} alt="Google Logo" className="inline-block w-6 h-6 mr-2" />*/}
                            <button className="btn btn-accent" onClick={handleGoogleSignIn}>Login with Google</button>
                        </div>
                    </form>
                    <div className="flex justify-between items-center pt-4">
                        <a href="/forgot-password" className="link link-secondary">Forgot password?</a>
                        <a href="/register" className="link link-secondary">Create account</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

