import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MyHome from './pages/lyout/myHome';
import Login from './pages/lyout/login';
import Manage from './pages/lyout/mange';
import PPTModule from './pages/generate/PPT/PPTModule'
import PPTplayer from './pages/generate/PPT/PPTplayer';
import Profile from './pages/mine/profile';
import VideoDe from './pages/detail/videoDe.jsx'
import PPTDe from './pages/detail/PPTDe'
import TeacherPlanDe from './pages/detail/teacherPlanDe';
import FlowCharDe from './pages/detail/flowChartDe.jsx';
import '@icon-park/react/styles/index.css'; // 确保样式在这里
import 'antd/dist/antd.css';
// 正确的样式引入

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<MyHome />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Mange" element={<Manage />} />
          <Route path="/Mange/:module" element={<Manage />} />
          <Route path="/Mange/:module/:resource" element={<Manage />} />
          <Route path="/PPTModule" element={<PPTModule />} />
          <Route path="/PPTplayer" element={<PPTplayer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/VideoDe/:id" element={<VideoDe />} />
          <Route path="/PPTDe/:id" element={<PPTDe />} />
          <Route path="/TeacherPlanDe/:id" element={<TeacherPlanDe />} />
          <Route path="/FlowCharDe/:id" element={<FlowCharDe />} />

        </Routes>
      </Router>
  );
}

export default App;
