package com.educhain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NftRequest {
    @NotBlank
    private String studentWallet;
    
    @NotBlank
    private String courseId;
    
    @NotBlank
    private String ipfsHash;
}