import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ManageUser from './pages/manage/ManageUser';
import Organizer from './pages/Organizer';
import Nopage from './pages/error/Nopage';
import Feedback from './pages/Feedback';
import Account from './pages/Account';
import Assessment from './pages/Assessment';

export default function App(){
  return(
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login/>} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/maintenance" element={<Maintenance/>}/>
          <Route path="/manage-user" element={<ManageUser/>}/>
          <Route path="/organizer" element={<Organizer/>}/>
          <Route path="/Assessment" element={<Assessment/>}/>
          <Route path="/feedback" element={<Feedback/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="*" element={<Nopage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}