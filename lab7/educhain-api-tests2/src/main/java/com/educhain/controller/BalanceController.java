package com.educhain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/balance")
public class BalanceController {

    @GetMapping("/{wallet}")
    public ResponseEntity<?> getBalance(@PathVariable String wallet) {
        if (!wallet.matches("^0x[a-fA-F0-9]{40}$")) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Invalid wallet address",
                    "message", "Address must start with 0x and contain 40 hex characters",
                    "received", wallet
                ));
        }
        
        return ResponseEntity.ok(new BalanceResponse(wallet, 100.0));
    }

    public record BalanceResponse(String wallet, double balance) {}
}