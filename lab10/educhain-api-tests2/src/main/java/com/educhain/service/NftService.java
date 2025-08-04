package com.educhain.service;

import com.educhain.dto.NftRequest;
import com.educhain.dto.NftResponse;
import org.springframework.stereotype.Service;

@Service
public class NftService {

    public NftResponse createNft(NftRequest request, String issuerWallet) {
        // Здесь должна быть ваша бизнес-логика создания NFT
        // Пока просто возвращаем mock-объект
        return NftResponse.builder()
                .transactionHash("0x123abc")
                .studentWallet(request.getStudentWallet())
                .courseId(request.getCourseId())
                .ipfsHash(request.getIpfsHash())
                .build();
    }
}