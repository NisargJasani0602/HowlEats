package com.nhjasani.HowlEatsAPI.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.nhjasani.HowlEatsAPI.entity.UserEntity;

@Repository
public interface UserRepository extends MongoRepository <UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

}
