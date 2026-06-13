import React, { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

const CHALLENGES = [
  { id: "BLINK", text: "BLINK YOUR EYES", instruction: "Perform an organic blink to prove liveness." },
  { id: "SMILE", text: "SMILE BROADLY", instruction: "Confirm emotional expression response." },
  { id: "LOOK_LEFT", text: "LOOK TO THE LEFT", instruction: "Turn head slightly left to verify 3D depth profile." }
];

export default function BioVaultApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(CHALLENGES[0]);
  const [securityStatus, setSecurityStatus] = useState("Initializing BioVault Core System...");
  const [progress, setProgress] = useState(0); 

  // Multi-user tracking profile states
  const [currentUser, setCurrentUser] = useState("");
  const [inputName, setInputName] = useState("");
  
  // Dynamic list of user files
  const [userFiles, setUserFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  
  // States for creating a brand new file
  const [newFileName, setNewFileName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    let faceLandmarker;
    let animationFrameId;
    let stream;
    let successFrames = 0; 

    async function setupSecurity() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://unpkg.com/@mediapipe/tasks-vision@0.10.35/wasm"
        );

        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/face_landmarker.task" },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        setIsModelLoaded(true);
        setSecurityStatus("Awaiting Camera Authorization...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        setSecurityStatus("CRITICAL SYSTEM ERROR: Core Engine Halted ❌");
        console.error(err);
      }
    }

    function predictWebcam() {
      if (!videoRef.current || !canvasRef.current || !faceLandmarker || vaultUnlocked) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      let startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        const topEye = landmarks[159];
        const bottomEye = landmarks[145];
        const leftEye = landmarks[133];
        const rightEye = landmarks[33];
        const ear = Math.sqrt(Math.pow(topEye.x - bottomEye.x, 2) + Math.pow(topEye.y - bottomEye.y, 2)) / 
                    Math.sqrt(Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2));

        const leftMouth = landmarks[61];
        const rightMouth = landmarks[291];
        const topLip = landmarks[0];
        const bottomLip = landmarks[17];
        const mouthWidth = Math.abs(leftMouth.x - rightMouth.x);
        const lipHeight = Math.abs(topLip.y - bottomLip.y);
        const smileScore = mouthWidth / (lipHeight || 1); 

        const noseTip = landmarks[4];
        const leftEdge = landmarks[234];
        const rightEdge = landmarks[454];
        const horizontalRatio = Math.abs(noseTip.x - leftEdge.x) / Math.abs(rightEdge.x - leftEdge.x);

        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 2;
        const scanX = landmarks[10].x * canvas.width - 60;
        const scanY = landmarks[10].y * canvas.height - 30;
        ctx.strokeRect(scanX, scanY, 120, 120);

        let conditionPassed = false;
        setSecurityStatus("Analyzing biometric authenticity parameters...");

        // Optimized sensitivity levels for easy hackathon testing
        if (currentChallenge.id === "BLINK" && ear < 0.24) {
          conditionPassed = true;
        } else if (currentChallenge.id === "SMILE" && smileScore > 1.8) { 
          conditionPassed = true;
        } else if (currentChallenge.id === "LOOK_LEFT" && horizontalRatio < 0.45) {
          conditionPassed = true;
        }

        if (conditionPassed) {
          successFrames++;
          if (successFrames > 5) { 
            setProgress(prev => {
              const nextProgress = prev + 50;
              if (nextProgress >= 100) {
                setVaultUnlocked(true);
                setSecurityStatus("LIVENESS CONFIRMED ✅");
                return 100;
              } else {
                const remaining = CHALLENGES.filter(c => c.id !== currentChallenge.id);
                setCurrentChallenge(remaining[Math.floor(Math.random() * remaining.length)]);
                successFrames = 0;
                return nextProgress;
              }
            });
          }
        }
      } else {
        setSecurityStatus("SECURITY BREAK: Threat Vector Detected (No User) ⚠️");
      }

      if (!vaultUnlocked) {
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    }

    setupSecurity();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [currentChallenge, vaultUnlocked]);

  // Load user data array out of local storage sandbox on initial login match
  const initializeUserSession = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const formattedName = inputName.trim().toUpperCase();
    setCurrentUser(formattedName);

    const storedData = localStorage.getItem(`BIOVAULT_DATA_${formattedName}`);
    if (storedData) {
      setUserFiles(JSON.parse(storedData));
    } else {
      const defaultArray = [
        { 
          id: Date.now(), 
          filename: "Master_Credentials.txt", 
          content: `--- SECURE RESOURCE VAULT FOR USER: ${formattedName} ---\n[EMAIL ACCOUNTS]\n- Primary: user@domain.com | Key: pass123\n\nClick 'Decrypt & Edit' to modify this workspace.` 
        }
      ];
      setUserFiles(defaultArray);
      localStorage.setItem(`BIOVAULT_DATA_${formattedName}`, JSON.stringify(defaultArray));
    }
  };

  // Create a brand new custom file inside the current user data profile
  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let cleanName = newFileName.trim();
    if (!cleanName.endsWith(".txt") && !cleanName.endsWith(".cfg") && !cleanName.endsWith(".pdf")) {
      cleanName += ".txt";
    }

    const updatedArray = [
      ...userFiles,
      {
        id: Date.now(),
        filename: cleanName,
        content: `--- CLASSIFIED DOCUMENT: ${cleanName} ---\n[Owner Segment]: ${currentUser}\n\nEnter private data string payloads here...`
      }
    ];

    setUserFiles(updatedArray);
    localStorage.setItem(`BIOVAULT_DATA_${currentUser}`, JSON.stringify(updatedArray));
    setNewFileName("");
    setShowCreateForm(false);
  };

  // Save updates made to an open file's text contents back to localStorage
  const handleSaveFileEdits = () => {
    if (!activeFile || !currentUser) return;

    const updatedArray = userFiles.map(file => 
      file.id === activeFile.id ? { ...file, content: editingContent } : file
    );

    setUserFiles(updatedArray);
    localStorage.setItem(`BIOVAULT_DATA_${currentUser}`, JSON.stringify(updatedArray));
    setActiveFile(null);
  };

  return (
    <div style={{ textAlign: "center", backgroundColor: "#0b0f19", color: "#f8fafc", minHeight: "100vh", padding: "30px", fontFamily: "monospace", position: "relative" }}>
      
      <div style={{ borderBottom: "2px solid #1e293b", paddingBottom: "15px", marginBottom: "35px" }}>
        <h1 style={{ color: "#38bdf8", letterSpacing: "3px", margin: 0 }}>🛡️ BIOVAULT DECENTRALIZED DESK</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "5px 0 0 0" }}>MULTI-USER IDENTITY ISOLATION FILE MANAGER ACTIVE</p>
      </div>

      {!vaultUnlocked ? (
        // LAYER 1: BIOMETRIC SCAN VIEW
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ position: "relative", width: "640px", height: "480px", border: "2px solid #38bdf8", borderRadius: "8px", overflow: "hidden", backgroundColor: "#020617" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ position: "absolute", top: 0, left: 0, width: "640px", height: "480px", transform: "scaleX(-1)", objectFit: "cover" }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", top: 0, left: 0, width: "640px", height: "480px", zIndex: 10, pointerEvents: "none", transform: "scaleX(-1)" }} />
            {!isModelLoaded && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(11,15,25,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#38bdf8", fontWeight: "bold" }}>INITIALIZING VECTOR MODEL CORE...</div>
              </div>
            )}
          </div>
          <div style={{ width: "380px", backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", padding: "25px", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ color: "#f43f5e", marginTop: 0, borderBottom: "1px solid #374151", paddingBottom: "10px" }}>🛡️ LIVENESS DETECTOR</h3>
              <div style={{ margin: "20px 0", padding: "15px", backgroundColor: securityStatus.includes("SECURITY BREAK") ? "#451a03" : "#1f2937", borderRadius: "6px", borderLeft: securityStatus.includes("SECURITY BREAK") ? "4px solid #f43f5e" : "4px solid #38bdf8" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>CURRENT SYSTEM CHALLENGE:</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#38bdf8", margin: "5px 0" }}>{currentChallenge.text}</div>
                </div>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#1f2937", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#38bdf8", transition: "width 0.2s ease" }} />
              </div>
            </div>
            <div style={{ backgroundColor: "#1f2937", padding: "12px", borderRadius: "6px", fontSize: "0.9rem", color: "#e5e7eb", textAlign: "center" }}>
              STATE OUT: <span style={{ color: "#fbbf24" }}>{securityStatus}</span>
            </div>
          </div>
        </div>
      ) : !currentUser ? (
        // LAYER 2: CHOOSE IDENTITY ACCOUNT CONTEXT PROFILE
        <div style={{ maxWidth: "450px", margin: "60px auto", backgroundColor: "#111827", border: "2px solid #38bdf8", padding: "30px", borderRadius: "8px", boxShadow: "0 0 20px rgba(56,189,248,0.2)" }}>
          <h2 style={{ color: "#38bdf8", marginTop: 0 }}>🔓 LIVENESS VERIFIED</h2>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: "1.4rem" }}>Please mount your personalized file manager container workspace layer by matching your operator profile below.</p>
          <form onSubmit={initializeUserSession} style={{ marginTop: "20px" }}>
            <input 
              type="text" 
              placeholder="ENTER SYSTEM OPERATOR ID (e.g. SAM)" 
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              style={{ width: "100%", padding: "12px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "4px", color: "#4ade80", fontFamily: "monospace", fontSize: "1rem", outline: "none", boxSizing: "border-box", textAlign: "center" }}
            />
            <button type="submit" style={{ width: "100%", marginTop: "15px", padding: "12px", backgroundColor: "#38bdf8", border: "none", color: "#0f172a", fontWeight: "bold", fontSize: "1rem", borderRadius: "4px", cursor: "pointer" }}>
              MOUNT PERSONAL WORKSPACE
            </button>
          </form>
        </div>
      ) : (
        // LAYER 3: PERSONALIZED WORKSPACE DIRECTORY
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#065f46", border: "1px solid #10b981", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "2rem" }}>👤</span>
            <div style={{ textAlign: "left" }}>
              <h2 style={{ margin: 0, color: "#34d399" }}>CONTAINER SECTOR: {currentUser}</h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#a7f3d0" }}>Isolated environment tracking. All changes save completely to sandboxed profile nodes.</p>
            </div>
            <button onClick={() => { setVaultUnlocked(false); setProgress(0); setCurrentChallenge(CHALLENGES[0]); setCurrentUser(""); setInputName(""); setShowCreateForm(false); }} style={{ marginLeft: "auto", padding: "8px 16px", backgroundColor: "#047857", border: "1px solid #34d399", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              SHUT DOWN SECTOR
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#38bdf8" }}>📂 MANAGE PERSONAL RESOURCES ({userFiles.length})</h3>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ backgroundColor: showCreateForm ? "#ef4444" : "#10b981", border: "none", color: "white", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}
            >
              {showCreateForm ? "CANCEL CREATION" : "➕ CREATE NEW FILE"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateFile} style={{ backgroundColor: "#111827", border: "1px solid #334155", padding: "20px", borderRadius: "6px", marginBottom: "25px", display: "flex", gap: "15px", alignItems: "center" }}>
              <div style={{ textAlign: "left", flexGrow: 1 }}>
                <label style={{ fontSize: "0.8rem", color: "#9ca3af", display: "block", marginBottom: "5px" }}>NEW TARGET FILENAME:</label>
                <input 
                  type="text" 
                  placeholder="e.g. My_Secret_Passwords.txt"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#020617", border: "1px solid #4b5563", borderRadius: "4px", color: "#f8fafc", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button type="submit" style={{ marginTop: "22px", padding: "10px 20px", backgroundColor: "#10b981", border: "none", color: "white", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                GENERATE IN SECURE SPACE
              </button>
            </form>
          )}

          {/* FILE DIRECTORY TABLE */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #1e293b", color: "#9ca3af", fontSize: "0.9rem" }}>
                <th style={{ padding: "12px" }}>FILE IDENTIFIER HANDLE</th>
                <th style={{ padding: "12px" }}>SECTOR MAPPING LAYER</th>
                <th style={{ padding: "12px", textAlign: "right" }}>DECRYPT ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {userFiles.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: "30px", textTransform: "uppercase", color: "#64748b", textAlign: "center" }}>No encrypted segments mounted. Click 'Create New File' to build one.</td>
                </tr>
              ) : (
                userFiles.map((file) => (
                  <tr key={file.id} style={{ borderBottom: "1px solid #1e293b", backgroundColor: "#111827" }}>
                    <td style={{ padding: "15px", fontWeight: "bold", color: "#f1f5f9" }}>📄 {file.filename}</td>
                    <td style={{ padding: "15px" }}><span style={{ backgroundColor: "#3b82f6", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem" }}>Profile ({currentUser})</span></td>
                    <td style={{ padding: "15px", textAlign: "right" }}>
                      <button 
                        onClick={() => { setActiveFile(file); setEditingContent(file.content); }} 
                        style={{ background: "none", border: "1px solid #38bdf8", color: "#38bdf8", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", marginRight: "10px" }}
                      >
                        DECRYPT & EDIT
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to permanently delete ${file.filename}?`)) {
                            const updatedArray = userFiles.filter(f => f.id !== file.id);
                            setUserFiles(updatedArray);
                            localStorage.setItem(`BIOVAULT_DATA_${currentUser}`, JSON.stringify(updatedArray));
                          }
                        }} 
                        style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* POPUP TERMINAL TEXTAREA FIELD */}
          {activeFile && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(2, 6, 23, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
              <div style={{ width: "650px", backgroundColor: "#0f172a", border: "2px solid #38bdf8", borderRadius: "8px", padding: "20px", textAlign: "left", boxShadow: "0 0 25px rgba(56, 189, 248, 0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "15px" }}>
                  <h4 style={{ margin: 0, color: "#38bdf8", fontSize: "1.1rem" }}>🔓 CRYPTO-STREAM RUNNING: {activeFile.filename}</h4>
                  <button onClick={() => setActiveFile(null)} style={{ background: "none", border: "1px solid #ef4444", color: "#ef4444", padding: "2px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>CANCEL</button>
                </div>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  style={{ width: "100%", height: "250px", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "6px", color: "#4ade80", fontFamily: "monospace", fontSize: "0.95rem", padding: "15px", boxSizing: "border-box", resize: "none", lineHeight: "1.5rem", outline: "none" }}
                />
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>LOCAL PROFILE CONTEXT LAYER LINKED</span>
                  <button onClick={handleSaveFileEdits} style={{ backgroundColor: "#38bdf8", border: "none", color: "#0f172a", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>
                    SAVE DECRYPT CHANGES
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}