import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [userImageUrl, setUserImageUrl] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnapshot = await getDoc(userDocRef);

                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data();

                        if (userData.profileImageUrl) {
                            setUserImageUrl(userData.profileImageUrl);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error.message);
            } finally {
                // Set loading to false regardless of success or error
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);


    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful.
                navigate('/register');
            })
            .catch((error) => {
                // An error happened.
                console.log(error);
            });
    };

    return (
        <div>
            {loading && (
                // Display loading spinner in the center of the entire page
                <div className="flex items-center justify-center min-h-screen">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}

            {!loading && (
                <div className="flex flex-col">
                    <div className="flex justify-center items-center mt-10" style={{ zIndex: 1 }}>
                        <div className="h-96 flex space-x-6">
                            {/* Carousel components */}
                            <div className="h-96 carousel carousel-vertical rounded-box">
                                <div className="carousel-item h-full bg-primary">
                                    <div className="card w-80 bg-primary shadow-xl">
                                        <figure>
                                            <img src="/images/work_pic.jpg" alt="car!" />
                                        </figure>
                                        <div className="card-body">
                                            <h2 className="card-title">Mobile App Development</h2>
                                            <div className="card-actions justify-end">
                                                <div className="radial-progress bg-gray-900 text-primary-content border-4 border-white" style={{ "--value": 70, color:"yellow" }} role="progressbar">70%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item h-full bg-primary">
                                    <div className="card w-80 bg-primary shadow-xl">
                                        <figure>
                                            <img src="/images/work_pic.jpg" alt="car!" />
                                        </figure>
                                        <div className="card-body">
                                            <h2 className="card-title">CSAD</h2>
                                            <div className="card-actions justify-end">
                                                <div className="radial-progress bg-red-500 text-white border-4 border-white" style={{ "--value": 25 }} role="progressbar">25%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item h-full bg-primary">
                                    <div className="card w-80 bg-primary shadow-xl">
                                        <figure>
                                            <img src="/images/work_pic.jpg" alt="car!" />
                                        </figure>
                                        <div className="card-body">
                                            <h2 className="card-title">Finance Project</h2>
                                            <div className="card-actions justify-end">
                                                <div className="radial-progress bg-yellow-500 text-white border-4 border-white" style={{ "--value": 57 }} role="progressbar">57%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item h-full bg-primary">
                                    <div className="card w-80 bg-primary shadow-xl">
                                        <figure>
                                            <img src="/images/work_pic.jpg" alt="car!" />
                                        </figure>
                                        <div className="card-body">
                                            <h2 className="card-title">MAPP</h2>
                                            <div className="card-actions justify-end">
                                                <div className="radial-progress bg-gray-900 text-primary-content border-4 border-white" style={{ "--value": 83, color:"green" }} role="progressbar">83%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-96 carousel carousel-vertical rounded-box">
                                <div className="carousel-item h-full bg-primary" style={{ textAlign: "center" }}>
                                    <div>
                                        <h4 style={{fontWeight:"bold"}}>Task 1: <span id={"task1_name"}>experiment</span></h4>
                                        <p>Status: <span id={"task1_status"}>Still doing</span></p>
                                        <p>End Date: <span id={"task1_end_date"}>2024-02-01</span></p>
                                    </div>
                                </div>
                                <div className="carousel-item h-full bg-primary" style={{ textAlign: "center" }}>
                                    <div>
                                        <h4 style={{fontWeight:"bold"}}>Task 2: <span id={"task2_name"}>Testing</span></h4>
                                        <p>Status: <span id={"task2_status"}>To Do</span></p>
                                        <p>End Date: <span id={"task2_end_date"}>2024-07-01</span></p>
                                    </div>
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" />
                                </div>
                            </div>
                            <div className="h-96 carousel carousel-vertical rounded-box">
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" />
                                </div>
                                <div className="carousel-item h-full">
                                    <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;



