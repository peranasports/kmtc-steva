import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// Icons
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

// Firebase Authentication
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
} from "firebase/auth";

import { setDoc, doc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

// React Toastify
import { toast } from "react-toastify";
import { async } from "@firebase/util";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const updateEmployeeRecord = async (user) =>
  {
    try {
      const eRef = collection(db, "employees");
      const q = query(
          eRef,
          where("emailAddress", "==", user.email)
      );
      const querySnap = await getDocs(q);
      const empls = [];
      querySnap.forEach((doc) => {
          return empls.push({
              id: doc.id,
              data: doc.data(),
          });
      });
      if (empls.length > 0)
      {
        var empl = empls[0].data
        empl.uid = user.uid
        await setDoc(doc(db, "employees", empls[0].id), empl);
      }
      } catch (error) {
        console.log(error)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      updateEmployeeRecord(user)

      updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = { ...formData };

      delete formDataCopy.password;

      formDataCopy.timestamp = serverTimestamp();

      // setDoc what updates to users collections
      // doc holds the configuration - user.uid the key
      // second parameter is the object to be saved
      await setDoc(doc(db, "users", user.uid), formDataCopy);

      navigate(`/employee/${user.uid}`);
    } catch (error) {
      toast.error("Error signing up\n" + error.message);
    }
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader mt-10 text-xl">Sign up</p>
        </header>

        <main>
          <form className=" max-w-md" onSubmit={onSubmit}>
            {/* <input
              type="text"
              id="name"
              className='w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black'
              placeholder="Name"
              value={name}
              onChange={onChange}
            /> */}

            <input
              type="email"
              id="email"
              className='w-full mt-10 pr-40 bg-gray-200 input text-xl input-md text-black'
              placeholder="Email"
              value={email}
              onChange={onChange}
            />

            <div className="passwordInputDiv relative my-10">
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

            <div className="signUpBar">
              <button
                className="signUpButton mt-10 top-0 right-0 rounded-l-none w-36 btn btn-lg">
                Sign Up
              </button>
            </div>
          </form>

          <div className="mt-10">
            <Link to="/sign-in" className="registerLink link link-success text-xl">
              Sign In Instead
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignUp;
