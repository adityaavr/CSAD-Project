// src/components/About.jsx
import React from 'react';
import ThreeDFiberAnimation from "./ThreeDFiberAnimation.jsx";
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="flex flex-col min-h-screen bg-base-200">
            <div className="bg-base-200 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl text-center m-6"
                >
                    <h2 className="text-3xl font-semibold mb-4">About Planthara</h2>
                    <p className="text-gray-600">
                        Planthara is your go-to platform for all things green. Whether you're a seasoned gardener or just starting out, our community and resources are here to help you grow. Discover tips, tricks, and advice on plant care, landscaping, and sustainable gardening. Join us in cultivating a greener world, one plant at a time.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
