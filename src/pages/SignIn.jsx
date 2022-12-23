import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { setDoc, doc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase.config";

// Icons
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

// Firebase Authentication
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";

// React Toastify
import { toast } from "react-toastify";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const fetchEmployee = async (user) => {
    try {
      const eRef = collection(db, "employees");
      const q = query(
        eRef,
        where("uid", "==", user.uid)
      );
      const querySnap = await getDocs(q);
      const empls = [];
      querySnap.forEach((doc) => {
        return empls.push(doc.data());
      });
      if (empls.length > 0) {
        var empl = empls[0]
      }
      else {
        const q2 = query(
          eRef,
          where("emailAddress", "==", user.email)
        );
        const querySnap2 = await getDocs(q2);
        querySnap2.forEach((doc) => {
          return empls.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        if (empls.length > 0) {
          var empl = empls[0].data
          empl.uid = user.uid
          await setDoc(doc(db, "employees", empls[0].id), empl);
        }
      }
    } catch (error) {
      console.log(error)
    }
    return empl
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {


        var employee = await fetchEmployee(userCredential.user)
        console.log(employee.role + " " + employee.name)
        if (employee.role >= 9) {
          navigate('/gmpage', { state: employee })
        }
        else {
          navigate('/locked')
          // navigate(`/employee/${userCredential.user.uid}`)
        }
      }
    } catch (error) {
      toast.error("Error Signing In\n" + error.message);
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader mt-10 text-xl">Welcome Back!</p>
        </header>

        <main>
          <form className=" max-w-md" onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              className='w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black'
              // className="emailInput"
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative mt-10 mb-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className='w-full pr-40 bg-gray-200 input text-xl input-md text-black'
                // className="passwordInput"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
              {/* <button
                type='submit'
                className='absolute mt-10 top-0 right-0 rounded-l-none w-36 btn btn-lg'>
                Go
              </button> */}

              <img
                src={visibilityIcon}
                className="showPassword absolute top-0 bg-slate-600 right-0 rounded-l-none w-24 btn btn-md"
                alt="Show Password"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>

            <Link to="/forgot-password" className="forgotPasswordLink link link-error text-xl">
              Forgot Password
            </Link>

            <div className="signInBar">
              <button
                className="signInButton mt-10 w-40 btn btn-lg">
                Sign In
              </button>
            </div>
          </form>
          <div className="mt-10">
            <Link to="/sign-up" className="btn btn-lg w-40 bg-blue-800">
              Sign Up
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;
