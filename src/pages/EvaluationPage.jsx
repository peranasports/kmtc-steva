import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Spinner from "./../components/Spinner";
import EvalItem from "../components/EvalItem";
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

function EvaluationPage() {
    const navigate = useNavigate()
    const location = useLocation();
    const { employee, supervisor, gm } = location.state;
    const [, forceUpdate] = useState(0);
    const [categories, setCategories] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState([]);
    const [totalRating, setTotalRating] = useState(0);
    const [percentRating, setPercentRating] = useState(0);
    const [grade, setGrade] = useState('');
    const [assessment, setAssessment] = useState(null);
    const [ppr, setPpr] = useState('')
    const [feedback, setFeedback] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [evaluationOpen, setEvaluationOpen] = useState('0')

    useEffect(() => {
        const fetchEvaluationStatus = async () => {
            try {
                // Get reference
                const eRef = collection(db, "settings");
                const q = query(
                    eRef,
                );
                const querySnap = await getDocs(q);
                querySnap.forEach((doc) => {
                    var setting = doc.data()
                    if (setting.key === 'evaluationOpen') {
                        setEvaluationOpen(setting.value)
                    }
                });
            } catch (error) {
                toast.error("Could not fetch settings\n" + error.message);
            }
        }

        const fetchCategories = async () => {
            try {
                // Get reference
                const categoriesRef = collection(db, "categories");

                // Create a query
                const q = query(
                    categoriesRef,
                    where("id", ">", 0),
                    orderBy("id")
                );

                // Execute query
                const querySnap = await getDocs(q);

                const cats = [];

                querySnap.forEach((doc) => {
                    // console.log(doc.data());
                    return cats.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });

                const xcategories = [];

                for (var nc = 0; nc < cats.length; nc++) {
                    const catid = cats[nc].data.id
                    console.log('Category = ', cats[nc].data.name)

                    var xcat = {
                        catId: catid,
                        name: cats[nc].data.name
                    }
                    xcategories.push(xcat)

                    // Get reference
                    const evalitemsRef = collection(db, "evalitems");

                    // Create a query
                    const q = query(
                        evalitemsRef,
                        where("categoryId", "==", catid),
                        orderBy("order")
                    );

                    // Execute query
                    const querySnap = await getDocs(q);

                    const evalitems = [];

                    querySnap.forEach((doc) => {
                        // console.log(doc.data());
                        var data = doc.data()
                        return evalitems.push({
                            id: doc.id,
                            name: data.name,
                            order: data.order,
                            teamleader: data.teamleader,
                            rating: 0
                        });
                    });

                    xcat.evalitems = evalitems
                }

                setCategories(xcategories);

                setLoading(false);
            } catch (error) {
                toast.error("Could not fetch items");
            }
        };

        const fetchAssessment = async () => {
            try {
                const assessmentRef = collection(db, "assessments");
                const q = query(
                    assessmentRef,
                    where("employeeUid", "==", employee.uid),
                    where("supervisorUid", "==", supervisor.uid),
                );
                const querySnap = await getDocs(q);
                const asses = [];
                querySnap.forEach((doc) => {
                    return asses.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });
                var ass = null
                // no assessment found
                if (asses.length == 0) {
                    // are we looking at GM assessing team leader?
                    if (supervisor.role === 10) {
                        const q2 = query(
                            assessmentRef,
                            where("employeeUid", "==", employee.uid),
                            where("supervisorUid", "==", employee.uid),
                        );
                        const querySnap2 = await getDocs(q2);
                        querySnap2.forEach((doc) => {
                            return asses.push({
                                id: doc.id,
                                data: doc.data(),
                            });
                        });
                        if (asses.length == 0) {
                            fetchCategories();
                            return
                        }
                        var newass = JSON.stringify(asses[0].data)
                        ass = JSON.parse(newass)
                        ass.uid = ''
                        ass.comments = '|~||~|'
                        ass.supervisorUid = employee.uid
                    }
                    else {
                        fetchCategories();
                        return
                    }
                }
                else {
                    ass = asses[0].data
                    ass.uid = asses[0].id
                }
                var scats = []
                var rts = []
                var sitems = ass.evalitems.split('|~|')
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
                    cat.evalitems.push(item)
                    rts.push({
                        id: item.id,
                        rating: item.rating
                    })
                }
                setCategories(scats)
                setRatings(rts)
                setAssessment(ass)
                calculateRatings(rts)
                setLoading(false);
                return
            } catch (error) {
                toast.error("Could not fetch assessment");
                return null
            }
        }

        fetchEvaluationStatus()
        fetchAssessment()
        // calculateRatings(ratings)
    }, [location]);

    if (loading) {
        return <Spinner />;
    }

    if (categories === null) {
        return <></>
    }

    const onRatingChange = (r, evalitem) => {
        evalitem.rating = r
        var exists = false
        var rts = ratings
        for (var ni = 0; ni < rts.length; ni++) {
            var rt = rts[ni]
            if (rt.id === evalitem.id) {
                rt.rating = r
                exists = true
                break
            }
        }
        if (!exists) {
            rts.push({
                id: evalitem.id,
                rating: r
            })
        }
        calculateRatings(rts)
    }

    function calculateRatings(rts) {
        var tr = 0
        var ttr = 0
        for (var ni = 0; ni < rts.length; ni++) {
            var rt = rts[ni]
            tr += rt.rating
            ttr += 5
        }
        var pcr = Math.floor((tr * 100) / ttr)
        //A+: 95-100%; A: 73-94%; B: 60-72%; C: < 60%
        var gr = 'C'
        if (pcr >= 95) {
            gr = 'A+'
        }
        else if (pcr >= 73) {
            gr = 'A'
        }
        else if (pcr >= 60) {
            gr = 'B'
        }
        setRatings(rts)
        setTotalRating(tr)
        setPercentRating(pcr)
        setGrade(gr)
        console.log("Total Rating ", (tr * 100) / ttr)
    }

    const getItems = (category) => {
        if (employee && employee.role >= 3) {
            return category.evalitems
        }
        else {
            return category.evalitems.filter(obj => obj.teamleader === undefined)
        }
    }

    const gradeTextClass = () => {
        var txt = "mx-6 text-2xl font-bold "
        if (grade === 'A+') txt += "text-green-500"
        else if (grade === 'A') txt += "text-lime-500"
        else if (grade === 'B') txt += "text-yellow-500"
        else if (grade === 'C') txt += "text-orange-500"
        return txt
    }

    const saveAssessment = async () => {
        var s = ''
        for (var nc = 0; nc < categories.length; nc++) {
            var cat = categories[nc]
            var items = getItems(cat)
            for (var ni = 0; ni < items.length; ni++) {
                var item = items[ni]
                item.catId = cat.catId
                item.catName = cat.name
                if (s.length > 0) s += "|~|"
                s += JSON.stringify(item)
            }
        }

        try {
            if (assessment === null || assessment.uid === undefined || assessment.uid === '') {
                var ass = {
                    employeeUid: employee.uid,
                    supervisorUid: supervisor.uid,
                    evalitems: s,
                    comments: ppr + "|~|" + feedback + "|~|" + suggestion,
                }
                const docRef = await addDoc(collection(db, "assessments"), ass);
                ass.uid = docRef.id
                ass.employeeName = employee.name
                ass.timestamp = serverTimestamp()
                ass.totalRating = totalRating
                ass.percentRating = percentRating
                ass.grade = grade
                await setDoc(doc(db, "assessments", ass.uid), ass);
            }
            else {
                var ass = assessment
                if (ass.comments === undefined || ass.comments.length === 0) {
                    ass.comments = ppr + "|~|" + feedback + "|~|" + suggestion
                }
                ass.evalitems = s
                ass.timestamp = serverTimestamp();
                ass.totalRating = totalRating
                ass.percentRating = percentRating
                ass.grade = grade
                await setDoc(doc(db, "assessments", assessment.uid), ass);
            }
        } catch (error) {
            console.log(error)
        }

        setAssessment(ass)

        return ass
    }

    const doSubmit = async () => {
        assessment.submitted = true
        var ass = await saveAssessment()
        navigate(`/employee/${supervisor.uid}`, { state: { gm: false } })
    }

    const doBack = async () => {
        var ass = await saveAssessment()
        navigate(`/employee/${supervisor.uid}`, { state: { gm: gm } })
    }

    const doComments = async () => {
        var ass = await saveAssessment()
        const st = {
            assessment: ass,
            employee: employee,
            supervisor: supervisor,
        }
        navigate('/staff-comments', { state: st })
    }

    const doRandom = () => {
        var rts = []
        for (var nc = 0; nc < categories.length; nc++) {
            var cat = categories[nc]
            var items = getItems(cat)
            for (var ni = 0; ni < items.length; ni++) {
                var item = items[ni]
                item.rating = Math.ceil(Math.random() * 4) + 1
                rts.push({
                    id: item.id,
                    rating: item.rating
                })
            }
        }
        calculateRatings(rts)
        setRatings(rts)
        setPpr(employee.name + "'s " + "PPR. ")
        setFeedback(employee.name + "'s " + "Feedback. ")
        setSuggestion(employee.name + "'s " + "Suggestion. ")
        forceUpdate(n => !n)
    }

    return (
        <>
            {
                evaluationOpen === '1' ?
                    <div>
                        <div className='rounded-sm shadow-lg bg-base-100'>
                            <div className="flex justify-between">
                                <div className="mt-2 justify-start">
                                    <button className="w-28 btn btn-sm bg-blue-800 text-white" onClick={() => doBack()}>BACK</button>
                                    <button className="w-28 btn btn-sm bg-blue-800 text-white" onClick={() => doSubmit()}>SUBMIT</button>
                                    <button className='w-28 btn btn-sm bg-blue-800 text-white' onClick={doComments}>COMMENTS</button>
                                    <button className="ml-4 btn btn-sm bg-slate-800 text-slate-400 hidden" onClick={() => doRandom()}>RANDOM FILL</button>
                                </div>
                                <div className="flex justify-end">
                                    <p className='mt-2 text-lg'>
                                        {employee.name.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className=''>
                                {categories.map((category) => (
                                    <div className="text-xl"
                                        key={category.catId}>
                                        <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                                            <input type="checkbox" defaultChecked='true' />
                                            <div className="collapse-title text-md font-medium">
                                                {category.name}
                                            </div>
                                            <div className="collapse-content">
                                                {getItems(category).map((evalitem) => (
                                                    <div className="flex justify-end"
                                                        key={evalitem.order}>
                                                        <EvalItem evalitem={evalitem} onRatingChange={(r, evaltime) => onRatingChange(r, evaltime)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="justify-start">
                            </div>
                            <div className="flex justify-end">
                                <p className="text-md">
                                    Total:
                                </p>
                                <p className="mx-6 text-md">
                                    {totalRating} ( {percentRating}%)
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="mt-2 justify-start">
                            </div>
                            <div className="flex justify-end">
                                <p className={gradeTextClass()}>
                                    {grade}
                                </p>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="text-2xl font-bold mt-10 text-center">Evaluation is currently closed.</div>
            }
        </>
    )
}

export default EvaluationPage