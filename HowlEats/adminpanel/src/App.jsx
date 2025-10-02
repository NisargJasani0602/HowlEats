import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Menubar from './components/Menubar/Menubar';
import Sidebar from './components/Sidebar/Sidebar';
import Orders from './components/Pages/Orders/Orders';
import AddFood from './components/Pages/AddFood/AddFood';
import ListFood from './components/Pages/ListFood/ListFood';
import { ToastContainer} from 'react-toastify';

const App = () => {
  const [sidebarVisible, setSidebarVisible] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  return (
    <div className="d-flex" id="wrapper">
            
            <Sidebar sidebarVisible={sidebarVisible}/>

            <div id="page-content-wrapper">

                <Menubar  toggleSidebar={toggleSidebar}/>
                <ToastContainer position='top-right' autoClose={3000} />

                <div className="container-fluid">
                    <Routes>
                      <Route path='/add' element={<AddFood />} />
                      <Route path='/list' element={<ListFood />} />
                      <Route path='/order' element={<Orders />} />
                      <Route path='/' element={<ListFood />} />
                    </Routes>
                </div>
            </div>
        </div>
  )
}

export default App
