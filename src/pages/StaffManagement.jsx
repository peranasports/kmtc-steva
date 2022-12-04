import { useState, useEffect } from "react";
import Spinner from "./../components/Spinner";
import EmployeeEditor from "../components/EmployeeEditor";
import { db } from "../firebase.config";
import {
    doc,
    setDoc,
    addDoc,
    collection,
    startAfter,
    getDocs,
    orderBy,
    query,
    where,
    limit,
    serverTimestamp,
} from "firebase/firestore";

// React Toastify
import { toast } from "react-toastify";

function StaffManagement() {
    const [employees, setEmployees] = useState(null)
    const [departments, setDepartments] = useState(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Get reference
                const eRef = collection(db, "employees");
                const q = query(
                    eRef,
                    orderBy("iccid")
                );
                const querySnap = await getDocs(q);
                const empls = [];
                querySnap.forEach((doc) => {
                    return empls.push(doc.data());
                });
                if (empls.length !== 0) {
                    setEmployees(empls)
                }
                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch employees\n" + error.message);
            }
        };

        const fetchDepartments = async () => {
            try {
                // Get reference
                const dRef = collection(db, "departments");
                const q = query(
                    dRef,
                    orderBy("port"),
                    orderBy("name")
                );
                const querySnap = await getDocs(q);
                const deps = [];
                querySnap.forEach((doc) => {
                    return deps.push(doc.data());
                });
                if (deps.length !== 0) {
                    setDepartments(deps)
                }
                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch departments\n" + error.message);
            }
        };
        fetchEmployees()
        fetchDepartments()
    }, []);

    if (loading) {
        return <Spinner />;
    }

    const doEditEmployee = (emp) => {

    }

    if (employees === null || departments === null) {
        return <>
        </>
    }

    const onDepartmentChange = (event, emp) => {
        console.log(emp)
    }

    return (
        <div>
            <div className='grid grid-cols-1 gap-8 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2'>
                {employees.map((emp) => (
                    // <button key={emp.uid} className="w-80 my-1 bg-blue-600 text-white btn btn-md sm:btn-md lg:btn-lg"
                    //     onClick={() => doEditEmployee(emp)}
                    // >
                    //     {emp.name.toUpperCase()}
                    // </button>
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-blue-500">{emp.name.toUpperCase()}</h2>
                            <p>{emp.department}</p>
                            {/* The button to open modal */}
                            <label htmlFor="my-modal-3" className="btn">EDIT</label>

                            {/* Put this part before </body> tag */}
                            <input type="checkbox" id="my-modal-3" className="modal-toggle" />
                            <div className="modal">
                                <div className="modal-box relative">
                                    <label htmlFor="my-modal-3" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                                    <h3 className="text-lg font-bold">{emp.name.toUpperCase()}</h3>
                                    <EmployeeEditor employee={emp} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default StaffManagement