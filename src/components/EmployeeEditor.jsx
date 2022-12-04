import React from 'react'

function EmployeeEditor({ employee }) {
  return (
    <div>
        {employee.department}
        {employee.emailAddress}
    </div>
  )
}

export default EmployeeEditor