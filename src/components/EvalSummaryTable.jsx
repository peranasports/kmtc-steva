import React from 'react'

function EvalSummaryTable({summary, staff}) {

    const gradeTextClass = (grade) => {
        var txt = "mx-6 text-2xl font-bold "
        if (grade === 'A+') txt += "text-center text-green-700"
        else if (grade === 'A') txt += "text-center text-lime-700"
        else if (grade === 'B') txt += "text-center text-yellow-700"
        else if (grade === 'C') txt += "text-center text-orange-700"
        return txt
    }

    const getItem = (emp, i) =>
    {
        if (emp.supervisor === undefined)
        {
            return "self_" + emp.uid
        }
        else
        {
            return "self_"  + i.toString() + "_" + emp.uid
        }
    }

    const checkDiff = (emp) =>
    {
        if (emp.supervisor !== undefined)
        {
            return "whitespace-nowrap text-center py-2.5 text-sm text-gray-500"
        }

        var diff = summary[3]["leadertotal_" + emp.uid] - summary[4]["selftotal_" + emp.uid]
        if (diff < -5)
        {
            return "whitespace-nowrap text-center py-2.5 bg-red-100 text-sm text-gray-500"
        }
        else if (diff > 8)
        {
            return "whitespace-nowrap text-center py-2.5 bg-green-100 text-sm text-gray-500"
        }
        else
        {
            return "whitespace-nowrap text-center py-2.5 text-sm text-gray-500"
        }
    }

    return (
        <div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-2 pl-4 pr-3 w-96 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                
                            </th>
                            {staff.map((emp, i) => (
                                <th scope="col" className="px-3 py-2 w-10 text-left text-sm font-semibold text-gray-900">
                                    {/* {emp.iccid} */}
                                    {emp.supervisor !== undefined ? "BY " + emp.supervisor.iccid : emp.iccid}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                            <tr>
                                <td className="text-end py-2.5 pr-6 text-sm font-medium text-gray-900 sm:pl-6">
                                    {summary[0].name}
                                </td>
                                {staff.map((emp, i) => (
                                    <td className={gradeTextClass(summary[0][getItem(emp, i)])}>{summary[0][getItem(emp, i)]}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="text-end py-2.5 pr-6 text-sm font-medium text-gray-900 sm:pl-6">
                                    {summary[1].name}
                                </td>
                                {staff.map((emp, i) => (
                                    <td className={checkDiff(emp)}>{summary[1][getItem(emp, i)]}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="text-end py-2.5 pr-6 text-sm font-medium text-gray-900 sm:pl-6">
                                    {summary[2].name}
                                </td>
                                {staff.map((emp, i) => (
                                    <td className="whitespace-nowrap text-center py-2.5 text-sm text-gray-500">{summary[2][getItem(emp, i)]}</td>
                                ))}
                            </tr>
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default EvalSummaryTable