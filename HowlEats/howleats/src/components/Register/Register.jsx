import React from 'react';
import "./Register.css"
import { Link, useNavigate } from 'react-router-dom';
import japanese from '../../assets/japanese.png';
import { useState } from 'react';
import {toast} from 'react-toastify';
import { registerUser } from '../../service/authService';

const Register = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({...data, [name]: value}));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        console.log(data);
        try {
            const response = await registerUser(data);
            if(response.status === 201) {
                toast.success("Registration Completed. Please login")
                navigate('/login');
            } else {
                toast.error("Unable to register. Please try again");
            }
        } catch {
            toast.error("Unable to register. Please try again");
        }
    };

  return (
    <div className="register-bg mt-10">
    <div className="container register-container">
        <div className="card-img-left d-none d-md-flex" style={{ backgroundImage: `url(${japanese})` }} />
        <div className="row">
        <div className="col-lg-10 col-xl-9 mx-auto">
            <div className="card flex-row my-5 border-0 shadow rounded-3 overflow-hidden">
            <div className="card-img-left d-none d-md-flex">
            </div>
            <div className="card-body p-4 p-sm-5">
                <h5 className="card-title text-center mb-5 fw-bold fs-5">Register</h5>
                <form onSubmit={onSubmitHandler}>

                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingInputUsername" placeholder="myusername" 
                    name="name" onChange={onChangeHandler} value={data.name} required autoFocus/>
                    <label htmlFor="floatingInputUsername">Username</label>
                </div>

                <div className="form-floating mb-3">
                    <input type="email" className="form-control" id="floatingInputEmail" placeholder="name@example.com"
                    name="email" onChange={onChangeHandler} value={data.email} required/>
                    <label htmlFor="floatingInputEmail">Email address</label>
                </div>

                <hr/>

                <div className="form-floating mb-3">
                    <input type="password" className="form-control" id="floatingPassword" placeholder="Password"
                    name="password" onChange={onChangeHandler} value={data.password} required/>
                    <label htmlFor="floatingPassword">Password</label>
                </div>

                {/* <div className="form-floating mb-3">
                    <input type="password" className="form-control" id="floatingPasswordConfirm" placeholder="Confirm Password"/>
                    <label htmlFor="floatingPasswordConfirm">Confirm Password</label>
                </div> */}

                <div className="d-grid mb-2">
                    <button className="btn btn-lg btn-primary btn-login fw-bold text-uppercase" type="submit">Register</button>
                </div>
                </form>
                <Link className="d-block text-center mt-2 small" to="/login">Have an account? Sign In</Link>
                
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>
  )
}

export default Register;
