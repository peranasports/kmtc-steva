import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStatus } from "./../hooks/useAuthStatus";
import { EllipsisVerticalIcon, UserCircleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/20/solid'
import { sortBy } from 'lodash';
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
    const [employees, setEmployees] = useState(null)
    const [departments, setDepartments] = useState(null)
    const [loading, setLoading] = useState(true);
    const { loggedIn, currentUser, employee, checkingStatus } = useAuthStatus();

    const depcolors = [
        'bg-pink-600',
        'bg-purple-600',
        'bg-green-500',
        'bg-yellow-500',
        'bg-blue-600',
        'bg-orange-500',
        'bg-violet-600',
        'bg-lime-500',
        'bg-red-600',
        'bg-teal-500',
        'bg-amber-600',
        'bg-emerald-500',
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

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
                    var emp = doc.data()
                    emp.docId = doc.id
                    return empls.push(emp);
                });
                if (empls.length !== 0) {
                    setEmployees(empls)
                }
                //         setLoading(false);
                //     } catch (error) {
                //         toast.error("Could not fetch employees\n" + error.message);
                //     }
                // };

                // const fetchDepartments = async () => {
                //     try {
                // Get reference
                const dRef = collection(db, "departments");
                const q2 = query(
                    dRef,
                    orderBy("port"),
                    orderBy("name")
                );
                const querySnap2 = await getDocs(q2);
                const deps = [];
                querySnap2.forEach((doc) => {
                    var dep = doc.data()
                    dep.employees = []
                    for (var ne = 0; ne < empls.length; ne++) {
                        var emp = empls[ne]
                        if (emp.port === dep.port && emp.department === dep.code) {
                            dep.employees.push(emp)
                            if (emp.role >= 4) {
                                dep.manager = emp
                            }
                        }
                    }
                    return deps.push(dep);
                });
                if (deps.length !== 0) {
                    setDepartments(deps)
                }

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

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch departments\n" + error.message);
            }
        };
        fetchEmployees()
        // fetchDepartments()
    }, []);

    // useEffect(() => {
    //     const fetchDepartments = async () => {
    //         try {
    //             // Get reference
    //             const dRef = collection(db, "departments");

    //             // Create a query
    //             const q = query(
    //                 dRef,
    //                 where("id", ">", 10),
    //                 orderBy("id")
    //             );

    //             // Execute query
    //             const querySnap = await getDocs(q);

    //             const deps = [];

    //             querySnap.forEach((doc) => {
    //                 var dep = doc.data()
    //                 dep.uid = doc.id
    //                 return deps.push(dep);
    //             });

    //             const regs = [{ name: 'South', departments: [] }, { name: 'North', departments: [] }];

    //             for (var nc = 0; nc < deps.length; nc++) {
    //                 var dep = deps[nc]
    //                 if (dep.port === 'SGN') {
    //                     dep.region = 0
    //                     regs[0].departments.push(dep)
    //                 }
    //                 else {
    //                     dep.region = 1
    //                     regs[1].departments.push(dep)
    //                 }
    //             }
    //             setRegions(regs)
    //             setDepartments(deps)

    //             setLoading(false);
    //         } catch (error) {
    //             toast.error("Could not fetch departments");
    //         }
    //     };

    //     fetchDepartments()
    // }, []);

    const doEvaluation = (dep) => {
        navigate('/departmenteval', { state: { department: dep } })
    }

    const doStaff = () => {
        navigate('/staffmanagement')
    }

    const doAllEvaluations = () => {
        navigate('/allevals')
    }

    const doForEvaluation = () => {
        navigate(`/employee/${employee.uid}`)
    }

    const doDepartment = (department) => {
        navigate('/departmenteditor', { state: department })
    }

    if (loading) {
        return <Spinner />;
    }

    if (departments === null) {
        return <>
        </>
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

            {regions.map((region) => (
                <div className="text-xl"
                    key={region.name}>
                    <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                        <input type="checkbox" defaultChecked='true' />
                        <div className="collapse-title text-md font-medium">
                            {region.name.toUpperCase()}
                        </div>
                        <div className="collapse-content">
                            <div>
                                {/* <h2 className="mt-8 text-sm font-medium text-white">SOUTH</h2> */}
                                <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                                    {sortBy(region.departments.filter(obj => obj.id >= 10), ['code']).map((department, i) => (
                                        <li key={department.id} className="col-span-1 flex rounded-md shadow-sm">
                                            <div
                                                className={classNames(
                                                    depcolors[department.id % 10],
                                                    'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
                                                )}
                                            >
                                                {department.code}
                                            </div>
                                            <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
                                                <div>
                                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                                        <a href={department.href} className="font-medium text-gray-900 hover:text-gray-600">
                                                            {department.name}
                                                        </a>
                                                        <p className="text-gray-500 font-bold">{department.manager ? department.manager.name : ''}</p>
                                                        <p className="text-gray-500">{department.employees.length.toString()} Members</p>
                                                    </div>
                                                    <div className="flex ml-3 mb-2">
                                                        <div className="flex" onClick={() => doDepartment(department)}>
                                                            <UserCircleIcon className="h-5 w-5  text-gray-400 hover:text-gray-200" aria-hidden="true" />
                                                            <span className="ml-3 cursor-pointer text-sm text-gray-400 hover:text-gray-200">Manage</span>
                                                        </div>
                                                        <div className="flex ml-4" onClick={() => doEvaluation(department)}>
                                                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400 hover:text-gray-200" aria-hidden="true" />
                                                            <span className="ml-3 cursor-pointer text-sm text-gray-400 hover:text-gray-200">Evaluation</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* <div className=''>
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
                            </div>
                        </div>
                    </div>
                ))}
            </div> */}
        </>
    )
}

export default GMPage