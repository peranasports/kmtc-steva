import { useLocation } from 'react-router-dom'

function Locked() {
    const location = useLocation()
    const employee = location.state
    return (
        <div>
            {
                employee.active === false ?
                <p>
                    You are no longer an active employee of KMTC.
                </p>
                :
                <p>
                    Staff evaluation for the year 2022 has now completed. Thank you for your participation.
                </p>
            }
        </div>
    )
}

export default Locked