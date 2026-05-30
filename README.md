# BioVault
Team Cognitive minds members:
- Damamkar Sunayana
- Abhinaya Kamani
- Kothapalle Sahithi
- Gannoji Sharanya
## Task
This project was developed as part of the EPL Hackathon 2026.
The objective of this hackathon was to develop an innovative solution based on the problem statement chosen during registration.
## Project Description:  
Our problem statement code is CC-02-S1, which is AI-Based Phishing & Fraud Detection 
System from the domain Cyber Crusaders of Engineers Prototyping League(EPL) Hackathon by CodeCrypt Club. We have chosen Biometric data fraud detection as our topic. 
Biometric data is increasingly targeted by hackers using high-resolution photos, 3D masks,and AI-generated deepfakes to bypass security. Once compromised, this data can lead to permanent identity theft.Our solution is as shown below:

- 🛡️ BioVault: Zero-Trust Multi-Factor Biometric Liveness Gateway
BioVault is an advanced, client-side biometric authentication interface engineered to mitigate presentation attacks (spoofing) against sensitive access control systems. Utilizing computer vision landmark tracking, BioVault enforces an interactive Multi-Factor Liveness Verification protocol, requiring the operator to satisfy randomized behavioral challenges (blinking, smiling, head adjustments) before releasing high-value data payloads.

## 🎯 Target Use Cases & Problem Statement

### The Threat Matrix
Standard facial recognition nodes match static spatial features but cannot distinguish between an authorized user and a high-resolution print, a digital loop injection, or a deepfake deep-learning clone. This creates a critical exploit vector for corporate espionage, unauthorized state data extractions, and capital asset wire fraud.

### Targeted End-Users
* **Financial Institutions:** FinTech onboarding validation layers (KYC), high-limit wire authorizations, and administrative accounting terminals.
* **Government Agencies:** Defense operations portals, intelligence network gateways, and remote field deployments accessing localized zero-trust databases.


## ⚙️ Core Technical Features

* **Browser-Isolated Computation:** Leverages low-overhead edge-computing frameworks to run machine learning inferences inside the user's browser, bypassing centralized server vulnerabilities and latency overheads.
* **MFA Liveness State Machine:** Randomly selects, filters, and scales challenge states dynamically based on raw facial matrix tracking variables.
* **Defensive Error Isolation:** Implements real-time structural boundary overrides that drop the system into a high-visibility crimson security alert state when the biometric target is obscured or missing.

# 🌍 UN SDG Global Impact Alignment
### 🕊️ SDG 16: Peace, Justice, and Strong Institutions
Target 16.6: Develop effective, accountable, and transparent institutions at all levels.

BioVault Alignment: As local governments, judiciaries, and civil registries rapidly transition to digital landscapes, they face an epidemic of identity theft and credential falsification. BioVault provides defense agencies and civil state portals with a robust, zero-trust gateway. By verifying the physical, organic presence of an operator, it guarantees that public databases and intelligence records remain untampered, directly strengthening institutional accountability.

### 🏢 SDG 9: Industry, Innovation, and Infrastructure
Target 9.1: Develop quality, reliable, sustainable, and resilient infrastructure to support economic development and human well-being.

BioVault Alignment: Digital infrastructure is the backbone of the modern global economy. Financial technologies, cross-border remittance networks, and remote banking platforms are highly vulnerable to presentation attacks that result in massive capital flight. BioVault introduces highly resilient biometric verification software that runs on minimal technical hardware (pure client-side computing), ensuring that digital financial infrastructures stay secured against highly sophisticated cyber-warfare techniques.
## 🛠️ SDLC Engineering & Architecture Matrix

### Testing, Resilience & Edge Cases
* **Zero-Division Mitigation:** Employs short-circuit fallback configurations `(lipHeight || 1)` across live division operations to safeguard against data noise artifacts.
* **Object Undefined Isolation:** Intercepts arrays before parsing array points, converting raw missing landmark sequences directly into clean threat triggers (`THREAT DETECTED`) without interrupting frame processing cycles.

### Refactoring History
* **Local Module Migration:** Discarded standard unauthenticated cloud CDNs in favor of localized dependency packages to ensure stable offline operations during pitch environments.
* **Resource Optimization:** Refactored runtime math from high-overhead blendshape modules to pure Euclidean spatial tracking, heavily decreasing local GPU overhead and battery drain.

## 🚀 Quickstart Installation Guide

Ensure you have [Node.js](https://nodejs.org/) installed on your computer.
### 1. Initialise the workspace
Clone or place the project files in an isolated folder, open your command prompt, and run:
```cmd
npm install
```
### 2. Install the Vision Framework Dependency
Ensure the MediaPipe vision engine library is cleanly compiled locally:
```cmd
npm install @mediapipe/tasks-vision
```
### 3. Verification Model Asset Placement
- BioVault/
- ├── public/
     - └── face_landmarker.task  <-- Verify presence here
- ├── src/

### 4.Execute Localized Deploment Engine
Run the local Vite optimization development server:
```cmd
npm run dev -- --force
```
 # 🛠️ The BioVault Core Stack
### 1. Frontend Framework: React (with Vite)
What it does: React manages the complex user interface states, handling the seamless transition from the live camera scanning screen to the hidden, encrypted secure dashboard.
Why Vite? Standard setups can be sluggish. Vite is a next-generation build tool that compiles the application instantly, ensuring hot-reloads happen in milliseconds during development and live judging.
### 2. Artificial Intelligence Engine: Google MediaPipe (Vision Suite)
What it does: This is the machine learning workhorse of the application. It runs directly inside the client's web browser, capturing the live video stream from your webcam and converting it into a real-time mathematical grid.
Biometric Extraction: MediaPipe processes the frames on the fly, tracking 468 precise 3D facial landmark coordinates (such as specific coordinates tracking the eyelids, corners of the mouth, and nose bridge alignment).
### 3. Computation Layer: JavaScript (ES6+ / WebAssembly)
What it does: Instead of shipping video frames to a cloud server to analyze (which presents a massive data privacy risk), BioVault performs localized biometric calculations using pure JavaScript matrix math.
The Algorithms: It uses customized Euclidean distance geometry formulas to evaluate your metrics in real time:
Eye Aspect Ratio (EAR) for live blink analysis.
Mouth Width / Vertical Lip Height Ratio for smile detection.
Nose-to-Cheek Horizontal Proportions for 3D head-turn depth mapping.
### 4. Style Engine: Inline CSS Mod Standard
What it does: Handles the high-tech, cyberpunk aesthetic (dark mode slate tones, glowing neon cyan target meshes, and crimson threat warnings) through modular inline styling directly bound to React state conditions.
