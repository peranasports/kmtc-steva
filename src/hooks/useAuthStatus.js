import { useState, useEffect, useRef } from "react";

// Firebase Authentication
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase.config";
import { toast } from "react-toastify";

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();

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
              return empls.push({
                  id: doc.id,
                  data: doc.data(),
              });
          });
          if (empls.length > 0)
          {
            var empl = empls[0].data
            setEmployee(empl);
          }
          } catch (error) {
            console.log(error)
        }
    
        // try {
        //     if (user === null)
        //     {
        //         setEmployee(null)
        //         return
        //     }
        //     const docRef = doc(db, "employees", user.uid);
        //     const docSnap = await getDoc(docRef);
            
        //     if (docSnap.exists()) {
        //       console.log("Document data:", docSnap.data());
        //     } else {
        //       // doc.data() will be undefined in this case
        //       console.log("No such document!");
        //     }
        //     setEmployee(docSnap.data());
        // } catch (error) {
        //     toast.error("Could not fetch employee");
        // }
    };

      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
          setCurrentUser(user);
          fetchEmployee(user);
        }
        else
        {
          setCurrentUser(null)
          setEmployee(null)
        }
        setCheckingStatus(false);
      });
    }

    return () => {
        isMounted.current = false;
    }
  }, [isMounted]);

  return { loggedIn, currentUser, employee, checkingStatus };
};

// Protected routes in V6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory Leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
