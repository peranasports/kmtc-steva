import { useState, useEffect } from 'react'

function EvalComments({ staff }) {
    const [commentsType, setCommentsType] = useState(0)

    useEffect(() => {
    }, [commentsType]);
    
    const parseComments = (comments) => {
        if (comments === undefined) {
            return ""
        }

        var cmts = comments.split('|~|')
        var s = ""
        for (var n = 0; n < cmts.length; n++) {
            if (s.length > 0) s += "\n\n"
            s += cmts[n]
        }
        return s
    }

    const doCommentsType = (ct) =>
    {
        setCommentsType(ct)
    }

    return (
        <div>
            <div className="tabs tabs-lifted">
                <a className={commentsType === 0 ? "tab bg-secondary tab-active" : "tab tab-lifted"}
                    onClick={() => doCommentsType(0)}>TEAM LEADER'S COMMENTS</a>
                <a className={commentsType === 1 ? "tab bg-secondary tab-active" : "tab tab-lifted"} onClick={() => doCommentsType(1)}>SELF COMMENTS</a>
            </div>
            <div>
                {staff.map((emp, i) => (
                    <div className="card w-96 bg-base-100 shadow-xl">
                        <div className="card-body">
                            {
                                emp.superAssessment === undefined ?
                                    <h2 className="card-title">{emp.name.toUpperCase()} </h2>
                                :
                                    <div>
                                        {
                                            commentsType === 0 ?
                                                <h2 className="card-title">{emp.name.toUpperCase()} - {emp.superAssessment.totalRating} ({emp.superAssessment.percentRating}%)</h2>
                                                :
                                                <div>
                                                    {
                                                        emp.selfAssessment === undefined ?
                                                            <h2 className="card-title">{emp.name.toUpperCase()}</h2>
                                                        :
                                                            <h2 className="card-title">{emp.name.toUpperCase()} - {emp.selfAssessment.totalRating} ({emp.selfAssessment.percentRating}%)</h2>
                                                    }
                                                </div>
                                        }
                                    </div>
                            }
                            {
                                commentsType === 0 ?
                                    <div className='text-lg text-slate-400 font-normal' style={{ whiteSpace: 'pre-line' }}>
                                        {parseComments(emp.superComments)}
                                    </div>
                                    :
                                    <div className='text-lg text-slate-400 font-normal' style={{ whiteSpace: 'pre-line' }}>
                                        {parseComments(emp.selfComments)}
                                    </div>
                            }
                        </div>
                    </div>
                    // <div key={emp.uid} className="py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    //     <p className='text-lg text-white font-medium'>
                    //         {emp.name.toUpperCase()}
                    //     </p>
                    //     {
                    //         commentsType === 0 ?
                    //             <div className='text-lg text-slate-400 font-normal' style={{ whiteSpace: 'pre-line' }}>
                    //                 {parseComments(emp.superComments)}
                    //             </div>
                    //         :
                    //             <div className='text-lg text-slate-400 font-normal' style={{ whiteSpace: 'pre-line' }}>
                    //                 {parseComments(emp.selfComments)}
                    //             </div>
                    //     }
                    // </div>
                ))}
            </div>
        </div>
    )
}

export default EvalComments