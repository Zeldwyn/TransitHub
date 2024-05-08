import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ManageUser from './pages/ManageUser';
import Organizer from './pages/Organizer';
import Nopage from './pages/Nopage';
import Settings from './pages/Settings';
import Feedback from './pages/Feedback';

export default function App(){
  return(
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Login/>} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/maintenance" element={<Maintenance/>}/>
          <Route path="/manage-user" element={<ManageUser/>}/>
          <Route path="/organizer" element={<Organizer/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/feedback" element={<Feedback/>}/>
          <Route path="*" element={<Nopage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}