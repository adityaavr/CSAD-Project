import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebaseConfig.js'; // Import Firebase storage
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AdditionalDetails = () => {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const uploadImage = async () => {
        if (image) {
            const imageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
            await uploadBytes(imageRef, image);
            return getDownloadURL(imageRef);
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const uploadedImageUrl = await uploadImage();
        const userData = { name, profileImageUrl: uploadedImageUrl };
        const userRef = doc(db, 'users', auth.currentUser.uid);

        await setDoc(userRef, userData, { merge: true });
        navigate('/dashboard') // Redirect to another page after updating
    };

    return (
        <div className="flex flex-wrap justify-center items-center h-screen bg-base-200">
            <div className="card w-full max-w-md mx-auto shadow-2xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title text-center">Additional Details</h2>
                    {imageUrl && (
                        <div className="flex justify-center mt-4">
                            <div className="avatar">
                                <div className="w-24 mask mask-squircle">
                                    <img src={imageUrl} alt="Profile Preview" />
                                </div>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label" htmlFor="name">
                                <span className="label-text">What should we call you?</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Your Name"
                                className="input input-bordered"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mt-4">
                            <label className="label" htmlFor="profileImage">
                                <span className="label-text">Profile Image</span>
                            </label>
                            <input
                                type="file"
                                id="profileImage"
                                className="file-input file-input-bordered w-full max-w-xs"
                                name="profileImage"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdditionalDetails;


