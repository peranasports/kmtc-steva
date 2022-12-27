import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleIcon, ChevronRightIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import Spinner from "./../components/Spinner";
import head from '../assets/avatars/head.png'
import { orderBy } from 'lodash';

// Firebase Database
import { db } from "../firebase.config";

// Firebase Firestore
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";

// Firebase Storage
import {
    uploadBytesResumable,
    getDownloadURL,
    getStorage,
    ref,
} from "firebase/storage";

function DepartmentEditor() {
    const location = useLocation()
    const { department, departments } = location.state;
    const [currentEmployee, setCurrentEmployee] = useState(null)
    const [loading, setLoading] = useState(false);
    const [showInactiveStaff, setShowInactiveStaff] = useState(false)
    const navigate = useNavigate()
    const inputFile = useRef(null)

    useEffect(() => {
    },)

    const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage();

            const fileName = `${currentEmployee.iccid}-${image.name}`;

            const storageRef = ref(storage, `images/${fileName}`);

            const uploadTask = uploadBytesResumable(storageRef, image);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    console.log("Upload is " + progress + "% done");

                    switch (snapshot.state) {
                        case "paused":
                            console.log("Upload is paused");
                            break;
                        case "running":
                            console.log("Upload is running");
                            break;
                        default:
                            break;
                    }
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };


    const getRandomAvatar = (emp) => {
        var names = emp.name.split(' ')
        if (names[0] === 'Mr.') {
            var n = Math.ceil(Math.random(9)).toString()
            return '../assets/avatars/man_1.png'
            // return '../assets/avatars/man_' + n + '.png'
        }
        else {
            var n = Math.ceil(Math.random(9)).toString()
            return '../assets/avatars/man_1.png'
            // return '../assets/avatars/girl_' + n + '.png'
        }
    }

    const onMutate = async (e) => {
        // File
        if (e.target.files) {
            setLoading(true);
            currentEmployee.photoUrl = await storeImage(e.target.files[0])
            console.log(currentEmployee.photoUrl)
            if (currentEmployee.photoUrl) {
                await setDoc(doc(db, "employees", currentEmployee.docId), currentEmployee);
            }
            setLoading(false);
        }
    }

    const getPhoto = (emp) => {
        setCurrentEmployee(emp)
        inputFile.current.click();
    }

    const doEmployeeDetails = (emp) => {
        navigate('/employeedetails', { state: { employee: emp, departments: departments, department: department } })
    }

    const doStaffEval = (emp) => {
        navigate('/staffeval', { state: emp })
    }

    const doAddNewStaff = () => {
        var emp = {
            department: department.code,
            depcode: department.id,
            port: department.port,
            role: 1,
            active: true,
        }
        doEmployeeDetails(emp)
    }

    const employeesList = () => {
        if (showInactiveStaff)
        {
            return orderBy(department.employees, ['active', 'role'], ['desc', 'desc'])
        }
        else
        {
            return orderBy(department.employees.filter(obj => obj.active === true), ['role'], ['desc'])
        }
    }

    if (department === undefined) {
        return <></>
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <>
            <div className="flex justify-between mt-2">
                <div className="">
                    <button className="btn btn-sm bg-blue-800 text-white" onClick={() => {navigate('/gmpage')}}>BACK</button>
                    <button className="btn btn-sm mx-2 bg-blue-800 text-white" onClick={() => doAddNewStaff()}>ADD NEW STAFF</button>
                </div>
                <div className="form-control">
                    <label className="cursor-pointer label">
                        <span className="label-text mr-4">SHOW INACTIVE STAFF</span>
                        <input type="checkbox" onClick={() => setShowInactiveStaff(!showInactiveStaff)} defaultChecked={showInactiveStaff} className="checkbox checkbox-secondary" />
                    </label>
                </div>
            </div>
            <div>
                <p className="my-6 text-2xl text-white">{department.name.toUpperCase()}</p>
            </div>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {employeesList().map((emp) => (
                        <li key={emp.emailAddress}>
                            <a href={emp.href} className="block hover:bg-gray-50">
                                <div className="flex items-center px-4 py-4 sm:px-6">
                                    <div className="flex min-w-0 flex-1 items-center">
                                        <div className="flex-shrink-0">
                                            <div className="avatar">
                                                <div className="w-12 rounded-xl">
                                                    <input type='file' id='file' ref={inputFile} onChange={onMutate} style={{ display: 'none' }} />
                                                    <img className="cursor-pointer" src={emp.photoUrl ? emp.photoUrl : head} alt="" onClick={() => getPhoto(emp)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                            <div>
                                                <p className="truncate text-sm font-medium text-indigo-600">{emp.name}</p>
                                                {
                                                    emp.active === false ?
                                                    <p className="truncate text-sm font-medium text-indigo-600"> (inactive)</p>
                                                    :
                                                    <div></div>
                                                }
                                                <p className="mt-2 flex items-center text-sm text-gray-500">
                                                    <EnvelopeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                                    <span className="truncate">{emp.emailAddress}</span>
                                                </p>
                                            </div>
                                            <div className="hidden md:block">
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        {emp.position}
                                                    </p>
                                                    <p className="cursor-pointer mt-2 flex items-center text-sm text-gray-500">
                                                        <CheckCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-green-400" aria-hidden="true" onClick={() => doStaffEval(emp)} />
                                                        {/* {application.stage} */}
                                                    </p>
                                                    <p className="cursor-pointer mt-2 flex items-center text-sm text-gray-500">
                                                        <UserCircleIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-blue-400" aria-hidden="true" onClick={() => doEmployeeDetails(emp)} />
                                                        {/* {application.stage} */}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default DepartmentEditor