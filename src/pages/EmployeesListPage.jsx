import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import head from '../assets/avatars/head.png'
import { CheckCircleIcon, XCircleIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/20/solid'
import GMPage from './GMPage';
// import { useAuthStatus } from "./../hooks/useAuthStatus";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
// Firebase Firestore
import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";

function EmployeesListPage() {
    const navigate = useNavigate()
    const params = useParams();
    // const { loggedIn, currentUser, employee, checkingStatus } = useAuthStatus();
    const [employee, setEmployee] = useState(null)
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true);
    
    const doEvaluation = (employee, supervisor) => {
        if (employee.uid === undefined) {
            toast.error(employee.name + " has not signed up yet.");
            return
        }
        const st = {
            employee: employee,
            supervisor: supervisor,
        }
        navigate('/evaluation', { state: st })
    }

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const sts = [];
                const eRef = collection(db, "employees");
                const q1 = query(
                    eRef,
                    where("uid", "==", params.userUid),
                );
                const querySnap1 = await getDocs(q1);
                var empls = []
                querySnap1.forEach((doc) => {
                    return empls.push(doc.data());
                });
                if (empls.length === 0) {
                    setStaff(sts)
                    setLoading(false);
                    return
                }
                var empl = empls[0]
                setEmployee(empl)

                sts.push(empl)

                // if (empl.role < 4) {
                //     setStaff(sts)
                //     setLoading(false);
                //     return
                // }

                if (empl.role >= 4) {
                    if (empl.teamsManaged !== undefined)
                    {
                        var teams = empl.teamsManaged.split('-')
                        for (var nt = 0; nt < teams.length; nt++) {
                            const q = query(
                                eRef,
                                where("depcode", "==", Number.parseInt(teams[nt])),
                            );
                            const querySnap = await getDocs(q);
                            querySnap.forEach((doc) => {
                                var e = doc.data()
                                if (e.iccid != empl.iccid) {
                                    return sts.push(doc.data());
                                }
                            });
                        }
                        }

                    const q2 = query(
                        eRef,
                        where("assessor", "==", empl.iccid),
                    );
                    const querySnap2 = await getDocs(q2);
                    querySnap2.forEach((doc) => {
                        var e = doc.data()
                        if (e.uid != empl.uid) {
                            return sts.push(doc.data());
                        }
                    });

                }

                setStaff(sts)

                // get assessments
                for (var ne = 0; ne < sts.length; ne++) {
                    var emp = sts[ne]
                    if (emp.uid === undefined || empl.uid === undefined) {
                        continue
                    }
                    const assessmentRef = collection(db, "assessments");
                    const q = query(
                        assessmentRef,
                        where("employeeUid", "==", emp.uid),
                        where("supervisorUid", "==", empl.uid),
                    )
                    const querySnap = await getDocs(q);
                    const asses = [];
                    querySnap.forEach((doc) => {
                        return asses.push(doc.data());
                    });
                    if (asses.length > 0) {
                        emp.assessment = asses[0]
                    }
                }

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch staff list");
            }
        }

        if (params.userUid !== undefined) {
            fetchStaff()
            // forceUpdate(n => !n)
        }
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (employee === null) {
        return <>
        </>
    }

    return (
        <>
            <ul role="list" className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((person) => (
                    <li key={person.iccid} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
                        <div className="flex w-full items-center justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-sm font-medium text-gray-900">{person.name}</h3>
                                    <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                        {person.department}
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-sm text-gray-500">{person.position}</p>
                            </div>
                            <div className="avatar">
                                <div className='w-12 rounded-xl'>
                                    <img className="ebg-gray-300" src={person.photoUrl ? person.photoUrl : head} alt="" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="-mt-px flex divide-x divide-gray-200">
                                <div className="flex w-0 flex-1">
                                    <div
                                        onClick={() => doEvaluation(person, employee)}
                                        className="cursor-pointer relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                                    >
                                        {
                                            person.assessment === undefined ?
                                                <XCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
                                                :
                                                person.assessment.submitted ?
                                                    <CheckCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" />
                                                    :
                                                    <EllipsisHorizontalCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-orange-400" aria-hidden="true" />
                                        }
                                        {
                                            person === employee ?
                                                <span className="ml-3">Self Evaluation</span>
                                                :
                                                <span className="ml-3">Staff Evaluation</span>
                                        }
                                    </div>
                                </div>
                                {/* <div className="-ml-px flex w-0 flex-1">
                                    <div
                                        className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                                    >
                                        {
                                            person.assessment !== undefined ?
                                                <CheckCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" />
                                                :
                                                <XCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
                                        }
                                        <span className="ml-3">Comments</span>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* <div
                className="mt-4 w-60 top-0 right-0 bg-indigo-700 text-white flex flex-col justify-center items-center"
                onClick={() => doEvaluation(employee, employee)}
            >
                <p className='text-lg font-medium'>{employee.name.toUpperCase()}</p>
                <p className='text-sm font-medium'>{employee.department.toUpperCase()}</p>
            </div> */}
            {/* <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {staff.map((emp) => (
                        <li key={emp.emailAddress}>
                            <a href={emp.href} className="block hover:bg-gray-50">
                                <div className="flex items-center px-4 py-4 sm:px-6">
                                    <div className="flex min-w-0 flex-1 items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar">
                                                <div className="w-12 rounded-xl">
                                                    <img className="cursor-pointer" src={emp.photoUrl ? emp.photoUrl : head} alt="" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                            <div>
                                                <p className="truncate text-sm font-medium text-indigo-600">{emp.name}</p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                                    <EnvelopeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                                    <span className="truncate">{emp.emailAddress}</span>
                                                </p>
                                                <p>
                                                    {
                                                        emp.assessment !== undefined ?
                                                            <CheckCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" />
                                                            :
                                                            <XCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-red-400" aria-hidden="true" />
                                                    }
                                                </p>
                                            </div>
                                            <div className="hidden md:block">
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        {emp.position}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500">
                                                        <CheckCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" onClick={() => doEvaluation(emp, employee)}/>
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div> */}

            {/* <div>
                    {staff.map((st) => (
                        <div key={st.uid}>
                            {
                                st.uid === undefined || st.uid === '' ?
                                    <div
                                        className="mt-4 w-60 top-0 right-0 bg-red-500 text-white flex flex-col justify-center items-center"
                                    >
                                        <p className='text-lg font-medium'>{st.name.toUpperCase()}</p>
                                        <p className='text-sm font-normal'>{st.department.toUpperCase()}</p>
                                    </div>
                                    :
                                    <div
                                        className="mt-4 w-60 top-0 right-0 bg-blue-500 text-white flex flex-col justify-center items-center"
                                        onClick={() => doEvaluation(st, employee)}
                                    >
                                        <p className='text-lg font-medium'>{st.name.toUpperCase()}</p>
                                        <p className='text-sm font-normal'>{st.department.toUpperCase()}</p>
                                    </div>
                            }
                        </div>
                    ))}
                </div> */}
        </>
    )
}

export default EmployeesListPage