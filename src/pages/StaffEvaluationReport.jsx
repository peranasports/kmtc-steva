import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Spinner from "../components/Spinner";
import EvalTable from "../components/EvalTable";
import EvalSummaryTable from "../components/EvalSummaryTable";
import EvalComments from "../components/EvalComments";
import { toast } from "react-toastify";
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

function StaffEvaluationReport() {
    const location = useLocation()
    const employee = location.state;
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState(null)
    const [staff, setStaff] = useState(null)
    const [categories, setCategories] = useState(null)
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const aRef = collection(db, "assessments");
                const q1 = query(
                    aRef,
                    where("employeeUid", "==", employee.uid),
                );
                const querySnap1 = await getDocs(q1);
                const asses = [];
                querySnap1.forEach((doc) => {
                    return asses.push(doc.data());
                });

                var sts = []
                var sup = 1
                for (var na = 0; na < asses.length; na++) {
                    var ass = asses[na]
                    if (ass.supervisorUid === ass.employeeUid) {
                        ass.order = 0;
                        sts.push(employee)
                    }
                    else {
                        ass.order = sup++
                        var xe = JSON.stringify(employee)
                        var xxe = JSON.parse(xe)
                        sts.push(xxe)
                    }
                    const eRef = collection(db, "employees");
                    const q = query(
                        eRef,
                        where("uid", "==", ass.supervisorUid),
                    );
                    const querySnap = await getDocs(q);
                    const sups = [];
                    querySnap.forEach((doc) => {
                        var emp = doc.data()
                        return sups.push(emp);
                    });
                    if (sups.length > 0) {
                        ass.supervisor = sups[0]
                    }
                }
                setStaff(sts)

                var scats = []
                var sums = [{ name: 'Grade' }, { name: 'Score' }, { name: '' }]
                for (var ne = 0; ne < sts.length; ne++) {
                    var emp = sts[ne]
                    var selfa = asses[ne]
                    if (selfa.supervisor !== undefined)
                    {
                        emp.supervisor = selfa.supervisor
                    }

                    if (selfa !== null) {
                        var sitems = selfa.evalitems.split('|~|')
                        for (var ni = 0; ni < sitems.length; ni++) {
                            var item = JSON.parse(sitems[ni])
                            var cats = scats.filter(obj => obj.catId === item.catId)
                            var cat = null
                            if (cats.length === 1) {
                                cat = cats[0]
                            }
                            else {
                                cat = {
                                    catId: item.catId,
                                    name: item.catName,
                                    evalitems: []
                                }
                                scats.push(cat)
                            }
                            var xitem = null
                            for (var nxi = 0; nxi < cat.evalitems.length; nxi++) {
                                if (cat.evalitems[nxi].name === item.name) {
                                    xitem = cat.evalitems[nxi]
                                    break
                                }
                            }
                            if (xitem === null) {
                                xitem = {
                                    name: item.name,
                                }
                                cat.evalitems.push(xitem)
                            }
                            xitem["self_" + ne.toString() + "_" + emp.uid] = item.rating
                        }
                        var sumitem0 = sums[0]
                        var sumitem1 = sums[1]
                        var sumitem2 = sums[2]
                        sumitem0["self_" + ne.toString() + "_"  + emp.uid] = selfa.grade
                        sumitem1["self_" + ne.toString() + "_"  + emp.uid] = selfa.totalRating.toString() + " (" + selfa.percentRating.toString() + "%)"
                        sumitem2["self_" + ne.toString() + "_"  + emp.uid] = ""
                        emp.selfComments = selfa.comments
                        emp.selfAssessment = selfa
                    }
                }
                setSummary(sums)
                setCategories(scats)

                setLoading(false);
            } catch (error) {
                if (error.message.startsWith('Function where')) {
                    toast.error("Could not fetch staff list. Team Leader has not signed up");
                }
                else {
                    toast.error("Could not fetch staff list\n" + error.message);
                }
            }
        }

        fetchStaff()
    }, [])

    const doBack = () => {
        navigate('/gmpage')
    }

    if (loading) {
        return <Spinner />;
    }

    if (employee === null) {
        return <></>
    }


    return (
        <>
            <div className="drawer drawer-end">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="flex justify-between">
                        <div className="mt-2">
                            <button className="w-28 btn btn-sm bg-blue-800 text-white" onClick={() => doBack()}>BACK</button>
                            <label htmlFor="my-drawer-4" className="drawer-button w-28 btn btn-sm bg-blue-800 text-white">COMMENTS</label>
                        </div>
                    </div>
                    <div className='flex justify-between'>
                        <div className="mt-2 text-2xl font-bold">
                            {employee.name.toUpperCase()}
                        </div>
                    </div>
                    <div className=''>
                        {categories.map((category) => (
                            <div className="text-xl"
                                key={category.catId}>
                                <div className="mt-6 border border-base-300 bg-base-100">
                                    <div className="text-md font-medium">
                                        {category.name.toUpperCase()}
                                    </div>
                                    <div className="">
                                        <EvalTable category={category} staff={staff} showSelf={false} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <EvalSummaryTable summary={summary} staff={staff} />
                    </div>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
                    <div className="w-90 bg-base-100">
                        <EvalComments staff={staff} />
                    </div>
                </div>
            </div>
        </>

    )
}

export default StaffEvaluationReport