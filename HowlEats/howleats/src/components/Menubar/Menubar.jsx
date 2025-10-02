import React from 'react';
import './Menubar.css';
import {assets} from '../../assets/assets'; 
import {Link, useNavigate} from 'react-router-dom';
import { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';


const Menubar = () => {
  const [active, setActive] = useState('home');
  const {quantities, token, setToken, setQuantities} = useContext(StoreContext);
  const uniqueItemsInCart = Object.values(quantities).filter(qty => qty > 0).length;
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setToken("");
    setQuantities({});
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container"> 
        <Link to="/"><img src={assets.logo} alt="" className='mx-4 rounded-4' height={80} width={90}/></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={active === 'home' ? "nav-link fw-bold active" : "nav-link"} to="/" onClick={() => setActive('home')}>Home</Link>
            </li>
            <li className="nav-item">
            <Link className={active === 'explore' ? "nav-link fw-bold active" : "nav-link"} to="/explore" onClick={() => setActive('explore')}>Explore</Link>
            </li>
            <li className="nav-item">
            <Link className={active === 'contact-us' ? "nav-link fw-bold active" : "nav-link"} to="/contact" onClick={() => setActive('contact-us')}>Contact Us</Link>
            </li>
          </ul>
          {/* <form className="d-flex" role="search">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form> */}
          <div className="d-flex align-items-center gap-4">
            <Link to={`/cart`}>
              <div className="position-relative">
                <img src={assets.cart} alt="Cart" height={32} width={32} className="position-relative" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                  {uniqueItemsInCart}
                </span>
              </div>
            </Link>
            {!token ? (
              <>
                <button className="btn btn-outline-primary btn-small" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-outline-success btn-small" onClick={() => navigate('/register')}>Register</button>
              </>
            ) : (
              <div className="dropdown text-end">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 dropdown-toggle profile-btn"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img src={assets.profile} alt="Profile" width={32} height={32} className="rounded-circle border" />
                  <span className="fw-semibold">Account</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end text-small" aria-labelledby="profileDropdown">
                  <li>
                    <button className="dropdown-item" onClick={() => navigate('/myorders')}>Orders</button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>Logout</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Menubar;
