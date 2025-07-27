Feature: NFT Minting Integration

  Scenario: Successful course completion
    Given User "0x123" completes course "Blockchain 101"
    When System mints achievement NFT
    Then Metadata should be pinned to IPFS
    And NFT balance should be 1