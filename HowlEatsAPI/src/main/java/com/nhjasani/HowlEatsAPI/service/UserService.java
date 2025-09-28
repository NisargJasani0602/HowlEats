package com.nhjasani.HowlEatsAPI.service;

import com.nhjasani.HowlEatsAPI.io.UserRequest;
import com.nhjasani.HowlEatsAPI.io.UserResponse;

public interface UserService {

    UserResponse registerUser(UserRequest request);

    String findByUserId();
    
}
