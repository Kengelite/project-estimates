import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import Dashboard from "./pages/admin/dashboard";
import AppLayout from "./components/nav/AppLayout";
import CourseList from "./pages/admin/course/course";
import SubjectManagement from "./pages/admin/subject/subjects";
import FundManagement from "./pages/admin/fund";
import CentralDeptManagement from "./pages/admin/central";
import UniversityWorkManagement from "./pages/admin/universitywork";
import CurriculumManagement from "./pages/admin/curriculum/curriculum";
import BudgetSummarySelection from "./pages/admin/budgetsummary";
import BudgetSummaryManagement from "./pages/admin/budgetSummarymanagement";
import ImportDataPage from "./pages/admin/importdataPage";
import CourseDetail from "./pages/admin/course/coursedetail";
import EditCourse from "./pages/admin/course/editcourse";
import SubjectDetail from "./pages/admin/subject/subjectdetail";
import EditSubjectDetail from "./pages/admin/subject/subjectedit";
function App() {
  return (
    //  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/subjects/:id" element={<SubjectDetail />} />
          <Route path="/subjects/edit/:id" element={<EditSubjectDetail />} />
          <Route path="/funds" element={<FundManagement />} />
          <Route path="/central" element={<CentralDeptManagement />} />
          <Route path="/curriculum" element={<CurriculumManagement />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/edit/:id" element={<EditCourse />} />
          <Route
            path="/university-work"
            element={<UniversityWorkManagement />}
          />
          <Route
            path="/annual-budget-summary"
            element={<BudgetSummarySelection />}
          />
          <Route
            path="/annual-budget-summary"
            element={<BudgetSummarySelection />}
          />
          <Route
            path="/annual-budget-management"
            element={<BudgetSummaryManagement />}
          />
          <Route path="/import-data" element={<ImportDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;
