import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const registerUser = async (data) => {
    const response = await axios.post( API_URL+"/register", data );
    return response;
}

export const loginUser = async (data) => {
    const response = axios.post( API_URL+"/login", data );
    return response;
}