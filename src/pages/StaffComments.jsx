import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db } from "../firebase.config";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

function StaffComments() {
    const navigate = useNavigate()
    const location = useLocation();
    const { assessment, employee, supervisor } = location.state;
    const [, forceUpdate] = useState(0);
    const [formData, setFormData] = useState({
        ppr: '',
        feedback: '',
        suggestion: ''
    })

    const saveFormComments = async () => {
        assessment.comments = formData.ppr + '|~|' + formData.feedback + '|~|' + formData.suggestion
        try {
            await setDoc(doc(db, "assessments", assessment.uid), assessment);
        } catch (error) {
            console.log(error)
        }
        const st = {
            employee: employee,
            supervisor: supervisor,
            gm: false
        }
        navigate('/evaluation', { state: st })
    }

    useEffect(() => {
        if (assessment !== null && assessment !== undefined) {
            var tokens = assessment.comments.split('|~|')
            if (tokens.length === 3) {
                formData.ppr = tokens[0]
                formData.feedback = tokens[1]
                formData.suggestion = tokens[2]
            }
            else if (tokens.length === 2) {
                formData.ppr = tokens[0]
                formData.feedback = tokens[1]
                // formData.suggestion = tokens[2]
            }
            forceUpdate(n => !n)
        }
    }, [])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    return (
        <>
            <div className='rounded-sm shadow-lg bg-base-100'>
                <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                    <input type="checkbox" defaultChecked='true' />
                    {
                        employee.uid === supervisor.uid ?
                            <div className="collapse-title text-md font-medium">
                                Personal Performance Review (PPR)/ Appraisal
                            </div>
                            :
                            <div className="collapse-title text-md font-medium">
                                Department Head's Appraisal
                            </div>
                    }
                    <div className="collapse-content">
                        <textarea className="textarea w-full textarea-bordered"
                            placeholder="Appraisal"
                            id="ppr"
                            onChange={onChange}
                            value={formData.ppr}></textarea>
                    </div>
                </div>

                <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                    <input type="checkbox" defaultChecked='true' />
                    {
                        employee.uid === supervisor.uid ?
                            <div className="collapse-title text-md font-medium">
                                Staff's feedback/ opinion to other teams in job collaboration
                            </div>
                            :
                            <div className="collapse-title text-md font-medium">
                                Department Head's Suggestion/Recommendation
                            </div>
                    }
                    <div className="collapse-content">
                        <textarea className="textarea w-full textarea-bordered"
                            placeholder="Feedback"
                            id="feedback"
                            onChange={onChange}
                            value={formData.feedback}>
                        </textarea>
                    </div>
                </div>
                {
                    employee.uid === supervisor.uid ?
                        <div>
                            <div className="collapse collapse-arrow my-4 border border-base-300 bg-base-100 rounded-box">
                                <input type="checkbox" defaultChecked='true' />
                                <div className="collapse-title text-md font-medium">
                                    Staff's suggestion/recommendation to team/ company
                                </div>
                                <div className="collapse-content">
                                    <textarea className="textarea w-full textarea-bordered"
                                        placeholder="Suggestions"
                                        id="suggestion"
                                        onChange={onChange}
                                        value={formData.suggestion}></textarea>
                                </div>
                            </div>
                        </div> :
                        <div></div>
                }
            </div>

            <div className="flex justify-end">
                <button className="w-28 btn btn-sm bg-blue-800 text-white" onClick={saveFormComments}>SAVE</button>
            </div>
        </>
    )
}

export default StaffComments