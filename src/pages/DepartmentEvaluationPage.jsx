import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

function DepartmentEvaluationPage() {
    const navigate = useNavigate()
    const location = useLocation();
    const { department } = location.state;
    const [loading, setLoading] = useState(true);
    const [, forceUpdate] = useState(0);
    const [staff, setStaff] = useState([])
    const [selfEvals, setSelfEvals] = useState([])
    const [superEvals, setSuperEvals] = useState([])
    const [summary, setSummary] = useState([])
    const [categories, setCategories] = useState([])
    const [comments, setComments] = useState([])
    const [showSelf, setShowSelf] = useState(0)

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const eRef = collection(db, "employees");
                const q = query(
                    eRef,
                    where("depcode", "==", department.id),
                    orderBy("role", "desc")
                );
                const querySnap = await getDocs(q);
                const sts = [];
                var teamleader = null
                querySnap.forEach((doc) => {
                    var emp = doc.data()
                    if (emp.role === 4) {
                        teamleader = emp
                    }
                    return sts.push(emp);
                });
                setStaff(sts)

                var selfs = []
                var sups = []
                const aRef = collection(db, "assessments");
                for (var ns = 0; ns < sts.length; ns++) {
                    var emp = sts[ns]
                    if (emp.uid === undefined)
                    {
                        continue
                    }
                    const q1 = query(
                        aRef,
                        where("employeeUid", "==", emp.uid),
                        where("supervisorUid", "==", emp.uid),
                    );
                    const querySnap1 = await getDocs(q1);
                    const asses = [];
                    querySnap1.forEach((doc) => {
                        return asses.push(doc.data());
                    });
                    if (asses.length > 0) {
                        selfs.push(asses[0])
                    }

                    const q2 = query(
                        aRef,
                        where("employeeUid", "==", emp.uid),
                        where("supervisorUid", "!=", emp.uid),
                    );
                    const querySnap2 = await getDocs(q2);
                    const ass2es = [];
                    querySnap2.forEach((doc) => {
                        return ass2es.push(doc.data());
                    });
                    if (ass2es.length > 0) {
                        sups.push(ass2es[0])
                    }
                }
                setSuperEvals(sups)
                setSelfEvals(selfs)

                var scats = []
                var sums = [{ name: 'Grade' }, { name: 'Score' }, { name: 'Self' }, {name: 'Leader Total'}, {name: 'Self Total'}]
                for (var ne = 0; ne < sts.length; ne++) {
                    var emp = sts[ne]
                    if (emp.uid === undefined)
                    {
                        continue
                    }
                    //get self evals
                    var selfa = null
                    for (var na = 0; na < selfs.length; na++) {
                        var ass = selfs[na]
                        if (ass.employeeUid === emp.uid) {
                            selfa = ass
                            break
                        }
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
                            xitem["self_" + emp.uid] = item.rating
                        }
                        var sumitem2 = sums[2]
                        var sumitem4 = sums[4]
                        sumitem2["self_" + emp.uid] = selfa.totalRating.toString() + " (" + selfa.percentRating.toString() + "%)"
                        sumitem4["selftotal_" + emp.uid] = selfa.totalRating
                        emp.selfComments = selfa.comments
                        emp.selfAssessment = selfa
                    }

                    // get supervisor evals
                    var supera = null
                    for (var na = 0; na < sups.length; na++) {
                        var ass = sups[na]
                        if (ass.employeeUid === emp.uid) {
                            supera = ass
                            break
                        }
                    }

                    if (supera !== null) {
                        var sitems = supera.evalitems.split('|~|')
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
                            xitem["super_" + emp.uid] = item.rating
                        }
                        var sumitem0 = sums[0]
                        var sumitem1 = sums[1]
                        var sumitem3 = sums[3]
                        sumitem0["self_" + emp.uid] = supera.grade
                        sumitem1["self_" + emp.uid] = supera.totalRating.toString() + " (" + supera.percentRating.toString() + "%)"
                        sumitem3["leadertotal_" + emp.uid] = supera.totalRating
                        emp.superComments = supera.comments
                        emp.superAssessment = supera
                    }
                }
                setSummary(sums)
                setCategories(scats)

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch staff list\n" + error.message);
            }
        }

        fetchStaff()
        // forceUpdate(n => !n)
    }, []);

    const doBack = () => {
        navigate('/gmpage')
    }

    const toggleShowSelf = () =>
    {
        var ss = showSelf
        setShowSelf(!ss)
        forceUpdate(n => !n)
    }

    if (loading) {
        return <Spinner />;
    }

    if (department === null) {
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
                        <div className="form-control">
                            <label className="cursor-pointer label">
                                <span className="label-text mr-4">DISPLAY SELF EVALUATIONS</span>
                                <input type="checkbox" onClick={() => toggleShowSelf()} defaultChecked={showSelf} className="checkbox checkbox-secondary" />
                            </label>
                        </div>
                    </div>
                    <div className="mt-2 text-center text-2xl font-bold">
                        {department.name.toUpperCase()}
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
                                        <EvalTable category={category} staff={staff} showSelf={showSelf} />
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

export default DepartmentEvaluationPage