package com.educhain.controller;

import com.educhain.dto.NftRequest;
import com.educhain.dto.NftResponse;
import com.educhain.service.NftService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Slf4j
public class NftController {

    private final NftService nftService;

    @Autowired
    public NftController(NftService nftService) {
        this.nftService = nftService;
    }

    @PostMapping("/nfts")
    public ResponseEntity<NftResponse> createNft(
            @Valid @RequestBody NftRequest request,
            @RequestHeader("Authorization") String authToken) {
        
        log.info("NFT creation request for wallet: {}", request.getStudentWallet());
        NftResponse response = nftService.createNft(request, authToken);
        log.info("NFT created. TxHash: {}", response.getTransactionHash());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}