import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import PrivateRoute from "./components/PrivateRoute";
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ForgotPassword from "./pages/ForgotPassword";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EvaluationPage from './pages/EvaluationPage'
import StaffComments from './pages/StaffComments';
import EmployeePage from './pages/EmployeePage';
import GMPage from './pages/GMPage';
import DepartmentEvaluationReport from './pages/DepartmentEvaluationReport';
import StaffEvaluationReport from './pages/StaffEvaluationReport';
import StaffManagement from './pages/StaffManagement';
import AllEvaluations from './pages/AllEvaluations';
import DepartmentEditor from './pages/DepartmentEditor';

// React Toastify
import { ToastContainer } from "react-toastify";

// Styles
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Router>
        <div className='flex flex-col h-screen'>
          <Navbar />
          <main className='container mx-auto px-3 pb-12'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gmpage" element={<GMPage />} />
              <Route path="/departmenteditor" element={<DepartmentEditor />} />
              <Route path="/staffmanagement" element={<StaffManagement />} />
              <Route path="/allevals" element={<AllEvaluations />} />
              <Route path="/departmenteval" element={<DepartmentEvaluationReport />} />
              <Route path="/staffeval" element={<StaffEvaluationReport />} />
              <Route path="/employee/:userUid" element={<PrivateRoute />}>
                <Route path='/employee/:userUid' element={<EmployeePage />} />
              </Route>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/evaluation" element={<PrivateRoute />}>
                <Route path='/evaluation' element={<EvaluationPage />} />
              </Route>
              <Route path="/staff-comments" element={<StaffComments />} />

              {/* <Route path='/session/:sessionId' element={<Session />} /> */}
              {/* <Route path='/about' element={<About />} />
    <Route path='/player/:playerId' element={<Player />} />
    <Route path='/filtersanalysis/:matchIds/:playerId' element={<FiltersAnalysis />} />
    <Route path='/playlist/:playerId' element={<Playlist />} />
    <Route path='/filtersvideo' element={<FiltersVideo />} />
    <Route path='/notfound' element={<NotFound />} /> */}
              <Route path='/*' element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
