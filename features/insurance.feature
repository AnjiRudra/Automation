Feature: Insurance Quote Submission
  As a user
  I want to fill out an insurance quote form
  So that I can submit a quote for automobile insurance

  Scenario: Complete insurance quote workflow
    Given user navigates to the insurance application
    When user fills vehicle data
    And user fills insured data
    And user fills insurance data
    And user selects quote and policy
    And user submits quote details
    Then quote should be submitted successfully
