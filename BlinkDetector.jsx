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

  const secretLogs = [
    { id: 1, file: "Project_Exodus_Specs.pdf", type: "Encrypted Core", size: "42.1 MB" },
    { id: 2, file: "Intrusion_Attempts_Log.txt", type: "System Audit", size: "1.2 MB" },
    { id: 3, file: "Biometric_Bypass_Patches.cfg", type: "Firewall Configuration", size: "84 KB" },
  ];

  useEffect(() => {
    let faceLandmarker;
    let animationFrameId;
    let stream;
    let successFrames = 0; 

    async function setupSecurity() {
      try {
        // LOCAL FALLBACK: Bypasses CDN issues entirely by pulling from unpkg mirror
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

        // 1. Eye Aspect Ratio (EAR) Math
        const topEye = landmarks[159];
        const bottomEye = landmarks[145];
        const leftEye = landmarks[133];
        const rightEye = landmarks[33];
        const ear = Math.sqrt(Math.pow(topEye.x - bottomEye.x, 2) + Math.pow(topEye.y - bottomEye.y, 2)) / 
                    Math.sqrt(Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2));

        // 2. Linear Mouth Coordinate Mapping
        const leftMouth = landmarks[61];
        const rightMouth = landmarks[291];
        const topLip = landmarks[0];
        const bottomLip = landmarks[17];
        const mouthWidth = Math.abs(leftMouth.x - rightMouth.x);
        const lipHeight = Math.abs(topLip.y - bottomLip.y);
        const smileScore = mouthWidth / (lipHeight || 1); 

        // 3. Dimensional Spatial Rotation Mapping
        const noseTip = landmarks[4];
        const leftEdge = landmarks[234];
        const rightEdge = landmarks[454];
        const horizontalRatio = Math.abs(noseTip.x - leftEdge.x) / Math.abs(rightEdge.x - leftEdge.x);

        // UI Scanning Target Layout Rendering
        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 2;
        const scanX = landmarks[10].x * canvas.width - 60;
        const scanY = landmarks[10].y * canvas.height - 30;
        ctx.strokeRect(scanX, scanY, 120, 120);

        let conditionPassed = false;
        setSecurityStatus("Analyzing biometric authenticity parameters...");

        if (currentChallenge.id === "BLINK" && ear < 0.18) {
          conditionPassed = true;
        } else if (currentChallenge.id === "SMILE" && smileScore > 2.6) { 
          conditionPassed = true;
        } else if (currentChallenge.id === "LOOK_LEFT" && horizontalRatio < 0.38) {
          conditionPassed = true;
        }

        if (conditionPassed) {
          successFrames++;
          if (successFrames > 5) { 
            setProgress(prev => {
              const nextProgress = prev + 50;
              if (nextProgress >= 100) {
                setVaultUnlocked(true);
                setSecurityStatus("ACCESS GRANTED ✅");
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

  return (
    <div style={{ textAlign: "center", backgroundColor: "#0b0f19", color: "#f8fafc", minHeight: "100vh", padding: "30px", fontFamily: "monospace" }}>
      
      <div style={{ borderBottom: "2px solid #1e293b", paddingBottom: "15px", marginBottom: "35px" }}>
        <h1 style={{ color: "#38bdf8", letterSpacing: "3px", margin: 0 }}>🛡️ BIOVAULT CENTRAL CONTROL</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "5px 0 0 0" }}>INTELLIGENCE SYSTEM LAYER ACTIVE</p>
      </div>

      {!vaultUnlocked ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap", maxWidth: "1100px", margin: "0 auto" }}>
          
          <div style={{ position: "relative", width: "640px", height: "480px", border: "2px solid #38bdf8", borderRadius: "8px", overflow: "hidden", backgroundColor: "#020617" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ position: "absolute", top: 0, left: 0, width: "640px", height: "480px", transform: "scaleX(-1)", objectFit: "cover" }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute", top: 0, left: 0, width: "640px", height: "480px", zIndex: 10, pointerEvents: "none", transform: "scaleX(-1)" }} />
            
            {!isModelLoaded && (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(11,15,25,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#38bdf8", fontWeight: "bold" }}>INITIALIZING BIO-METRIC MODEL WEIGHTS...</div>
              </div>
            )}
          </div>

          <div style={{ width: "380px", backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", padding: "25px", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ color: "#f43f5e", marginTop: 0, borderBottom: "1px solid #374151", paddingBottom: "10px" }}>🛡️ LIVENESS CHALLENGE</h3>
              
             <div style={{ 
               margin: "20px 0", 
               padding: "15px", 
               backgroundColor: securityStatus.includes("THREAT") ? "#451a03" : "#1f2937", 
               borderRadius: "6px", 
               borderLeft: securityStatus.includes("THREAT") ? "4px solid #f43f5e" : "4px solid #38bdf8",
               transition: "all 0.3s ease"
}}>
  {securityStatus.includes("THREAT") ? (
    <div>
      <div style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: "bold" }}>SYSTEM ALERT:</div>
      <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#f43f5e", margin: "5px 0" }}>LIVENESS BREACH DETECTED</div>
      <div style={{ fontSize: "0.85rem", color: "#fca5a5" }}>Subject missing or lens obstructed. Lock initiated.</div>
    </div>
  ) : (
    <div>
      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>CURRENT ENTRY MATRIX REQUIREMENT:</div>
      <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#38bdf8", margin: "5px 0" }}>{currentChallenge.text}</div>
      <div style={{ fontSize: "0.85rem", color: "#a5b4fc" }}>{currentChallenge.instruction}</div>
    </div>
  )}
</div>

              <div style={{ marginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#9ca3af", marginBottom: "5px" }}>
                  <span>IDENTITY SCAN STATUS:</span>
                  <span style={{ color: "#38bdf8" }}>{progress}%</span>
                </div>
                <div style={{ width: "100%", height: "12px", backgroundColor: "#1f2937", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#38bdf8", transition: "width 0.2s ease" }} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#1f2937", padding: "12px", borderRadius: "6px", fontSize: "0.9rem", color: "#e5e7eb", textAlign: "center", border: "1px solid #374151" }}>
              SYSTEM OUT: <span style={{ color: "#fbbf24" }}>{securityStatus}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#065f46", border: "1px solid #10b981", padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "2rem" }}>🔑</span>
            <div style={{ textAlign: "left" }}>
              <h2 style={{ margin: 0, color: "#34d399" }}>SECURE VAULT ACCESS AUTHORIZED</h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#a7f3d0" }}>Biometric verification patterns confirmed match. Hardware token authenticated.</p>
            </div>
            <button onClick={() => { setVaultUnlocked(false); setProgress(0); setCurrentChallenge(CHALLENGES[0]); }} style={{ marginLeft: "auto", padding: "8px 16px", backgroundColor: "#047857", border: "1px solid #34d399", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              LOCK VAULT
            </button>
          </div>

          <h3 style={{ textAlign: "left", color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "10px" }}>📦 CLASSIFIED FILE DIRECTORY</h3>
          
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #1e293b", color: "#9ca3af", fontSize: "0.9rem" }}>
                <th style={{ padding: "12px" }}>FILE IDENTIFIER</th>
                <th style={{ padding: "12px" }}>CLASSIFICATION</th>
                <th style={{ padding: "12px" }}>SIZE</th>
                <th style={{ padding: "12px" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {secretLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #1e293b", backgroundColor: "#111827" }}>
                  <td style={{ padding: "15px", fontWeight: "bold", color: "#f1f5f9" }}>📄 {log.file}</td>
                  <td style={{ padding: "15px" }}><span style={{ backgroundColor: "#1e293b", color: "#38bdf8", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem" }}>{log.type}</span></td>
                  <td style={{ padding: "15px", color: "#9ca3af", fontSize: "0.85rem" }}>{log.size}</td>
                  <td style={{ padding: "15px" }}><button onClick={() => alert(`Downloading decrypted payload: ${log.file}`)} style={{ background: "none", border: "1px solid #64748b", color: "#38bdf8", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>DECRYPT</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}