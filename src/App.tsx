import './App.css'
import {QueryClientProvider} from 'react-query';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import {AuthProvider} from './contexts/AuthProvider';
import ChatPage from './pages/ChatPage/ChatPage';
import {RequireAuth, RequireNoAuth} from "./components/control/RequireAuth";
import {queryClient} from "./queryClient.ts";
import {RequireVerification} from "./components/control/RequireVerification.tsx";
import {VerificationPage} from "./pages/VerificationPage/VerificationPage.tsx";
import {ForgotPasswordPage} from "./pages/ForgotPasswordPage/ForgotPasswordPage.tsx";


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/" element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/chat"/>} />
              <Route path="/" element={<RequireVerification />}>
                <Route path="/chat" element={<Navigate to="/chat/new" />}/>
                <Route path="/chat/:chatId" element={<ChatPage />}/>
              </Route>
            </Route>
            <Route path="/" element={<RequireNoAuth />}>
              <Route path='/register' element={<RegisterPage />}/>
              <Route path='/login' element={<LoginPage />}/>
              <Route path='/forgot-password' element={<ForgotPasswordPage />}/>
            </Route>
            <Route path='*' element={<Navigate to="/" />}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      {/*<ReactQueryDevtools initialIsOpen={false} />*/}
    </QueryClientProvider>
  );
}

export default App;
