/**
 * Test Suite for Sarvam Speech-to-Text (STT) Service
 * Run with node: `node src/utils/stt/sarvamSttService.test.js`
 */

import { SarvamSttService } from './sarvamSttService.js';

const TEST_KEY = "sk_2r49iy7a_NDwqsIbfiA8MBUB87ncFAaR4";

async function testSttService() {
  console.log("================────────────────────────────────────────────");
  console.log("          SARVAM STT SERVICE TEST SUITE                     ");
  console.log("================────────────────────────────────────────────\n");

  // Test 1: Availability Check
  console.log("Test Case 1: Availability Check");
  const validService = new SarvamSttService({ apiKey: TEST_KEY });
  const dummyService = new SarvamSttService({ apiKey: "your_sarvam_api_key_here" });
  const emptyService = new SarvamSttService({ apiKey: "" });

  console.log("  - Valid Key Available?   :", validService.isAvailable() ? "PASS (True)" : "FAIL");
  console.log("  - Dummy Key Available?   :", !dummyService.isAvailable() ? "PASS (False)" : "FAIL");
  console.log("  - Empty Key Available?   :", !emptyService.isAvailable() ? "PASS (False)" : "FAIL");
  console.log("  - Endpoint               :", validService.endpoint);
  console.log("  - Default Model          :", validService.modelName);

  // Test 2: Invalid Blob Handling
  console.log("\nTest Case 2: Empty Blob Validation");
  try {
    await validService.transcribeAudio(null);
    console.log("  - Empty Blob Check       : FAIL (Expected exception)");
  } catch (err) {
    console.log("  - Empty Blob Check       : PASS (Caught:", err.message + ")");
  }

  console.log("\n================────────────────────────────────────────────");
  console.log("             STT TEST SUITE COMPLETED SUCCESSFULLY          ");
  console.log("================────────────────────────────────────────────\n");
}

testSttService();
