// src/components/Register.jsx
import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from '../firebaseConfig.js';
import { doc, setDoc } from 'firebase/firestore';
import '../firebaseConfig.js'
import ThreeDFiberAnimation from "./ThreeDFiberAnimation.jsx";
import { motion } from 'framer-motion';
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
            navigate('/additional-details');
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

    const carouselRef = useRef(null);

    useEffect(() => {
        const carousel = carouselRef.current;

        let currentIndex = 0;
        const intervalId = setInterval(() => {
            // Move to the next item
            currentIndex = (currentIndex + 1) % carousel.children.length;
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 3000); // Change slide every 3 seconds

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const CarouselItem = ({ title, description }) => {
        return (
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="carousel-item p-4 rounded-lg shadow-md bg-white"
            >
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </motion.div>
        );
    };



    return (
        <div className="flex min-h-screen bg-base-200">
            {/* Animation Section Above */}
            <div className="fixed top-0 left-0 w-full h-full z-0">
                <ThreeDFiberAnimation />
            </div>
            <div className="flex-1 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.5 }}
                    className=" w-full max-w-sm p-4"
                >
                    <h2 className="text-2xl font-semibold mb-4">Welcome to Planthara</h2>
                    <p className="text-gray-600">
                        Your centralized planning hub for all projects and tasks. Never miss any deadlines again and collaborate seamlessly with your fellow teammates.
                    </p>
                </motion.div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.5 }}
                    className="card w-full max-w-sm shadow-2xl bg-base-100">
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
                </motion.div>
            </div>
        </div>
    );
};

export default Register;


