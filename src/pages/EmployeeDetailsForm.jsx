import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import Spinner from '../components/Spinner';
import { db } from "../firebase.config";
import { doc, setDoc } from "firebase/firestore";

function EmployeeDetailsForm() {
    const [loading, setLoading] = useState(false);
    const location = useLocation()
    const { employee, departments } = location.state
    const [alldeps, setAlldeps] = useState([])
    const [selecteddeps, setSelecteddeps] = useState([])
    const refActive = useRef(null)
    const [formData, setFormData] = useState({
        name: employee ? employee.name : '',
        iccid: employee ? employee.iccid : '',
        emailAddress: employee ? employee.emailAddress : '',
        active: employee ? employee.active : true,
        assessor: employee ? employee.assessor : '',
        port: employee ? employee.port : '',
        department: employee ? employee.department : '',
        position: employee ? employee.position : 'Staff',
        role: employee ? employee.role : 1,
        teamsManaged: employee ? employee.teamsManaged : ''
    });
    const {
        name,
        iccid,
        emailAddress,
        active,
        port,
        department,
        position,
        role,
        assessor,
        teamsManaged,
    } = formData
    
    function handleSelect(data) {
        setSelecteddeps(data);
        var s = ''
        for (var ns=0; ns<data.length; ns++)
        {
            if (s.length > 0) s += '-'
            s += data[ns].value
        }
        formData.teamsManaged = s
    }

    const onMutate = (e) => {
        let boolean = null;

        // Booleans
        if (e.target.value === "true") {
            boolean = true;
        }

        if (e.target.value === "false") {
            boolean = false;
        }

        // Text/Booleans/Numbers
        if (!e.target.files) {
            // ?? if the value on the left is null use the other value
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }));
        }
    };

    useEffect(() => {
        var deps = []
        for (var n=0; n<departments.length; n++)
        {
            var dep = departments[n]
            deps.push({ value: dep.id, label: dep.port + "-" + dep.code })
        }
        setAlldeps(deps)

        if (employee.teamsManaged !== undefined)
        {
            var sels = []
            var tokens = employee.teamsManaged.split('-')
            for (var nt=0; nt<tokens.length; nt++)
            {
                for (var n=0; n<departments.length; n++)
                {
                    var dep = departments[n]
                    if (dep.id === Number.parseInt(tokens[nt]))
                    {
                        sels.push({ value: dep.id, label: dep.port + "-" + dep.code })
                        break
                    }
                }
            }
            setSelecteddeps(sels)
        }

    }, [employee])

    const onSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        employee.name = formData.name
        employee.iccid = iccid
        employee.emailAddress = emailAddress
        employee.active = refActive.current.checked
        employee.port = formData.port
        employee.department = formData.department
        employee.position = formData.position
        employee.role = formData.role
        if (formData.assessor !== undefined)
        {
            employee.assessor = formData.assessor
        }

        if (selecteddeps && selecteddeps.length > 0)
        {
            var s = ''
            for (var ns=0; ns<selecteddeps.length; ns++)
            {
                if (s.length > 0) s += '-'
                s += selecteddeps[ns].value
            }
            employee.teamsManaged = s
        }

        try {
            // make sure it's docId and not uid
            await setDoc(doc(db, "employees", employee.docId), employee);            
        } catch (error) {
            console.log(error.message)
        }
        setLoading(false);
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <form className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div className="pt-8">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-base-900">Personal Information</h3>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="name" className="block text-sm font-medium text-base-700">
                                Full Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    autoComplete="name"
                                    value={name}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="iccid" className="block text-sm font-medium text-base-700">
                                ICCID
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="iccid"
                                    id="iccid"
                                    autoComplete="iccid"
                                    value={iccid}
                                    onChange={onMutate}
                                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="emailAddress" className="block text-sm font-medium text-base-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="emailAddress"
                                    name="emailAddress"
                                    type="email"
                                    autoComplete="emailAddress"
                                    value={emailAddress}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="active" className="block text-sm font-medium text-base-700">
                                Active
                            </label>
                            <div className="mt-1">
                                <input ref={refActive}
                                    id="active"
                                    name="active"
                                    type="checkbox"
                                    defaultChecked={employee.active}
                                    value={active}
                                    onChange={onMutate}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="port" className="block text-sm font-medium text-base-700">
                                Port
                            </label>
                            <div className="mt-1">
                                <select
                                    id="port"
                                    name="port"
                                    autoComplete="port-name"
                                    value={port}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option>SGN</option>
                                    <option>HPH</option>
                                    <option>HAN</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="department" className="block text-sm font-medium text-base-700">
                                Department
                            </label>
                            <div className="mt-1">
                                <select
                                    id="department"
                                    name="department"
                                    autoComplete="department-name"
                                    value={department}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option>ACC</option>
                                    <option>ADMIN</option>
                                    <option>BOD</option>
                                    <option>CMS</option>
                                    <option>CS</option>
                                    <option>EQC</option>
                                    <option>GM</option>
                                    <option>IBDOC</option>
                                    <option>IT</option>
                                    <option>OBDOC</option>
                                    <option>OPS</option>
                                    <option>SALES</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="position" className="block text-sm font-medium text-base-700">
                                Position
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="position"
                                    id="position"
                                    autoComplete="position"
                                    value={position}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="role" className="block text-sm font-medium text-base-700">
                                Role
                            </label>
                            <div className="mt-1">
                                <select
                                    id="role"
                                    name="role"
                                    autoComplete="role"
                                    value={role}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>8</option>
                                    <option>9</option>
                                    <option>10</option>
                                </select>
                            </div>
                        </div>
                        <div className="sm:col-span-4 text-sm">
                            <label htmlFor="comments" className="font-medium text-base-700">
                                Notes on roles:
                            </label>
                            <p className="text-base-500">1: Staff, 2: Section Chief, 3: Assistant Team Leader, 4: Team Leader, 8-9: BOD, 10: General Manager</p>
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="assessor" className="block text-sm font-medium text-base-700">
                                Evaluated by
                            </label>
                            <div className="mt-1">
                                <input
                                    id="assessor"
                                    name="assessor"
                                    type="text"
                                    autoComplete="assessor"
                                    value={assessor}
                                    onChange={onMutate}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-4">
                            <label htmlFor="role" className="block text-sm font-medium text-base-700">
                                Other departments to evaluate
                            </label>
                            <div className="mt-1">
                                <Select
                                    id="teamsManaged"
                                    name="teamsManaged"
                                    onChange={handleSelect}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    options={alldeps}
                                    value={selecteddeps}
                                    isMulti
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-base-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    )
}

export default EmployeeDetailsForm