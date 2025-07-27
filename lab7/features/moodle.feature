Feature: Moodle Integration
  Scenario: Student completes a course
    Given course "Blockchain 101" exists
    When student "0x123" completes the course
    Then NFT with CID "QmBlockchain101" is minted