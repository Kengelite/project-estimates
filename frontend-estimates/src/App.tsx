import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import Dashboard from "./pages/admin/dashboard";
import AppLayout from "./components/nav/AppLayout";
import CourseList from "./pages/admin/course";
import SubjectManagement from "./pages/admin/subjects";
import FundManagement from "./pages/admin/fund";
import CentralDeptManagement from "./pages/admin/central";
import UniversityWorkManagement from "./pages/admin/universitywork";
import CurriculumManagement from "./pages/admin/curriculum";
import BudgetSummarySelection from "./pages/admin/budgetsummary";
import BudgetSummaryManagement from "./pages/admin/budgetSummarymanagement";
import ImportDataPage from "./pages/admin/importdataPage";
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
          <Route path="/funds" element={<FundManagement />} />
          <Route path="/central" element={<CentralDeptManagement />} />
          <Route path="/curriculum" element={<CurriculumManagement />} />
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
          <Route
            path="/import-data"
            element={<ImportDataPage />}
          />


          
        </Route>
      </Routes>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;
