import { useState } from 'react'

function EvalTable({ category, staff, showSelf }) {
    return (
        <div>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-2 pl-4 pr-3 w-96 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Item
                            </th>
                            {staff.map((emp, i) => (
                                <th scope="col" className="px-3 py-2 w-10 text-left text-sm font-semibold text-gray-900">
                                    {emp.iccid}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {category.evalitems.map((item, i) => (
                            <tr key={item.name} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                <td className="w-90 py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {item.name}
                                </td>
                                {staff.map((emp, i) => (
                                    <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                                        {
                                            showSelf ?
                                                <div className="flex justify-center">
                                                    <div className='font-bold'>
                                                        {item["super_" + emp.uid]}
                                                    </div>
                                                    <div className='ml-4 text-secondary'>
                                                        {item["self_" + emp.uid]}
                                                    </div>
                                                </div>
                                                :
                                                <div className="flex justify-center">
                                                    <div className='font-bold'>
                                                        {item["super_" + emp.uid]}
                                                    </div>
                                                </div>
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div >
    )
}

export default EvalTable