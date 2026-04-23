import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import './App.css'

import LoginPage               from './pages/LoginPage'
import RegisterPage            from './pages/RegisterPage'
import OverviewPage            from './pages/OverviewPage'
import ProjectsPage            from './pages/ProjectsPage'
import ProjectDetailPage       from './pages/ProjectDetailPage'
import ProjectEditPage         from './pages/ProjectEditPage'
import NewProjectPage          from './pages/NewProjectPage'
import NewRetrospectivePage    from './pages/NewRetrospectivePage'
import RetrospectiveBoardPage  from './pages/RetrospectiveBoardPage'
import ProfilePage             from './pages/ProfilePage'

// Layout for authenticated pages: sidebar + content
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/"                                               element={<Navigate to="/projects" replace />} />
          <Route path="/overview"                                       element={<OverviewPage />} />
          <Route path="/projects"                                       element={<ProjectsPage />} />
          <Route path="/projects/new"                                   element={<NewProjectPage />} />
          <Route path="/projects/:projectId"                            element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/edit"                       element={<ProjectEditPage />} />
          <Route path="/projects/:projectId/retrospectives/new"        element={<NewRetrospectivePage />} />
          <Route path="/retrospectives/:retroId"                        element={<RetrospectiveBoardPage />} />
          <Route path="/profile"                                        element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*"        element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
