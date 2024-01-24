import React, {useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {db} from "../firebaseConfig.js";

const Projects = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const projectsRef = collection(db, 'projects');
            const querySnapshot = await getDocs(projectsRef);
            const fetchedProjects = [];
            querySnapshot.forEach((doc) => {
                fetchedProjects.push({ id: doc.id, ...doc.data() });
            });
            setProjects(fetchedProjects);
        };

        fetchProjects();
    }, []);

    return (
        <div className="p-4">
            {/*/!*<h1 className="text-xl font-bold mb-4">Welcome to Planthara</h1>*!/*/}
            {/*/!* You can open the modal using document.getElementById('ID').showModal() method *!/*/}
            {/*<button className="btn btn-primary" onClick={()=>document.getElementById('my_modal_4').showModal()}>Create Project</button>*/}
            {/*<dialog id="my_modal_4" className="modal">*/}
            {/*    <div className="modal-box w-11/12 max-w-5xl">*/}
            {/*        <h3 className="font-bold text-lg">Welcome to your new project !</h3>*/}
            {/*        <p className="py-4">Click the button below to close</p>*/}
            {/*        <div className="modal-action">*/}
            {/*            <form method="dialog">*/}
            {/*                /!* if there is a button, it will close the modal *!/*/}
            {/*                <button className="btn">Close</button>*/}
            {/*            </form>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</dialog>*/}
            {/*{projects.length > 0 ? (*/}
            {/*    projects.map(project => (*/}
            {/*        <div key={project.id} className="card bg-base-200 p-4 mb-4">*/}
            {/*            <h3 className="card-title">{project.name}</h3>*/}
            {/*            /!* Other project details *!/*/}
            {/*        </div>*/}
            {/*    ))*/}
            {/*) : (*/}
            {/*    <div className="text-gray-600">*/}
            {/*        No projects found. Start by creating a new project.*/}
            {/*    </div>*/}
            {/*)}*/}
            <button className="btn btn-primary" onClick={()=>document.getElementById('my_modal_4').showModal()}>Create Project</button>
            <dialog id="my_modal_4" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg">Welcome to your new project !</h3>
                    <p className="py-4">Click the button below to close</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button, it will close the modal */}
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

export default Projects