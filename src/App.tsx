import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import { AuthProvider } from './contexts/AuthProvider';
import { HomePage } from './pages/HomePage/HomePage';
import ChatPage from './pages/ChatPage/ChatPage';
import { RequireAuth, RequireNoAuth } from "./components/control/RequireAuth";

export const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RequireAuth />}>
              <Route path='/' element={<HomePage />}/>
              <Route path='/chat' element={<ChatPage />}/>
            </Route>
            <Route path="/" element={<RequireNoAuth />}>
              <Route path='/register' element={<RegisterPage />}/>
              <Route path='/login' element={<LoginPage />}/>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
