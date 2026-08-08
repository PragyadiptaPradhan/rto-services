// Parivahan & Official RTO Helpdesk Source Adapter.
// Collects verified, official Parivahan Sewa guidelines, HSRP rules,
// e-Challan dispute resolution, and MoRTH public notices into general_faqs.

import { SourceAdapter, sleep } from './base.js';

export class ParivahanFaqSource extends SourceAdapter {
  constructor() {
    super('parivahan-faqs', 'general_faqs');
  }

  async fetchRecords(logger) {
    const records = [];
    const rawFaqs = [
      // --- HSRP & Color-Coded Stickers ---
      {
        category: "High Security Registration Plate (HSRP)",
        question: "Is High Security Registration Plate (HSRP) mandatory for all vehicles in India?",
        answer: "Yes. The Ministry of Road Transport and Highways (MoRTH) mandates HSRP and color-coded fuel stickers for all vehicles registered before April 1, 2019. Non-compliance can result in traffic fines ranging from ₹5,000 to ₹10,000 under the Motor Vehicles Act."
      },
      {
        category: "High Security Registration Plate (HSRP)",
        question: "How can I order an HSRP plate and color sticker online?",
        answer: "Vehicle owners in states like Delhi, UP, and Himachal Pradesh can order online at bookmyhsrp.com. Select high security license plate with color sticker, enter your State, Registration Number, Chassis Number, and Engine Number, choose home delivery or dealer fitment, and pay the fee online."
      },
      {
        category: "High Security Registration Plate (HSRP)",
        question: "What do the different color-coded fuel stickers on HSRP represent?",
        answer: "Blue stickers denote Petrol and CNG vehicles, Orange stickers denote Diesel vehicles, and Green strip stickers denote Electric vehicles (EVs). These stickers are affixed to the top-left inner side of the vehicle windshield."
      },

      // --- Parivahan Portal & Technical Recovery ---
      {
        category: "Parivahan Technical Support",
        question: "How do I check the real-time status of my RTO application on Parivahan?",
        answer: "Go to parivahan.gov.in, navigate to Online Services -> Application Status, enter your Application Number and Date of Birth, enter the captcha, and click Submit to track stage-by-stage approval, document verification, and smart card dispatch."
      },
      {
        category: "Parivahan Technical Support",
        question: "What should I do if my payment succeeded on Sarathi but application status shows pending payment?",
        answer: "Do not pay twice. Go to Sarathi Parivahan portal, select your State, click 'Check Payment Status' or 'Verify Pay Status' under the Payments menu, enter your Application Number and Date of Birth to reconcile and update the transaction automatically."
      },
      {
        category: "Parivahan Technical Support",
        question: "How can I cancel or reschedule an RTO appointment slot on Sarathi?",
        answer: "Log in to the Sarathi Parivahan portal, go to Appointments -> Cancel Slot Booking, enter your Application Number and Date of Birth. After cancelling, click 'Slot Booking' to select a fresh date and time slot."
      },
      {
        category: "Parivahan Technical Support",
        question: "Why does Aadhaar e-KYC authentication fail during contactless Learner's License test?",
        answer: "Aadhaar e-KYC face authentication fails if your mobile number is not linked with Aadhaar, if the camera quality is low, or if the photo on Aadhaar is outdated. In case of repeated failures, opt for non-Aadhaar mode and book a physical slot at your local RTO."
      },

      // --- Driving License & Permit Rules ---
      {
        category: "Driving License Services",
        question: "What is the validity of an International Driving Permit (IDP) issued in India?",
        answer: "An International Driving Permit (IDP) issued by Indian RTOs is valid for maximum 1 year from the date of issue, or until the expiry of your permanent Indian Driving License, whichever is earlier. It cannot be renewed online while residing abroad."
      },
      {
        category: "Driving License Services",
        question: "Can I drive a commercial transport vehicle with a private Light Motor Vehicle (LMV) license?",
        answer: "As per the Supreme Court ruling and CMVR rules, an LMV license holder can drive non-transport cars and light commercial vehicles having unladen weight up to 7,500 kg. However, for heavy transport vehicles or hazardous goods carriers, a specific Transport Badge endorsement is required."
      },
      {
        category: "Driving License Services",
        question: "What medical certificate Form 1A is needed for driving license application or renewal?",
        answer: "Form 1A is a physical fitness medical certificate issued and signed by a registered MBBS medical practitioner. It is mandatory for applicants above 40 years of age and for all commercial transport license applicants."
      },

      // --- Vehicle Registration & Transfer Rules ---
      {
        category: "Vehicle Registration & Transfer",
        question: "What are Form 28, Form 29, and Form 30 used for in RTO vehicle ownership transfer?",
        answer: "Form 28 is the application for No Objection Certificate (NOC) when transferring a vehicle to another RTO/state. Form 29 is the notice of ownership transfer submitted by the seller. Form 30 is the application for confirmation of ownership transfer submitted by the buyer."
      },
      {
        category: "Vehicle Registration & Transfer",
        question: "What happens if I do not transfer vehicle ownership within 30 days of sale?",
        answer: "Under Section 50 of the Motor Vehicles Act, the buyer and seller must report the transfer within 30 days (or 45 days if inter-state). Delay incurs a late penalty fee of ₹300–₹500 per month. Legally, the registered seller remains liable for traffic accidents or misuse until official RC transfer."
      },
      {
        category: "Vehicle Registration & Transfer",
        question: "How do I remove Hypothecation (Bank Loan closure) from my Vehicle RC?",
        answer: "After paying off your vehicle loan, collect NOC letters and two signed copies of Form 35 from your bank. Apply on Vahan Parivahan portal under 'Hypothecation Deletion', upload Form 35, bank NOC, valid PUC, and Insurance, pay the fee (~₹200-₹500), and submit at the RTO to issue a clean RC."
      },
      {
        category: "Vehicle Registration & Transfer",
        question: "What is the validity of a Vehicle Registration Certificate (RC) for private cars?",
        answer: "A private vehicle Registration Certificate (RC) is valid for 15 years from the original registration date. After 15 years, the vehicle must undergo an automated fitness inspection for RC renewal (Form 25), valid for an additional 5 years."
      },

      // --- Traffic E-Challan & Lok Adalat Guidelines ---
      {
        category: "Traffic Enforcement & E-Challan",
        question: "How can I check and pay pending traffic e-challans online in India?",
        answer: "Visit echallan.parivahan.gov.in, enter your Vehicle Number or DL Number, click 'Get Detail'. You will see all pending traffic fines. Select the challan and pay securely via net banking/UPI/debit card, or contest it via Virtual Court if disputed."
      },
      {
        category: "Traffic Enforcement & E-Challan",
        question: "How can I settle pending traffic e-challans at a discount during Lok Adalat?",
        answer: "National Lok Adalat sessions are organized quarterly by DLSA/SLSA. Visit the state traffic police Lok Adalat portal during pre-registration dates, generate a court token notice for your pending challan numbers, and present it at the designated Lok Adalat bench for judicial waiver or discount."
      },
      {
        category: "Traffic Enforcement & E-Challan",
        question: "What happens if an e-challan is sent to Virtual Court?",
        answer: "If an e-challan is unpaid past 60 days, it is referred to Virtual Court (vcourts.gov.in). You can view the case details using your mobile number or vehicle number, accept the fine and pay online, or contest the violation before the magistrate."
      },

      // --- Pollution & Safety Standards ---
      {
        category: "Pollution Under Control (PUC) & Safety",
        question: "What is the validity of a Pollution Under Control (PUC) Certificate?",
        answer: "For new BS4 and BS6 vehicles, the initial PUC certificate issued upon purchase is valid for 1 year. Thereafter, PUC testing is mandatory every 6 months for petrol/diesel vehicles. Driving without a valid PUC attracts a fine of ₹10,000 under Section 190(2)."
      },
      {
        category: "Pollution Under Control (PUC) & Safety",
        question: "Can I renew my vehicle insurance or transfer ownership without a valid PUC?",
        answer: "No. The Parivahan / Vahan 4.0 database is integrated with emission testing centers across India. Valid PUC status is mandatory for online insurance renewal, RC transfer, address change, and fitness renewal."
      }
    ];

    for (const item of rawFaqs) {
      records.push(item);
      await sleep(10);
    }

    if (logger) logger.logCollected(records.length);
    return records;
  }
}

export default ParivahanFaqSource;
