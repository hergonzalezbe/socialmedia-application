// frontend/src/App.tsx

import React from 'react';
import type { ReactNode } from 'react'; // Importamos ReactNode como tipo
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Importamos useAuth

import Login from './pages/Login';
import Home from './pages/Home'; 

// Componente que verifica si el usuario está autenticado para mostrar el contenido
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Si no está autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }
  // Si está autenticado, muestra el contenido
  return <>{children}</>;
};

const App: React.FC = () => {
  const { logout, user } = useAuth();
  
  return (
    <div style={{ textAlign: 'center' }}>
      
      {/* Encabezado fijo con la información del usuario y botón de logout */}
      <header style={{ background: '#333', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Social Media App</h1>
        {user && ( // Solo muestra esto si hay un usuario logueado
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '16px' }}>Bienvenido, **{user.firstName}**!</span>
            <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>
      
      {/* Definición de Rutas */}
      <Routes>
        {/* Ruta de Login (pública) */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta Principal (protegida por el ProtectedRoute) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        {/* Cualquier otra ruta redirige al Home (que a su vez redirigirá al Login si no hay sesión) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;