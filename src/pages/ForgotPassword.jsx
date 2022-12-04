import { Link } from "react-router-dom";
import { useState } from "react";

// Firebase Authentication
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// Icons
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";

// Toast
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const onChange = (e) => setEmail(e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();

      await sendPasswordResetEmail(auth, email);

      toast.success("Email was sent");
    } catch (error) {
      toast.error("Could not send reset email");
    }
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader mt-10 text-xl">Forgot Password</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            id="email"
            className='w-full my-10 pr-40 bg-gray-200 input text-xl input-md text-black'
            placeholder="Email"
            value={email}
            onChange={onChange}
          />

          <Link className="forgotPasswordLink mt-10 text-xl" to="/sign-in">
            Sign In
          </Link>

          <div className="signInBar">
            <button className="signInButton mt-10 top-0 right-0 rounded-l-none btn btn-lg">
              Send Reset Email
            </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default ForgotPassword;
