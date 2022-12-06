import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./../components/Spinner";
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import {sortBy} from 'lodash';
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
import { Navigate } from "react-router-dom";

function StaffManagement() {
    const [employees, setEmployees] = useState(null)
    const [departments, setDepartments] = useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
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
                    for (var ne=0; ne<empls.length; ne++)
                    {
                        var emp = empls[ne]
                        if (emp.port === dep.port && emp.department === dep.code)
                        {
                            dep.employees.push(emp)
                            if (emp.role >= 4)
                            {
                                dep.manager = emp
                            }
                        }
                    }    
                    return deps.push(dep);
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
        // fetchDepartments()
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

    const doDepartment = (department) =>
    {
        navigate('/departmenteditor', {state: department})
    }

    return (
        <>
        <div>
            <h2 className="mt-8 text-sm font-medium text-white">SOUTH</h2>
            <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {sortBy(departments.filter(obj => obj.port === 'SGN'), ['code']).map((department, i) => (
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
                            <div className="flex-1 truncate px-4 py-2 text-sm">
                                <a href={department.href} className="font-medium text-gray-900 hover:text-gray-600">
                                    {department.name}
                                </a>
                                <p className="text-gray-500 font-bold">{department.manager ? department.manager.name : ''}</p>
                                <p className="text-gray-500">{department.employees.length.toString()} Members</p>
                            </div>
                            <div className="flex-shrink-0 pr-2">
                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" onClick={() => doDepartment(department)}/>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h2 className="mt-8 text-sm font-medium text-white">NORTH</h2>
            <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {sortBy(departments.filter(obj => obj.port !== 'SGN'), ['code']).map((department, i) => (
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
                            <div className="flex-1 truncate px-4 py-2 text-sm">
                                <a href={department.href} className="font-medium text-gray-900 hover:text-gray-600">
                                    {department.name}
                                </a>
                                <p className="text-gray-500 font-bold">{department.manager ? department.manager.name : ''}</p>
                                <p className="text-gray-500">{department.employees.length.toString()} Members</p>
                            </div>
                            <div className="flex-shrink-0 pr-2">
                                <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span className="sr-only">Open options</span>
                                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" onClick={() => doDepartment(department)}/>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        </>
    )
}

export default StaffManagement