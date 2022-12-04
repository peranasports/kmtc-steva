import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStatus } from "./../hooks/useAuthStatus";
import StaffManagement from "./StaffManagement";
import Spinner from "./../components/Spinner";
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

function GMPage() {
    const navigate = useNavigate()
    const [regions, setRegions] = useState(null)
    const [departments, setDepartments] = useState(null)
    const [loading, setLoading] = useState(true);
    const { loggedIn, currentUser, employee, checkingStatus } = useAuthStatus();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Get reference
                const dRef = collection(db, "departments");

                // Create a query
                const q = query(
                    dRef,
                    where("id", ">", 10),
                    orderBy("id")
                );

                // Execute query
                const querySnap = await getDocs(q);

                const deps = [];

                querySnap.forEach((doc) => {
                    var dep = doc.data()
                    dep.uid = doc.id
                    return deps.push(dep);
                });

                const regs = [{ name: 'South', departments: [] }, { name: 'North', departments: [] }];

                for (var nc = 0; nc < deps.length; nc++) {
                    var dep = deps[nc]
                    if (dep.port === 'SGN') {
                        dep.region = 0
                        regs[0].departments.push(dep)
                    }
                    else {
                        dep.region = 1
                        regs[1].departments.push(dep)
                    }
                }
                setRegions(regs)
                setDepartments(deps)

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch departments");
            }
        };

        fetchDepartments()
    }, []);

    const doDepartment = (dep) => {
        navigate('/departmenteval', { state: { department: dep } })
    }

    const doStaff = () =>
    {
        navigate('/staffmanagement')
    }

    const doAllEvaluations = () =>
    {
        navigate('/allevals')
    }

    const doForEvaluation = () =>
    {
        navigate(`/employee/${employee.uid}`)
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <div className="flex justify-between">
                <div className="mt-2">
                    <button className="btn btn-sm bg-blue-800 text-white" onClick={() => doStaff()}>STAFF</button>
                    <button className="btn btn-sm bg-blue-800 text-white" onClick={() => doAllEvaluations()}>ALL EVALUATIONS</button>
                    <button className="btn btn-sm bg-blue-800 text-white" onClick={() => doForEvaluation()}>FOR EVALUATION</button>
                </div>
            </div>

            <div className=''>
                {regions.map((region) => (
                    <div className="text-xl"
                        key={region.name}>
                        <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                            <input type="checkbox" defaultChecked='true' />
                            <div className="collapse-title text-md font-medium">
                                {region.name.toUpperCase()}
                            </div>
                            <div className="collapse-content">
                                <div className='grid grid-cols-1 gap-8 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2'>
                                    {region.departments.map((dep) => (
                                        <button key={dep.uid} className="w-80 my-1 bg-blue-600 text-white btn btn-md sm:btn-md lg:btn-lg"
                                            onClick={() => doDepartment(dep)}
                                        >
                                            {dep.name.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                {/* <div className="flex flex-col">
                                    {region.departments.map((dep) => (
                                        <button key={dep.uid} className="w-80 my-1 bg-blue-800 text-white btn btn-md sm:btn-md lg:btn-lg"
                                            onClick={() => doDepartment(dep)}
                                        >
                                            {dep.name.toUpperCase()}
                                        </button>
                                    ))}
                                </div> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default GMPage