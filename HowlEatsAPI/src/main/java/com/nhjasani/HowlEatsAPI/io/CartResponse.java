package com.nhjasani.HowlEatsAPI.io;

import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartResponse {
    
    private String id;
    private String userId;
    @Builder.Default
    private Map<String, Integer> items = new HashMap<>();

}
