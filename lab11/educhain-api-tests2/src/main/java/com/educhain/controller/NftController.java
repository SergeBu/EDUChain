package com.educhain.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/nft")
public class NftController {

    @PostMapping
    public NftResponse createNft(
            @RequestBody NftRequest request,
            @RequestHeader("X-Issuer-Wallet") String issuerWallet) {
        System.out.println("NFT CREATION FOR: " + issuerWallet);
        return new NftResponse(
            "0xUNSECURED",
            request.studentWallet(),
            request.courseId(),
            request.ipfsHash()
        );
    }

    public record NftRequest(String studentWallet, String courseId, String ipfsHash) {}
    public record NftResponse(String transactionHash, String studentWallet, String courseId, String ipfsHash) {}
}