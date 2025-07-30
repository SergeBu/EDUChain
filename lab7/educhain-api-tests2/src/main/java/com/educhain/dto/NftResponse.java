package com.educhain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NftResponse {
    private String transactionHash;
    private String studentWallet;
    private String courseId;
    private String ipfsHash;
}