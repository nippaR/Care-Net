// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Layouts  (⚠ keep names consistent with actual filenames)
import AdminLayout from "./layouts/AdminLayout";
import CareseekerLayout from "./layouts/CareSeekerLayout";
import CaregiverLayout from "./layouts/CaregiverLayout";

// Pages inside layouts
import AdminDashboard from "./pages/AdminDashboard";
import CareseekerDashboard from "./pages/CareseekerDashboard";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import CareseekerProfile from "./pages/CareseekerProfile";
import CaregiverProfile from "./pages/CaregiverProfile";
import CaregiverList from "./pages/CaregiverList";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Optional: root -> login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["ADMIN"]}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<div>Manage Users Page</div>} />
            <Route path="reports" element={<div>Reports Page</div>} />
            <Route path="profile" element={<Profile />} /> {/* ✅ header visible */}
          </Route>

          {/* Careseeker Routes */}
          <Route
            path="/careseeker"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["CARE_SEEKER"]}>
                  <CareseekerLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<CareseekerDashboard />} />
            <Route path="requests" element={<div>Requests Page</div>} />
            <Route path="profile" element={<CareseekerProfile />} />
            <Route path="caregivers-list" element={<CaregiverList />} />
          </Route>

          {/* Caregiver Routes */}
          <Route
            path="/caregiver"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["CAREGIVER"]}>
                  <CaregiverLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<CaregiverDashboard />} />
            <Route path="patients" element={<div>Patients Page</div>} />
            <Route path="schedule" element={<div>Schedule Page</div>} />
            <Route path="profile" element={<CaregiverProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="p-8">Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
