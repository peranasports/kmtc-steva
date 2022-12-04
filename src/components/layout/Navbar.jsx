import KMTCLogo from '../../assets/logo512.png'
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import PropsType from 'prop-types'
import { useAuthStatus } from "../../hooks/useAuthStatus";
import { getAuth } from 'firebase/auth'

function Navbar({ title }) {
    const { loggedIn, currentUser, employee, checkingStatus } = useAuthStatus();
    const navigate = useNavigate()

    const doLogout = () =>
    {
        var auth = getAuth()
        auth.signOut()
        navigate('/sign-in')
    }

    const getID = () =>
    {
        return currentUser.email
    }

    useEffect(() => {

    }, [loggedIn])

    return <nav className='navbar shadow-lg bg-blue-800 text-neutral-content'>
        <div className='container mx-auto'>
            <div className='px-2 mx-2 space-x-4'>
                <img className='pt-1 h-8 w-30' alt='' src={KMTCLogo} />
                <Link to='/' className='text-xl text-white w-20 pt-1 font-bold align-middle'>
                    {title}
                </Link>
            </div>
            <div className='flex-1 px2 mx-2'>
                <div className='flex justify-end'>
                    <Link to='/' className='btn btn-ghost btn-sm rounded-btn'>
                        Home
                    </Link>
                    <Link to='/about' className='btn btn-ghost btn-sm rounded-btn'>
                        About
                    </Link>
                </div>
                {
                    currentUser === null ? <></> :
                        <div className='flex justify-end'>
                            <p className='mt-1 mr-4 text-md font-medium'>
                                {getID()}
                            </p>
                            <button
                                className="logoutButton mb-2 btn btn-sm"
                                onClick={doLogout}
                            >
                                Log out
                            </button>

                        </div>
                }
            </div>
        </div>
    </nav>
}

Navbar.defaultProps = {
    title: 'Staff Evaluation'
}

Navbar.PropsType = {
    title: PropsType.string,
}
export default Navbar