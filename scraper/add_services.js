import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', 'src', 'data', 'rto_database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Update metadata states supported
db.metadata.states_supported = ["DL", "MH", "KA", "UP", "TN", "TS", "GJ"];

// 2. Define the 6 core new services to append
const newServices = [
  {
    id: "change_of_address",
    name: "Change of Address in DL / Vehicle RC",
    category: "Driving License & Vehicle Services",
    description: "Official procedure to update residential address on Driving License (DL) or Vehicle Registration Certificate (RC) within 30 days of relocating.",
    prerequisites: "Must hold an active DL or RC smart card and possess verified address proof for the new location.",
    common_steps: [
      "Log in to Parivahan Sewa portal (Sarathi for DL / Vahan for RC) using Aadhaar e-KYC.",
      "Select 'Apply for Change of Address' and enter DL/RC number.",
      "Upload valid address proof (Aadhaar Card, Passport, Utility Bill, or Voter ID).",
      "Upload Form 33 (Notice of Change of Address) for vehicle RC updates.",
      "Pay processing fee and smart card issue charges online.",
      "Submit application via Aadhaar contactless mode or book an RTO slot for physical verification.",
      "Receive updated smart card by speed post or view digital card on DigiLocker / mParivahan."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: true,
        fee_breakdown: "Address Change: ₹200, Smart Card Fee: ₹200, Total: ₹400",
        test_format: "Contactless Online e-KYC via Aadhaar. Document verification completed digitally.",
        special_note: "Aadhaar address must match the target Delhi address for instant online approval."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "Application Fee: ₹150, Smart Card: ₹200, Postal Fee: ₹50, Total: ₹400",
        test_format: "Online application followed by physical document submission at local RTO.",
        special_note: "Original physical RC/DL smart card must be surrendered at the RTO counter."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "Application Fee: ₹150, Smart Card Fee: ₹137, Total: ₹287",
        test_format: "Online slot booking required for physical verification at local RTO.",
        special_note: "Requires NOC from prior RTO if moving across different RTO zones within Karnataka."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: true,
        fee_breakdown: "Address Change: ₹200, Smart Card: ₹200, Total: ₹400",
        test_format: "Contactless Aadhaar mode enabled across major RTOs (Noida, Ghaziabad, Lucknow).",
        special_note: "Form 33 copy must be uploaded in PDF format for vehicle RC address changes."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "Application Fee: ₹250, Smart Card: ₹200, Total: ₹450",
        test_format: "Online application with mandatory RTO visit for physical verification.",
        special_note: "Requires local municipal address proof if Aadhaar bears an out-of-state address."
      },
      TS: {
        state_name: "Telangana",
        contactless: true,
        fee_breakdown: "Application Fee: ₹200, Card Fee: ₹200, Total: ₹400",
        test_format: "T-App Folio and RTA Citizen Portal e-KYC integrated.",
        special_note: "Instant processing available for Aadhaar linked TS residents."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: true,
        fee_breakdown: "Application Fee: ₹150, Smart Card: ₹200, Total: ₹350",
        test_format: "Digital Gujarat RTO portal Aadhaar e-KYC process.",
        special_note: "Physical card delivered by India Post speed post within 10 working days."
      }
    },
    applicant_requirements: {
      General: {
        documents: [
          "Aadhaar Card (with updated address)",
          "Form 33 (Application for Notice of Change of Address)",
          "Original Driving License or RC Smart Card",
          "Valid Insurance Certificate & PUC Certificate"
        ],
        additional_notes: "Must be filed within 30 days of address change to avoid late fee penalties."
      },
      Senior: {
        documents: [
          "Aadhaar Card / Passport",
          "Form 33 (for vehicle RC)",
          "Recent Passport Photograph",
          "Original DL or RC"
        ],
        additional_notes: "Senior citizens can request priority queue processing at physical RTO counters."
      },
      Commercial: {
        documents: [
          "Aadhaar Card of Commercial License Holder",
          "Commercial Transport License Badge",
          "Fitness Certificate & Road Tax clearance receipt",
          "Form 33 signed by Fleet Owner / Transport Authority"
        ],
        additional_notes: "Commercial vehicle address updates require clearance from the regional transport authority."
      }
    },
    faqs: [
      {
        question: "What is the penalty for delay in reporting address change on vehicle RC?",
        answer: "Failing to report address change within 30 days incurs a monthly penalty fee of ₹300 for two-wheelers and ₹500 for cars under Section 177 of the Motor Vehicles Act."
      },
      {
        question: "Do I need a new Smart Card when updating my address?",
        answer: "Yes. Once the address change is approved, a fresh smart card embedded with updated microchip data is issued and posted to your new address."
      }
    ]
  },
  {
    id: "duplicate_dl_rc",
    name: "Issue of Duplicate Driving License / Vehicle RC",
    category: "Driving License & Vehicle Services",
    description: "Service to re-issue a duplicate Driving License or Vehicle Registration Certificate in the event of loss, theft, tearing, or physical damage.",
    prerequisites: "Must have an existing registered DL or RC record in Parivahan database and an FIR/Police Acknowledgement report for lost items.",
    common_steps: [
      "File an online Police FIR / Lost Article Report detailing lost DL/RC number.",
      "Access Sarathi (for DL) or Vahan (for RC) portal on parivahan.gov.in.",
      "Select 'Apply for Duplicate DL/RC' and enter DL/Vehicle registration number.",
      "Upload Police FIR copy, Form 26 (Application for Duplicate RC/DL), and ID proof.",
      "In case of damaged card, upload photo of torn/damaged physical smart card.",
      "Pay application fee and smart card issue charges online.",
      "Book slot for document verification at RTO (or submit via Aadhaar e-KYC where contactless is enabled).",
      "Receive duplicate smart card via registered speed post."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: true,
        fee_breakdown: "Duplicate DL/RC Fee: ₹200, Smart Card Fee: ₹200, Total: ₹400",
        test_format: "Contactless e-KYC using Aadhaar and online Delhi Police e-FIR copy upload.",
        special_note: "Delhi Police e-FIR report reference number must be verified online."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "Duplicate Fee: ₹200, Smart Card: ₹200, Postal Fee: ₹50, Total: ₹450",
        test_format: "Online application + physical submission of FIR copy at local RTO.",
        special_note: "Requires physical FIR copy stamped by local Maharashtra police station."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "Duplicate Fee: ₹150, Smart Card Fee: ₹137, Total: ₹287",
        test_format: "Online application with slot booking for verification.",
        special_note: "E-Lost report from Karnataka Police portal (KSP app) is accepted."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: true,
        fee_breakdown: "Duplicate Fee: ₹200, Smart Card: ₹200, Total: ₹400",
        test_format: "Online Aadhaar e-KYC with UP Police Lost Article Report.",
        special_note: "Damaged smart card must be surrendered physically if applicable."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "Duplicate Fee: ₹250, Card Fee: ₹200, Total: ₹450",
        test_format: "RTO counter document submission required.",
        special_note: "Non-traceable certificate from Inspector of Police required if lost."
      },
      TS: {
        state_name: "Telangana",
        contactless: true,
        fee_breakdown: "Duplicate Fee: ₹200, Card Fee: ₹200, Total: ₹400",
        test_format: "Online RTA portal Aadhaar authentication.",
        special_note: "Telangana Police HawkEye lost report accepted online."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: true,
        fee_breakdown: "Duplicate Fee: ₹200, Card Fee: ₹150, Total: ₹350",
        test_format: "Digital Gujarat portal contactless submission.",
        special_note: "Gujarat e-Cop report reference number verified automatically."
      }
    },
    applicant_requirements: {
      General: {
        documents: [
          "Police FIR / Lost Report Copy (or Damaged Smart Card)",
          "Form 26 (Application for Duplicate Certificate of Registration / License)",
          "Aadhaar Card / ID Proof",
          "Valid Insurance & PUC Certificate (for RC duplicate)"
        ],
        additional_notes: "Ensure vehicle chassis number matches existing Vahan records exactly."
      },
      Senior: {
        documents: [
          "Police FIR Copy / Damaged Smart Card",
          "Form 26 & Form 1A Medical Certificate (if DL renewal due)",
          "Aadhaar Card"
        ],
        additional_notes: "Priority counter processing at physical RTO desks."
      },
      Commercial: {
        documents: [
          "Police Lost FIR Report",
          "Form 26 signed by Financier/Bank (if vehicle under loan)",
          "Commercial Permit & Fitness Certificate copy",
          "Tax Clearance Certificate"
        ],
        additional_notes: "Bank clearance required if vehicle has active hypothecation."
      }
    },
    faqs: [
      {
        question: "Can I drive while my application for Duplicate DL is under processing?",
        answer: "Yes, you can carry the official Parivahan Application Acknowledgement receipt and a digital copy stored on DigiLocker or mParivahan mobile app."
      },
      {
        question: "What should I do if my lost DL/RC is found after applying for duplicate?",
        answer: "Surrender the old recovered card to your local RTO to prevent unauthorized duplicate usage and keep your record updated."
      }
    ]
  },
  {
    id: "noc_issue",
    name: "No Objection Certificate (NOC) for Vehicle Transfer",
    category: "Vehicle Registration & Transfer",
    description: "Official clearance certificate issued by the home RTO permitting the re-registration of a vehicle in another state or RTO jurisdiction.",
    prerequisites: "Vehicle must have clear title with no pending traffic challans, crime records, or bank loan defaults.",
    common_steps: [
      "Apply online on Vahan Parivahan portal under 'Application for NOC'.",
      "Enter vehicle registration number and chassis number.",
      "Pay NOC processing fee online.",
      "Obtain Police Crime Record Clearance Certificate from local Traffic/Crime Branch.",
      "Pencil print of vehicle Chassis Number on physical Form 28 (3 copies).",
      "Submit Form 28, Original RC, Insurance, PUC, and Police Clearance at the issuing RTO.",
      "Upon verification, RTO issues NOC document valid for re-registration in target state."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹100 per vehicle class, Postal Fee: ₹50, Total: ₹150",
        test_format: "Online application submission followed by physical document audit at RTO.",
        special_note: "Delhi NCR 10-year diesel / 15-year petrol de-registered vehicles must obtain NOC for outside states."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "NOC Application Fee: ₹100, Service Fee: ₹50, Total: ₹150",
        test_format: "Physical chassis pencil imprint verification required at RTO counter.",
        special_note: "NCRB and local police crime branch NOC clearance required."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹100, Processing Fee: ₹100, Total: ₹200",
        test_format: "Slot booking for RTO verification required.",
        special_note: "Karnataka requires road tax clearance certificate before granting NOC."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹100, Total: ₹100",
        test_format: "Online portal filing with physical RTO verification.",
        special_note: "Clearance of all UP traffic e-challans is strictly enforced."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹150, Total: ₹150",
        test_format: "RTO counter submission of Form 28 imprints.",
        special_note: "Police clearance required from Greater Chennai Police / District Crime Branch."
      },
      TS: {
        state_name: "Telangana",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹100, Total: ₹100",
        test_format: "Online filing on RTA portal + physical document verification.",
        special_note: "Clearance of Telangana e-Challans mandatory."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: false,
        fee_breakdown: "NOC Fee: ₹100, Total: ₹100",
        test_format: "Digital Gujarat upload + physical RTO inspection.",
        special_note: "Pencil chassis imprint mandatory on 3 Form 28 copies."
      }
    },
    applicant_requirements: {
      General: {
        documents: [
          "Form 28 (Application & Grant of NOC - 3 copies with pencil chassis imprints)",
          "Original Registration Certificate (RC)",
          "Valid Insurance Policy Certificate & PUC Certificate",
          "Police Clearance Certificate (PCC) / Crime Branch NOC",
          "Receipt of up-to-date Road Tax payment"
        ],
        additional_notes: "Ensure all pending e-challans are paid before applying."
      },
      Commercial: {
        documents: [
          "Form 28 (3 copies with chassis imprints)",
          "Permit Surrender Certificate & Fitness Certificate",
          "Bank NOC (Form 35 if hypothecated)",
          "State Transport Authority Tax Clearance"
        ],
        additional_notes: "Commercial vehicles must surrender state goods/passenger permits."
      }
    },
    faqs: [
      {
        question: "What is the validity period of an RTO NOC?",
        answer: "An RTO NOC does not have a strict expiry date on paper, but it is expected to be submitted for re-registration in the target state within 6 months. Delay may require a re-validation certificate from the issuing RTO."
      },
      {
        question: "Can an issued NOC be cancelled if I decide not to sell/transfer the vehicle?",
        answer: "Yes. You must obtain a 'Non-Utilization Certificate' (NUC) from the target state RTO confirming the vehicle was not registered there, and submit it back to the original home RTO to cancel the NOC."
      }
    ]
  },
  {
    id: "hypothecation_cancellation",
    name: "Hypothecation Deletion / Addition (Bank Loan Closure)",
    category: "Vehicle Registration & Transfer",
    description: "Procedure to add bank lien when taking a vehicle loan or remove hypothecation from the RC smart card after full loan repayment.",
    prerequisites: "Must have closed the vehicle bank loan and received official Bank NOC & Form 35.",
    common_steps: [
      "Collect Bank NOC letter and 2 signed copies of Form 35 from lending bank.",
      "Access Vahan Parivahan portal under 'Hypothecation Deletion'.",
      "Enter Vehicle Registration Number and last 5 digits of Chassis Number.",
      "Upload Bank NOC, Form 35 (signed by bank & owner), PUC, and Insurance.",
      "Pay Hypothecation Deletion Fee online.",
      "Submit application via Aadhaar e-KYC contactless mode or visit local RTO with original documents.",
      "Receive updated clear RC Smart Card without bank endorsement."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: true,
        fee_breakdown: "HP Deletion Fee: ₹100 (2-Wheeler) / ₹200 (Car), Smart Card: ₹200, Total: ₹300-₹400",
        test_format: "Contactless Aadhaar e-KYC mode enabled.",
        special_note: "Bank NOC digital verification integrated for major nationalized banks."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "HP Deletion: ₹500, Smart Card: ₹200, Postal Fee: ₹50, Total: ₹750",
        test_format: "Online filing followed by physical submission of original Form 35 at RTO.",
        special_note: "Both copies of Form 35 must bear original official bank seal."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "HP Deletion: ₹100 (2W) / ₹200 (4W), Smart Card Fee: ₹137, Total: ₹237-₹337",
        test_format: "Online slot booking for document verification at RTO.",
        special_note: "Bank NOC validity must be within 3 months of application date."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: true,
        fee_breakdown: "HP Deletion Fee: ₹200, Smart Card: ₹200, Total: ₹400",
        test_format: "Contactless mode available with digital Form 35 upload.",
        special_note: "Ensure bank loan account number matches NOC letter."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "HP Deletion: ₹250, Smart Card: ₹200, Total: ₹450",
        test_format: "RTO counter submission of original Form 35.",
        special_note: "Original RC smart card must be surrendered for card printing."
      },
      TS: {
        state_name: "Telangana",
        contactless: true,
        fee_breakdown: "HP Deletion: ₹200, Card Fee: ₹200, Total: ₹400",
        test_format: "Online RTA portal Aadhaar authentication.",
        special_note: "Digital verification with major regional bank portals."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: true,
        fee_breakdown: "HP Deletion: ₹200, Card Fee: ₹150, Total: ₹350",
        test_format: "Digital Gujarat portal contactless submission.",
        special_note: "Speed post delivery of clean RC smart card."
      }
    },
    applicant_requirements: {
      General: {
        documents: [
          "Bank No-Objection Certificate (NOC) for loan closure",
          "Form 35 (Notice of Termination of Hypothecation - 2 copies signed by bank)",
          "Original Registration Certificate (RC Smart Card)",
          "Valid Insurance Certificate & PUC Certificate"
        ],
        additional_notes: "Bank NOC letter is generally valid for 3 months from date of issue."
      },
      Commercial: {
        documents: [
          "Bank NOC & Form 35 (2 copies)",
          "Commercial Vehicle Fitness & Road Tax Clearance",
          "Original RC & Permit copy"
        ],
        additional_notes: "Financier endorsement must be cancelled before renewing commercial state permit."
      }
    },
    faqs: [
      {
        question: "What happens if bank NOC expires before submitting HP deletion application?",
        answer: "You must request your bank to issue a re-validated NOC letter or fresh NOC with an updated issue date before applying on Parivahan."
      },
      {
        question: "Is HP deletion mandatory after finishing car loan payments?",
        answer: "Yes. Until HP deletion is recorded in RTO Vahan database, the bank remains registered as legal hypothecator, preventing vehicle sale, RC transfer, or scrap clearance."
      }
    ]
  },
  {
    id: "international_driving_permit",
    name: "International Driving Permit (IDP)",
    category: "Driving License Services",
    description: "Official legal document issued to permanent Indian driving license holders allowing them to drive motor vehicles in foreign countries adhering to the 1949 Geneva Road Traffic Convention.",
    prerequisites: "Must hold a valid Permanent Indian Driving License, valid Passport, and active overseas Travel Visa / Air Ticket.",
    common_steps: [
      "Log in to Sarathi Parivahan portal and select 'Apply for International Driving Permit (IDP)'.",
      "Enter permanent Indian DL number and Date of Birth.",
      "Upload valid Passport copy (with visa page or travel ticket).",
      "Upload Form 1A (Medical Certificate signed by registered MBBS doctor).",
      "Upload valid Indian Driving License copy and recent passport-size photos.",
      "Pay IDP application fee online (₹1,000 fixed national fee).",
      "Book slot for physical verification at local RTO (or submit via Aadhaar e-KYC where enabled).",
      "Collect printed IDP booklet from RTO."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: false,
        fee_breakdown: "IDP Fee: ₹1,000, Postal/Handling Charges: ₹50, Total: ₹1,050",
        test_format: "Online application + physical document verification at Zonal RTO Office.",
        special_note: "Passport address must match or be verified against Indian DL details."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "IDP Statutory Fee: ₹1,000, Postal Fee: ₹50, Total: ₹1,050",
        test_format: "Physical document audit & original passport inspection at RTO counter.",
        special_note: "Original passport and valid visa copy must be presented during verification."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "IDP Statutory Fee: ₹1,000, User Fee: ₹100, Total: ₹1,100",
        test_format: "Online slot booking for physical document verification at RTO.",
        special_note: "IDP issued for countries signatory to the 1949 Geneva Convention."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: false,
        fee_breakdown: "IDP Fee: ₹1,000, Total: ₹1,000",
        test_format: "Online filing + physical passport verification at RTO.",
        special_note: "Form 1A medical certificate mandatory for all age groups."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "IDP Fee: ₹1,000, Handling: ₹50, Total: ₹1,050",
        test_format: "RTO counter document submission required.",
        special_note: "Visa and flight ticket copy mandatory."
      },
      TS: {
        state_name: "Telangana",
        contactless: false,
        fee_breakdown: "IDP Fee: ₹1,000, Service Fee: ₹100, Total: ₹1,100",
        test_format: "Online filing + physical verification at RTA counter.",
        special_note: "Original passport inspection compulsory."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: false,
        fee_breakdown: "IDP Fee: ₹1,000, Total: ₹1,000",
        test_format: "Digital Gujarat application + RTO verification.",
        special_note: "Valid for 1 year from date of issue."
      }
    },
    applicant_requirements: {
      General: {
        documents: [
          "Valid Permanent Indian Driving License",
          "Valid Indian Passport (with minimum 6 months validity remaining)",
          "Valid Visa / Entry Permit for destination country",
          "Confirmed Air Ticket / Flight Reservation copy",
          "Form 1A (Medical Certificate signed by a registered MBBS Doctor)",
          "3 passport-sized photographs (35mm x 45mm)"
        ],
        additional_notes: "IDP is issued with a maximum validity of 1 year or DL expiry, whichever is earlier."
      }
    },
    faqs: [
      {
        question: "Can an International Driving Permit (IDP) be renewed from outside India?",
        answer: "MoRTH has introduced a provision allowing Indian citizens abroad to apply for IDP renewal through official Indian Embassy / Consulate portals, which forward verified requests to home RTOs on Parivahan."
      },
      {
        question: "Do I need a separate driving test for getting an International Driving Permit?",
        answer: "No separate driving test is required, provided you hold an active permanent Indian Driving License for the respective vehicle class."
      }
    ]
  },
  {
    id: "fitness_certificate",
    name: "Vehicle Fitness Certificate & Renewal",
    category: "Vehicle Registration & Transfer",
    description: "Mandatory statutory inspection and certification confirming commercial transport vehicles (or private vehicles older than 15 years) comply with safety and emission roadworthiness standards.",
    prerequisites: "Vehicle must be presented physically at the automated vehicle testing station / RTO track with valid PUC and Insurance.",
    common_steps: [
      "Apply online on Vahan Parivahan portal under 'Application for Fitness Certificate'.",
      "Enter vehicle registration number and pay fitness inspection fee & smart card charges.",
      "Book an appointment slot at the designated RTO Inspection Track / Automated Testing Station (ATS).",
      "Ensure vehicle has working brakes, lights, speed governor, reflector strips, and valid PUC.",
      "Present vehicle physically for inspector evaluation and chassis number verification.",
      "Upon passing inspection, Fitness Certificate (Form 38) is granted online and endorsed on RC."
    ],
    state_variations: {
      DL: {
        state_name: "Delhi",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600 (3-Wheeler) / ₹1,000 (Cab/LMV) / ₹1,500 (Heavy), Smart Card: ₹200",
        test_format: "Automated Testing Station (ATS) computerised track inspection.",
        special_note: "Speed governor and FASTag verification mandatory before testing."
      },
      MH: {
        state_name: "Maharashtra",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600-₹1,000, Grant Fee: ₹200, Total: ₹800-₹1,200",
        test_format: "Physical inspection track testing by Motor Vehicle Inspector (MVI).",
        special_note: "Reflector strips (yellow/red) and emergency exit check enforced for passenger buses."
      },
      KA: {
        state_name: "Karnataka",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600 (LMV) / ₹1,000 (HMV), User Fee: ₹100, Total: ₹700-₹1,100",
        test_format: "RTO inspection track test by senior MVI inspector.",
        special_note: "Strict check on vehicle body dimensions and emission PUC levels."
      },
      UP: {
        state_name: "Uttar Pradesh",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600-₹1,000, Total: ₹600-₹1,000",
        test_format: "Automated track testing at regional ATS centers.",
        special_note: "Vehicle body paint and commercial lettering standards checked."
      },
      TN: {
        state_name: "Tamil Nadu",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600-₹1,000, Certificate Fee: ₹200, Total: ₹800-₹1,200",
        test_format: "MVI track physical inspection.",
        special_note: "Fire extinguisher and first aid box mandatory for commercial cabs."
      },
      TS: {
        state_name: "Telangana",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600-₹1,000, Total: ₹600-₹1,000",
        test_format: "Automated testing track inspection.",
        special_note: "GPS vehicle tracking device check for commercial passenger cabs."
      },
      GJ: {
        state_name: "Gujarat",
        contactless: false,
        fee_breakdown: "Inspection Fee: ₹600-₹1,000, Total: ₹600-₹1,000",
        test_format: "RTO track test by Motor Vehicle Inspector.",
        special_note: "Reflective tape stickers mandatory as per CMVR rules."
      }
    },
    applicant_requirements: {
      Commercial: {
        documents: [
          "Original Registration Certificate (RC)",
          "Valid Pollution Under Control (PUC) Certificate",
          "Valid Third-Party / Comprehensive Commercial Insurance",
          "Receipt of paid Road Tax & State Transport Permit",
          "Calibration Certificate for Speed Limiting Device (SLD)",
          "Form 38 (Inspection Report for Vehicle Fitness)"
        ],
        additional_notes: "Commercial vehicle fitness is valid for 2 years for vehicles up to 8 years old, and 1 year thereafter."
      }
    },
    faqs: [
      {
        question: "What is the penalty for driving a commercial vehicle without a valid Fitness Certificate?",
        answer: "Under Section 192 of the Motor Vehicles Act, driving an un-fit vehicle attracts a fine of ₹2,000 to ₹5,000 for first offence, and up to ₹10,000 for subsequent offences, along with impounding of the vehicle."
      },
      {
        question: "How long is a private vehicle fitness valid?",
        answer: "Private vehicles receive fitness approval for 15 years upon initial registration. After 15 years, private vehicle fitness must be renewed every 5 years."
      }
    ]
  }
];

// Append new services if not already present
let addedServicesCount = 0;
for (const service of newServices) {
  const exists = db.services.some(s => s.id === service.id);
  if (!exists) {
    db.services.push(service);
    addedServicesCount++;
  }
}

// 3. Prune off-topic non-Indian Wikipedia general FAQs (like Botswana, Burkina Faso, Kenya, Bolivia, Argentina plates)
const initialFaqCount = db.general_faqs.length;
db.general_faqs = db.general_faqs.filter(faq => {
  const q = (faq.question || '').toLowerCase();
  const a = (faq.answer || '').toLowerCase();
  const offTopicKeywords = ['botswana', 'burkina faso', 'cameroon', 'kenya', 'morocco', 'bolivia', 'greenland', 'ecuador', 'illinois', 'wyoming'];
  return !offTopicKeywords.some(kw => q.includes(kw) || a.includes(kw));
});

const prunedCount = initialFaqCount - db.general_faqs.length;

// Save updated database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n', 'utf8');

console.log(`✔ Successfully updated rto_database.json!`);
console.log(`  - Supported states updated: ${db.metadata.states_supported.join(', ')}`);
console.log(`  - Services count: ${db.services.length} (+${addedServicesCount} new core services)`);
console.log(`  - General FAQs cleaned: ${db.general_faqs.length} (pruned ${prunedCount} off-topic records)`);
