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
import {ComponentLoadSuspense} from "./components/hoc/ComponentLoadSuspense.tsx";
import {ReactQueryDevtools} from "react-query/devtools";

const ChatPage = lazyLoad(import('./pages/ChatPage/ChatPage.tsx'), 'ChatPage');
const ForgotPasswordPage = lazyLoad(import('./pages/ForgotPasswordPage/ForgotPasswordPage.tsx'), 'ForgotPasswordPage');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/verification" element={<ComponentLoadSuspense><VerificationPage /></ComponentLoadSuspense>} />
            <Route path="/" element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/chat"/>} />
              <Route path="/" element={<RequireVerification />}>
                <Route path="/chat" element={<Navigate to="/chat/new" />}/>
                <Route path="/chat/:chatId" element={<ComponentLoadSuspense><ChatPage /></ComponentLoadSuspense>}/>
              </Route>
            </Route>
            <Route path="/" element={<RequireNoAuth />}>
              <Route path='/register' element={<ComponentLoadSuspense><RegisterPage /></ComponentLoadSuspense>}/>
              <Route path='/login' element={<ComponentLoadSuspense><LoginPage /></ComponentLoadSuspense>}/>
              <Route path='/forgot-password' element={<ComponentLoadSuspense><ForgotPasswordPage /></ComponentLoadSuspense>}/>
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
