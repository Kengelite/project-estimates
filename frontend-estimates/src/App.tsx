import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import Dashboard from "./pages/admin/dashboard";
import AppLayout from "./components/nav/AppLayout";
import CourseList from "./pages/admin/course/course";
import SubjectManagement from "./pages/admin/subject/subjects";
import FundManagement from "./pages/admin/funds/fund";
import CentralDeptManagement from "./pages/admin/central/central";
import UniversityWorkManagement from "./pages/admin/university/universitywork";
import CurriculumManagement from "./pages/admin/curriculum/curriculum";
import BudgetSummarySelection from "./pages/admin/budgetsummary/budgetsummary";
import BudgetSummaryManagement from "./pages/admin/budgetmanagement/budgetSummarymanagement";
import BudgetSummaryView from "./pages/admin/budgetmanagement/BudgetSummaryView";
import ImportDataPage from "./pages/admin/importdataPage";
import CourseDetail from "./pages/admin/course/coursedetail";
import EditCourse from "./pages/admin/course/editcourse";
import SubjectDetail from "./pages/admin/subject/subjectdetail";
import EditSubjectDetail from "./pages/admin/subject/subjectedit";
import BudgetSummaryStep1 from "./pages/admin/budgetsummary/step/BudgetSummaryStep1";
import BudgetSummaryStep2 from "./pages/admin/budgetsummary/step/BudgetSummaryStep2";
import BudgetSummaryStep3 from "./pages/admin/budgetsummary/step/BudgetSummaryStep3";
import BudgetSummaryStep4 from "./pages/admin/budgetsummary/step/BudgetSummaryStep4";
import BudgetSummaryStep5 from "./pages/admin/budgetsummary/step/BudgetSummaryStep5";
import BudgetSummaryStep6 from "./pages/admin/budgetsummary/step/BudgetSummaryStep6";
import BudgetSummaryStep7 from "./pages/admin/budgetsummary/step/BudgetSummaryStep7";
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
            path="/annual-budget-summary/step1"
            element={<BudgetSummaryStep1 />}
          />
          <Route
            path="/annual-budget-summary/step2"
            element={<BudgetSummaryStep2 />}
          />
          <Route
            path="/annual-budget-summary/step3"
            element={<BudgetSummaryStep3 />}
          />
          <Route
            path="/annual-budget-summary/step4"
            element={<BudgetSummaryStep4 />}
          />
          <Route
            path="/annual-budget-summary/step5"
            element={<BudgetSummaryStep5 />}
          />
          <Route
            path="/annual-budget-summary/step6"
            element={<BudgetSummaryStep6 />}
          />
          <Route
            path="/annual-budget-summary/step7"
            element={<BudgetSummaryStep7 />}
          />


          <Route
            path="/annual-budget-management"
            element={<BudgetSummaryManagement />}
          />
           <Route
            path="/annual-budget-management/view"
            element={<BudgetSummaryView />}
          />
          <Route path="/import-data" element={<ImportDataPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;
