package com.educhain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NftResponse {
    private String transactionHash;
    private String ipfsHash;
    private String studentWallet;
    private String courseId;
    private ZonedDateTime createdAt;
}