package com.nhjasani.HowlEatsAPI.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.nhjasani.HowlEatsAPI.entity.RestaurantEntity;

@Repository
public interface RestaurantRepository extends MongoRepository<RestaurantEntity, String> {
    List<RestaurantEntity> findByCategory(String category);
    Optional<RestaurantEntity> findByPlaceId(String placeId);

}
