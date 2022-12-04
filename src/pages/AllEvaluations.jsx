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
    query,
    where,
    limit,
    serverTimestamp,
} from "firebase/firestore";

// React Toastify
import { toast } from "react-toastify";
import {sortBy, orderBy} from 'lodash';

function AllEvaluations() {
    const [sortType, setSortType] = useState(1)
    const [isAscending, setIsAscending] = useState(false)
    const [employees, setEmployees] = useState(null)
    const [assessments, setAssessments] = useState(null)
    const [, forceUpdate] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async (asses) => {
            try {
                // Get reference
                const eRef = collection(db, "employees");
                const q = query(
                    eRef,
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
                    where('employeeUid', "!=", 'supervisorUid')
                );
                const querySnap = await getDocs(q);
                const asses = [];
                querySnap.forEach((doc) => {
                    return asses.push(doc.data());
                });
                if (asses.length !== 0) {
                    setAssessments(asses)
                    fetchEmployees(asses)
                }
                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch departments\n" + error.message);
            }
        };
        fetchAssessments()
        // fetchEmployees()
    }, [sortType, isAscending]);

    const doSort = (sb) =>
    {
        if (sb === sortType)
        {
            setIsAscending(!isAscending)
        }
        setSortType(sb)
        // forceUpdate(n => !n)
    }

    const getEmployees = () =>
    {
        var asc = isAscending ? 'asc' : 'desc'
        if (sortType === 1)
        {
            return orderBy(employees.filter(obj => obj.assessment !== undefined), ['assessment.totalRating'], [asc])
        }
        else if (sortType === 2)
        {
            return orderBy(employees.filter(obj => obj.assessment !== undefined), ['assessment.percentRating'], [asc])
        }
        else if (sortType === 3)
        {
            return orderBy(employees.filter(obj => obj.assessment !== undefined), ['name'], [asc])
        }
        else if (sortType === 4)
        {
            return orderBy(employees.filter(obj => obj.assessment !== undefined), ['department'], [asc])
        }
    }

    if (loading) {
        return <Spinner />;
    }

    if (employees === null) {
        return <></>
    }

    return (
        <div>
            <div className="overflow-hidden w-90 shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <p>SOUTH</p>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(3)}>
                                Name
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900" onClick={() => doSort(4)}>
                                Department
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Port
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(1)}>
                                Score
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(2)}>
                                Percentage
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {getEmployees().filter(obj => obj.port === 'SGN').map((emp, i) => (
                            <tr key={emp.uid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {emp.name.toUpperCase()}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p>NORTH</p>
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
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(1)}>
                                Score
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900" onClick={() => doSort(2)}>
                                Percentage
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-sm font-semibold text-gray-900">
                                Grade
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {getEmployees().filter(obj => obj.port !== 'SGN').map((emp, i) => (
                            <tr key={emp.uid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                <td className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {emp.name.toUpperCase()}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default AllEvaluations