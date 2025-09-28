package com.nhjasani.HowlEatsAPI.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nhjasani.HowlEatsAPI.io.UserResponse;
import com.nhjasani.HowlEatsAPI.service.UserService;
import com.nhjasani.HowlEatsAPI.io.UserRequest;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody UserRequest request) {
        return userService.registerUser(request);
    }
}
