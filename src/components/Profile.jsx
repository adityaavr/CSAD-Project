import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AiFillCamera, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai'; // Importing icons

const Profile = () => {
    const [editMode, setEditMode] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        username: '',
        email: '',
        profileImageUrl: '',
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                } else {
                    console.log("No such document!");
                }
            }
        };

        fetchUserData();
    }, [auth]);

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setSelectedImage(null);
    };

    const handleSave = async () => {
        if (selectedImage) {
            const imageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
            await uploadBytes(imageRef, selectedImage);
            const newImageUrl = await getDownloadURL(imageRef);
            setUserData({ ...userData, profileImageUrl: newImageUrl });
        }

        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            ...userData,
            profileImageUrl: userData.profileImageUrl,
        });
        setEditMode(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    if (!userData) {
        return <div>Loading user data...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                <div className="flex flex-col items-center text-center">
                    <div className="relative inline-block">
                        <div className="bg-gray-200 p-1 rounded-full">
                            <img
                                src={userData.profileImageUrl || 'default-profile.png'}
                                alt="Profile"
                                className="rounded-full h-32 w-32 object-cover"
                            />
                        </div>
                        {editMode && (
                            <>
                                <label htmlFor="imageInput" className="absolute bottom-0 right-2 cursor-pointer bg-black p-1 rounded-full text-white">
                                    <AiFillCamera size={24} />
                                </label>
                                <input
                                    id="imageInput"
                                    type="file"
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </>
                        )}
                    </div>
                    <h1 className="mt-4 font-bold text-xl">{userData.name}</h1>
                    <h2 className="text-gray-600">{userData.username}</h2>
                    <p className="mt-2">{userData.email}</p>
                </div>
                <div className="mt-6">
                    {editMode ? (
                        <div className="flex justify-center gap-4">
                            <button className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300" onClick={handleSave}>
                                <AiOutlineCheck className="mr-2" /> Save
                            </button>
                            <button className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300" onClick={handleCancel}>
                                <AiOutlineClose className="mr-2" /> Cancel
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary w-full" onClick={handleEdit}>Edit Profile</button>
                    )}
                </div>
                {editMode && (
                    <div className="mt-4">
                        <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className="input input-bordered w-full mb-2"
                        />
                        <input
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="input input-bordered w-full mb-2"
                        />
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="input input-bordered w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

