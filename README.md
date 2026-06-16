# MyPMOSBuddy - Frontend

React web application for MyPMOSBuddy.
Deployed on : https://my-pmos-buddy-frontend.onrender.com

## Prerequisites

- Node.js installed
- Backend server running (see https://github.com/dsmb95/my-pmos-buddy-backend.git)

## Setup

1. Clone the repository
   git clone https://github.com/dsmb95/my-pmos-buddy-frontend.git

2. Install dependencies
   npm install

3. Start the development server
   npm run dev

4. Open your browser at http://localhost:5173

## Project Docs

See the /docs folder for the project proposal and architecture diagram.

## Project Overview
MyPMOSBuddy is a comprehensive tracking application designed specifically for women managing PMOS (Polyendocrine Metabolic Ovarian Syndrome, formerly known as PCOS). With an estimated 10-15% of women affected globally, this app serves as an all-in-one buddy to help users figure out patterns and routines that work best for their bodies. It empowers users by providing tools to closely monitor their menstrual flow, skincare progress, weight fluctuations, and medication/supplement intake.

## Usage
Once registered and logged into the application, users can navigate through different tracking modules to record and visualize their daily data:
- **Flow Tracker**: View cycle predictions and track irregular periods using integrated calendar and menstrual cycle APIs.
- **Skin Care Tracker**: Log morning (AM) and night (PM) skincare routines. Check off daily skin symptoms (e.g., Acne, Dry, Oily, Itchy), add detailed notes, and upload multiple photos to visually track skin progress over time.
- **Medications & Supplements Tracker**: Keep a detailed log of current medications, including name, dosage, and frequency. This helps users remember what treatments they take.
- **Weight Tracker**: Log weight entries over time using specific units (lbs or kg). Users can view a visual chart of their weight fluctuations to easily spot long-term trends.

## Technologies Used
- **Frontend**: React, React-Calendar
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Handling & Storage**: Multer (for backend file uploading) and Cloudinary (for cloud image hosting)
- **External APIs**: API Verve's Menstrual Cycle API
- **Deployment**: Render.com

## Future Improvements:
- Incorporate AI to analyze the data collected in each category (i.e. flow data, skin data, weight data) and summarize into a document that can be downloaded and shown to medical professionals.
- Make the flow calendar interactive and submit flow data through it.
- Incorporate AI to analyze submitted photos in skin data to give a feedback of how skin has improved through time.
- Incorporate an API that has a database for a wide variety of skincare products with inci (International Nomenclature Cosmetic Ingredient) for each product (so that the user can just choose the product they use and not type it individually).
- Incorporate an AI agent that the user can talk to.  