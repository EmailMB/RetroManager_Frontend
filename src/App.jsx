import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'

// Temporary placeholder rendered for routes not yet implemented.
// Will be replaced page by page in subsequent blocks.
function UnderConstruction({ name }) {
    return <div style={{ padding: 24 }}><h2>{name} — Under construction</h2></div>
}

function ProtectedRoute({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
    return (
        <>
            <NavBar />
            <main>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<UnderConstruction name="Login" />} />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/projects" replace />} />

                    {/* Projects — placeholder until T4.1 screens */}
                    <Route path="/projects" element={<ProtectedRoute><UnderConstruction name="Project List" /></ProtectedRoute>} />

                    {/* Retrospectives */}
                    <Route path="/projects/:projectId/retrospectives"     element={<ProtectedRoute><RetrospectiveListPage /></ProtectedRoute>} />
                    <Route path="/projects/:projectId/retrospectives/new" element={<ProtectedRoute><NewRetrospectivePage /></ProtectedRoute>} />
                    <Route path="/retrospectives/:retroId"                element={<ProtectedRoute><RetrospectiveDetailPage /></ProtectedRoute>} />
                    <Route path="/retrospectives/:retroId/edit"           element={<ProtectedRoute><UnderConstruction name="Edit Retrospective" /></ProtectedRoute>} />
                </Routes>
            </main>
        </>
    )
}

// Wraps a route that requires the user to be logged in.
// Redirects to /login if no token is found in the auth context.
function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<UnderConstruction name="Login" />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/projects" replace />} />

          {/* Projects */}
          <Route path="/projects" element={<ProtectedRoute><UnderConstruction name="Project List" /></ProtectedRoute>} />

          {/* Retrospectives (nested under a project) */}
          <Route path="/projects/:projectId/retrospectives"     element={<ProtectedRoute><UnderConstruction name="Retrospective List" /></ProtectedRoute>} />
          <Route path="/projects/:projectId/retrospectives/new" element={<ProtectedRoute><UnderConstruction name="New Retrospective" /></ProtectedRoute>} />

          {/* Retrospective detail and edit */}
            <Route path="/retrospectives/:retroId" element={<ProtectedRoute><UnderConstruction name="Retrospective Detail" /></ProtectedRoute>} />
          <Route path="/retrospectives/:retroId/edit"  element={<ProtectedRoute><UnderConstruction name="Edit Retrospective" /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
