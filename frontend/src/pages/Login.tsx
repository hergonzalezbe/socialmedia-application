
import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api'; 
import type { UserProfile } from '../types/types'; 

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginResponse = await authApi.post('/login', { username, password });
      const { token } = loginResponse.data;

      if (!token) {
        throw new Error('Token no recibido del servidor.');
      }      
      const profileResponse = await authApi.get('/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });      

      const profile: UserProfile = profileResponse.data;     
      
      login(token, profile);
      navigate('/');

    } catch (err: unknown) { 
      
      console.error('Login error:', err);

      
      const axiosError = err as { 
        response?: { 
          data?: { 
            message?: string 
          } 
        } 
      };      
      
      const errorMessage = axiosError.response?.data?.message || 'Error de conexión o credenciales inválidas.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '15px' }}>
          <label>Usuario (Ej: alice_alias):</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña (Ej: pass123):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;