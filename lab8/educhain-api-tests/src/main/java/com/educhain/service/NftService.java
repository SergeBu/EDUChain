package com.educhain.service;

import com.educhain.dto.NftRequest;
import com.educhain.dto.NftResponse;
import org.springframework.stereotype.Service;

@Service
public class NftService {
    public NftResponse createNft(NftRequest request, String authToken) {
        // TODO: Реализуйте логику создания NFT
        return NftResponse.builder()
                .transactionHash("0x123...")
                .ipfsHash("QmXy...")
                .studentWallet(request.getStudentWallet())
                .courseId(request.getCourseId())
                .createdAt(java.time.ZonedDateTime.now())
                .build();
    }
}