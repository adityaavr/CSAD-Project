// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from '../firebaseConfig.js';
import { doc, setDoc } from 'firebase/firestore';
import '../firebaseConfig.js'
// Import any additional icons or components you might need

const Register = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    });

    const auth = getAuth();
    const navigate = useNavigate();

    const storeUserData = async (firebaseUser) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userData = {
            name: user.name, // From component state
            email: firebaseUser.email // From Firebase Auth user object
        };
        await setDoc(userRef, userData, { merge: true });
        // Additional logic after storing user data, like redirecting
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleEmailPasswordSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            console.log('User created:', userCredential.user);
            await storeUserData(userCredential.user); // Store user data in Firestore
            // Redirect or update UI after successful registration
        } catch (error) {
            console.error('Error in email/password signup:', error.message);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log('Google sign-in result:', result);
            await storeUserData(result.user); // Store user data in Firestore
            // Redirect or update UI after successful Google sign-in
            navigate('/additional-details');
        } catch (error) {
            console.error('Error in Google sign-in:', error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the registration logic here
        console.log('Registering user', user);
    };

    return (
        <div className="flex min-h-screen bg-base-200">
            <div className="flex-1 flex justify-center items-center">
                {/* Add a div with a background image here */}
                <div className="text-center p-10 bg-opacity-60 rounded-lg">
                    <h1 className="text-4xl font-bold mb-4">Welcome to Planthara</h1>
                    <p className="mb-4">Where ideas can coexist.</p>
                </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title">Create a new account</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-control">
                                <label className="label" htmlFor="name">
                                    <span className="label-text">Name</span>
                                </label>
                                <input type="text" id="name" name="name" placeholder="Name" className="input input-bordered" required onChange={handleChange} />
                            </div>
                            <div className="form-control">
                                <label className="label" htmlFor="email">
                                    <span className="label-text">Email</span>
                                </label>
                                <input type="email" id="email" name="email" placeholder="Email" className="input input-bordered" required onChange={handleChange} />
                            </div>
                            <div className="form-control">
                                <label className="label" htmlFor="password">
                                    <span className="label-text">Password</span>
                                </label>
                                <input type="password" id="password" name="password" placeholder="Password" className="input input-bordered" required onChange={handleChange} />
                            </div>
                            <div className="form-control mt-6">
                                <button type="submit" className="btn btn-primary" onClick={handleEmailPasswordSignup}>Sign Up</button>
                            </div>
                            <div className="form-control mt-4">
                                <button className="btn btn-accent btn-outline" onClick={handleGoogleSignup}>Login with Google</button>
                            </div>
                            <div className="form-control mt-6">
                                <Link to="/login" className="link link-primary">
                                    Login to existing account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;


