import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "./../components/Spinner";
import head from '../assets/avatars/head.png'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid'
import EmployeeEvalComments from "../components/EmployeeEvalComments";

import { db } from "../firebase.config";
import {
    doc,
    setDoc,
    addDoc,
    collection,
    startAfter,
    getDocs,
    query,
    where,
    limit,
    serverTimestamp,
} from "firebase/firestore";

// React Toastify
import { toast } from "react-toastify";
import { sortBy, orderBy } from 'lodash';

function AllEvaluations() {
    const navigate = useNavigate()
    const location = useLocation()
    const { year } = location.state;
    const [sortType, setSortType] = useState(1)
    const [isAscending, setIsAscending] = useState(false)
    const [employees, setEmployees] = useState(null)
    const [assessments, setAssessments] = useState(null)
    const [, forceUpdate] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedEmp, setSelectedEmp] = useState(null)

    useEffect(() => {
        const fetchEmployees = async (asses) => {
            try {
                // Get reference
                const eRef = collection(db, "employees");
                const q = query(
                    eRef,
                    // where("active", "==", true),
                );
                const querySnap = await getDocs(q);
                const empls = [];
                querySnap.forEach((doc) => {
                    return empls.push(doc.data());
                });
                if (empls.length !== 0) {
                    setEmployees(empls)
                    for (var ne = 0; ne < empls.length; ne++) {
                        var emp = empls[ne]
                        for (var na = 0; na < asses.length; na++) {
                            var ass = asses[na]
                            if (ass.employeeUid === emp.uid) {
                                emp.assessment = ass
                                break
                            }
                        }
                    }
                }

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch employees\n" + error.message);
            }
        };

        const fetchAssessments = async () => {
            try {
                // Get reference
                const aRef = collection(db, "assessments");
                const q = query(
                    aRef,
                );
                const querySnap = await getDocs(q);
                const asses = [];
                querySnap.forEach((doc) => {
                    var ass = doc.data()
                    if (ass.employeeUid === ass.supervisorUid) {
                        var ass = doc.data()
                        var ts = new Date(ass.timestamp.seconds * 1000); // Epoch
                        // ts.setSeconds(ass.timestamp)
                        if (ts.getFullYear().toString() === year) {
                            return asses.push(ass);
                        }
                    }
                });
                if (asses.length !== 0) {
                    setAssessments(asses)
                    fetchEmployees(asses)
                }
                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch assessments\n" + error.message);
            }
        };
        fetchAssessments()
        // fetchEmployees()
    }, [sortType, isAscending]);

    const doSort = (sb) => {
        if (sb === sortType) {
            setIsAscending(!isAscending)
        }
        setSortType(sb)
        // forceUpdate(n => !n)
    }

    const getEmployees = () => {
        var asc = isAscending ? 'asc' : 'desc'
        if (sortType === 1) {
            return orderBy(employees.filter(obj => obj.role < 8).filter(obj => obj.assessment !== undefined), ['assessment.totalRating'], [asc])
        }
        else if (sortType === 2) {
            return orderBy(employees.filter(obj => obj.role < 8).filter(obj => obj.assessment !== undefined), ['assessment.percentRating'], [asc])
        }
        else if (sortType === 3) {
            return orderBy(employees.filter(obj => obj.role < 8).filter(obj => obj.assessment !== undefined), ['name'], [asc])
        }
        else if (sortType === 4) {
            return orderBy(employees.filter(obj => obj.role < 8).filter(obj => obj.assessment !== undefined), ['department'], [asc])
        }
    }

    const doShowComments = (emp) => {
        setSelectedEmp(emp)
        document.getElementById('my-drawer-4').checked = true
    }

    const doCloseComments = () => {
        document.getElementById('my-drawer-4').checked = false
    }

    if (loading) {
        return <Spinner />;
    }

    if (employees === null) {
        return <></>
    }

    return (
        <>
            <div className="drawer drawer-end">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div>
                        <div className="flex mt-2">
                            <button className="btn btn-sm bg-blue-800 text-white" onClick={() => { navigate('/gmpage') }}>BACK</button>
                            <div className="mt-1 ml-10 text-secondary font-bold">
                                ALL EVALUATIONS - {year}
                            </div>
                        </div>
                        <div className="overflow-hidden w-90 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <p className="my-2 font-medium">SOUTH</p>
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(3)}>
                                            Name
                                        </th>
                                        <th scope="col" className="cursor-pointer px-3 py-2 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(4)}>
                                            Department
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                            Port
                                        </th>
                                        <th scope="col" className="cursor-pointer px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(1)}>
                                            Score
                                        </th>
                                        <th scope="col" className="cursor-pointer px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(2)}>
                                            Percentage
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                            Grade
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {getEmployees().filter(obj => obj.port === 'SGN').map((emp, i) => (
                                        <tr key={emp.uid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                            <td className="flex py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <div className="avatar">
                                                    <div className="w-8 rounded-xl">
                                                        <img className="cursor-pointer" src={emp.photoUrl ? emp.photoUrl : head} alt="" />
                                                    </div>
                                                </div>
                                                <div className="ml-2 mt-2">
                                                    {emp.name.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {emp.department.toUpperCase()}
                                            </td>
                                            <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {emp.port.toUpperCase()}
                                            </td>
                                            {
                                                emp.assessment !== undefined ?
                                                    <>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.totalRating}</td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.percentRating}%</td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.grade}</td>
                                                    </>
                                                    :
                                                    <>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                    </>

                                            }
                                            <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <p className="cursor-pointer mt-2 flex items-center text-sm text-gray-500">
                                                    <ChatBubbleLeftRightIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-blue-400" aria-hidden="true" onClick={() => doShowComments(emp)} />
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="my-2 font-medium">NORTH</p>
                        <div className="overflow-hidden w-90 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(3)}>
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(4)}>
                                            Department
                                        </th>
                                        <th scope="col" className="cursor-pointer px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(1)}>
                                            Score
                                        </th>
                                        <th scope="col" className="cursor-pointer px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(2)}>
                                            Percentage
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                            Grade
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {getEmployees().filter(obj => obj.port !== 'SGN').map((emp, i) => (
                                        <tr key={emp.uid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                            <td className="flex py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <div className="avatar">
                                                    <div className="w-8 rounded-xl">
                                                        <img className="cursor-pointer" src={emp.photoUrl ? emp.photoUrl : head} alt="" />
                                                    </div>
                                                </div>
                                                <div className="ml-2 mt-2">
                                                    {emp.name.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {emp.port.toUpperCase()}-{emp.department.toUpperCase()}
                                            </td>
                                            {
                                                emp.assessment !== undefined ?
                                                    <>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.totalRating}</td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.percentRating}%</td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-center text-sm text-gray-500">{emp.assessment.grade}</td>
                                                    </>
                                                    :
                                                    <>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                        <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500"></td>
                                                    </>

                                            }
                                            <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                <p className="cursor-pointer mt-2 flex items-center text-sm text-gray-500">
                                                    <ChatBubbleLeftRightIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-blue-400" aria-hidden="true" onClick={() => doShowComments(emp)} />
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>


                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
                    <div className="w-90 bg-base-100">
                        {
                            selectedEmp !== null ?
                                <EmployeeEvalComments employee={selectedEmp} allStaff={employees} closeComments={() => doCloseComments()} />
                                :
                                <div></div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default AllEvaluations