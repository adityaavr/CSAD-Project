// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import "../firebaseConfig";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const auth = getAuth();
    const navigate = useNavigate();


    const handleSubmit = async (event) => {
        event.preventDefault();
        // Logic to handle login
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in user:', userCredential.user);
            navigate('/')
        } catch (error) {
            console.error('Error in login:', error.message);
        }
    };

    return (
        <div className="flex flex-wrap justify-center items-center h-screen bg-base-200">
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
                    </form>
                    <div className="flex justify-between items-center pt-4">
                        <a href="#" className="link link-secondary">Forgot password?</a>
                        <a href="/register" className="link link-secondary">Create account</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
