package com.nhjasani.HowlEatsAPI.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.nhjasani.HowlEatsAPI.entity.FoodEntity;

@Repository
public interface FoodRepository extends MongoRepository<FoodEntity, String> {

}
