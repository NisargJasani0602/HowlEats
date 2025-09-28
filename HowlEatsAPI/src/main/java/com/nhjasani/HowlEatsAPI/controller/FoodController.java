package com.nhjasani.HowlEatsAPI.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhjasani.HowlEatsAPI.io.FoodResponse;
import com.nhjasani.HowlEatsAPI.io.FoodRequest;
import com.nhjasani.HowlEatsAPI.service.FoodService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/foods")
@AllArgsConstructor
@CrossOrigin("*")
public class FoodController {

    private final FoodService foodService;

    @PostMapping
    public FoodResponse addFood(@RequestPart("food") String foodString,
            @RequestPart("file") MultipartFile file) {
        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request;
        try {
            request = objectMapper.readValue(foodString, FoodRequest.class);
        } catch(JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON format");
        }

        FoodResponse response = foodService.addFood(request, file);
        return response;
    }

    @GetMapping
    public List<FoodResponse> readFoods() {
        return foodService.readFoods();
    }

    @GetMapping("/{id}")
    public FoodResponse readFood(@PathVariable String id) {
        return foodService.readFood(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id) {
        foodService.deleteFood(id);
    }
}
