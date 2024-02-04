import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const auth = getAuth();

    const handlePasswordReset = async (event) => {
        event.preventDefault();
        setError(''); // Reset error state

        try {
            // Send a password reset email to the user's email address
            await sendPasswordResetEmail(auth, email);

            // Inform the user that a password reset email has been sent
            setSuccess(true);

            // Open the modal
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error sending password reset email:', error.message);
            setError('Password reset email could not be sent. Please try again.');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-wrap justify-center items-center h-screen bg-base-200">
            <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title">Forgot Password</h2>
                    <form onSubmit={handlePasswordReset}>
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
                        <div className="form-control mt-4">
                            <button type="submit" className="btn btn-primary">Reset Password</button>
                        </div>
                    </form>
                    {error && (
                        <div role="alert" className="alert alert-error text-center mt-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div role="alert" className="alert alert-success text-center mt-4">
                            Password reset email sent. Please check your email inbox.
                        </div>
                    )}
                </div>
            </div>

            {/* DaisyUI Modal */}
            {isModalOpen && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-box">
                        <p className="text-lg font-semibold">Password Reset Email Sent</p>
                        <p className="text-sm text-gray-700">Password reset email has been sent to your inbox. Please check your email to reset your password.</p>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={closeModal}>OK</button>
                        </div>
                    </div>
                </div>
            )}
            {/* End DaisyUI Modal */}
        </div>
    );
};

export default ForgotPassword;
