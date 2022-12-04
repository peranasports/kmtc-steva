import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

function EmployeePage() {
    const navigate = useNavigate()
    const params = useParams();
    // const { loggedIn, currentUser, employee, checkingStatus } = useAuthStatus();
    const [employee, setEmployee] = useState(null)
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true);

    const doEvaluation = (employee, supervisor) => {
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

                if (empl.role < 4) {
                    setStaff(sts)
                    setLoading(false);
                    return
                }

                const q = query(
                    eRef,
                    where("port", "==", empl.port),
                    where("group", "==", empl.group),
                );
                const querySnap = await getDocs(q);
                querySnap.forEach((doc) => {
                    var e = doc.data()
                    if (e.uid != empl.uid)
                    {
                        return sts.push(doc.data());
                    }
                });

                const q2 = query(
                    eRef,
                    where("assessor", "==", empl.iccid),
                );
                const querySnap2 = await getDocs(q2);
                querySnap2.forEach((doc) => {
                    var e = doc.data()
                    if (e.uid != empl.uid)
                    {
                        return sts.push(doc.data());
                    }
                });

                setStaff(sts)
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
                <div
                    className="mt-4 w-60 top-0 right-0 bg-indigo-700 text-white flex flex-col justify-center items-center"
                    onClick={() => doEvaluation(employee, employee)}
                >
                    <p className='text-lg font-medium'>{employee.name.toUpperCase()}</p>
                    <p className='text-sm font-medium'>{employee.department.toUpperCase()}</p>
                </div>
                <div>
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
                </div>
        </>
    )
}

export default EmployeePage