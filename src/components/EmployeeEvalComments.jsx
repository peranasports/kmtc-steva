import { useState, useEffect } from 'react'
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import { XMarkIcon, ClipboardDocumentListIcon } from '@heroicons/react/20/solid'
import { toast } from "react-toastify";
import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { async } from '@firebase/util';

function EmployeeEvalComments({ employee, allStaff, closeComments }) {
    const [assessments, setAssessments] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const assessmentRef = collection(db, "assessments");
                const q = query(
                    assessmentRef,
                    where("employeeUid", "==", employee.uid),
                )
                const querySnap = await getDocs(q);
                const asses = []
                querySnap.forEach((doc) => {
                    var ass = doc.data()
                    return asses.push(ass);
                });
                setAssessments(asses)
            } catch (error) {

            }
        }

        fetchAssessments()
        setLoading(false)
    }, [employee]);

    const fetchEmployeeNameByUid = (uid) => {
        if (employee.uid === uid) {
            return 'SELF'
        }
        for (var n = 0; n < allStaff.length; n++) {
            if (allStaff[n].uid === uid) {
                return allStaff[n].name.toUpperCase()
            }
        }
    }

    const parseComments = (scomments) => {
        if (scomments === undefined) {
            return ""
        }

        var cmts = scomments.split('|~|')
        var s = ""
        for (var n = 0; n < cmts.length; n++) {
            if (s.length > 0) s += "\n\n"
            s += cmts[n]
        }
        return s
    }

    const doClose = () => {
        closeComments()
    }

    if (loading) {
        return <Spinner />;
    }

    if (assessments === null || assessments.length === 0) {
        return <></>
    }

    return (
        <div className=''>
            <div className="mx-4 my-6 w-96 h-12 bg-base-200 shadow-xl rounded-xl">
                <div className="flex justify-between mx-8">
                    <h2 className="text-xl font-bold mt-2">{employee.name.toUpperCase()}</h2>
                    <p>
                        <XMarkIcon className="mt-2 h-8 w-8 flex-shrink-0" aria-hidden="true" onClick={() => doClose()} />
                    </p>
                </div>
            </div>

            <div>
                {assessments.map((ass, i) => (
                    <div className="card mx-4 my-6 w-96 bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">BY {fetchEmployeeNameByUid(ass.supervisorUid)}</h2>
                            <div className="card-actions justify-start">
                                <div className="badge badge-secondary">{ass.totalRating} ({ass.percentRating}%) - {ass.grade}</div>
                            </div>
                            <p>{parseComments(ass.comments)}</p>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default EmployeeEvalComments