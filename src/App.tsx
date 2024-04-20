import './App.css'
import {QueryClientProvider} from 'react-query';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import {AuthProvider} from './contexts/AuthProvider';
import {RequireAuth, RequireNoAuth} from "./components/hoc/RequireAuth.tsx";
import {queryClient} from "./queryClient.ts";
import {RequireVerification} from "./components/hoc/RequireVerification.tsx";
import {VerificationPage} from "./pages/VerificationPage/VerificationPage.tsx";
import {lazyLoad} from "./utils/lazyLoading.ts";
import {Suspense} from "react";
import {ReactQueryDevtools} from "react-query/devtools";

const ChatPage = lazyLoad(import('./pages/ChatPage/ChatPage.tsx'), 'ChatPage');
const ForgotPasswordPage = lazyLoad(import('./pages/ForgotPasswordPage/ForgotPasswordPage.tsx'), 'ForgotPasswordPage');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/verification" element={<Suspense><VerificationPage /></Suspense>} />
            <Route path="/" element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/chat"/>} />
              <Route path="/" element={<RequireVerification />}>
                <Route path="/chat" element={<Navigate to="/chat/new" />}/>
                <Route path="/chat/:chatId" element={<Suspense><ChatPage /></Suspense>}/>
              </Route>
            </Route>
            <Route path="/" element={<RequireNoAuth />}>
              <Route path='/register' element={<Suspense><RegisterPage /></Suspense>}/>
              <Route path='/login' element={<Suspense><LoginPage /></Suspense>}/>
              <Route path='/forgot-password' element={<Suspense><ForgotPasswordPage /></Suspense>}/>
            </Route>
            <Route path='*' element={<Navigate to="/" />}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      { import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} /> }
    </QueryClientProvider>
  );
}

export default App;
