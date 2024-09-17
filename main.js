import "./style.css";

import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// Import the necessary functions from Firebase SDK v9
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// WebRTC configuration
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

// HTML elements
const webcamButton = document.getElementById("webcamButton");
const webcamVideo = document.getElementById("webcamVideo");
const callButton = document.getElementById("callButton");
const callInput = document.getElementById("callInput");
const answerButton = document.getElementById("answerButton");
const remoteVideo = document.getElementById("remoteVideo");
const hangupButton = document.getElementById("hangupButton");
const startButton = document.getElementById("startButton");

// 1. Setup media sources
webcamButton.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    webcamVideo.srcObject = localStream;
    remoteVideo.srcObject = remoteStream;

    callButton.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;
  } catch (error) {
    console.error("Error accessing webcam: ", error);
  }
};

// 2. Create an offer
callButton.onclick = async () => {
  // Reference Firestore collections for signaling
  const callDocRef = doc(collection(firestore, "calls"));
  const offerCandidatesRef = collection(callDocRef, "offerCandidates");
  const answerCandidatesRef = collection(callDocRef, "answerCandidates");

  callInput.value = callDocRef.id;

  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    event.candidate && addDoc(offerCandidatesRef, event.candidate.toJSON());
  };

  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await setDoc(callDocRef, { offer });

  // Listen for remote answer
  onSnapshot(callDocRef, (snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      pc.setRemoteDescription(answerDescription);
    }
  });

  // When answered, add candidate to peer connection
  onSnapshot(answerCandidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  hangupButton.disabled = false;
};

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDocRef = doc(firestore, "calls", callId);
  const answerCandidatesRef = collection(callDocRef, "answerCandidates");
  const offerCandidatesRef = collection(callDocRef, "offerCandidates");

  pc.onicecandidate = (event) => {
    event.candidate && addDoc(answerCandidatesRef, event.candidate.toJSON());
  };

  const callData = (await getDoc(callDocRef)).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  await setDoc(callDocRef, { answer }, { merge: true });

  onSnapshot(offerCandidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });
};

// 4. Hangup the call
hangupButton.onclick = () => {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop());
  }

  webcamVideo.srcObject = null;
  remoteVideo.srcObject = null;

  hangupButton.disabled = true;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = false;

  // 可选：清理 Firestore 中的通话文档
  // 清空画布内容
  const localCanvas = document.getElementById("localCanvas");
  const remoteCanvas = document.getElementById("remoteCanvas");

  if (localCanvas) {
    const localCanvasCtx = localCanvas.getContext("2d");
    localCanvasCtx.clearRect(0, 0, localCanvas.width, localCanvas.height);
  }

  if (remoteCanvas) {
    const remoteCanvasCtx = remoteCanvas.getContext("2d");
    remoteCanvasCtx.clearRect(0, 0, remoteCanvas.width, remoteCanvas.height);
  }

  // 重新启用按钮
  hangupButton.disabled = true;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = false;
  window.location.reload();
};

// Canvas and context setup
const localCanvas = document.getElementById("localCanvas");
const remoteCanvas = document.getElementById("remoteCanvas");
const localCanvasCtx = localCanvas.getContext("2d");
const remoteCanvasCtx = remoteCanvas.getContext("2d");

// Initialize MediaPipe Pose detection
const localPose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
const remotePose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
localPose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

remotePose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Handle the results from pose detection
localPose.onResults((results) => Results(results, localCanvas, localCanvasCtx));
remotePose.onResults((results) =>
  Results(results, remoteCanvas, remoteCanvasCtx)
);

function Results(results, canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    // drawLandmarks(ctx, results.poseLandmarks, {
    //   color: "#FF0000",
    //   lineWidth: 2,
    // });
    // 要排除的索引值
    const excludeIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    //自定義的連接點，只保留不包含要排除的索引的連接
    const customConnections = POSE_CONNECTIONS.filter(([start, end]) => {
      return !excludeIndices.includes(start) && !excludeIndices.includes(end);
    });

    // 遍歷所有的關鍵點，過濾掉不需要的索引
    results.poseLandmarks.forEach((landmark, index) => {
      if (!excludeIndices.includes(index)) {
        // 繪製關鍵點
        drawLandmarks(ctx, [landmark], {
          color: "red", // 設置關鍵點顏色
          lineWidth: 2, // 設置關鍵點外圈線條寬度
          radius: 5, // 設置關鍵點大小
        });
      }
    });

    drawConnectors(ctx, results.poseLandmarks, customConnections, {
      color: "#00FF00",
      lineWidth: 4,
    });
  }

  // 设置卡片的位置和大小
  const cardX = 10;
  const cardY = 5;
  const cardWidth = 70;
  const cardHeight = 20;

  // 绘制卡片的背景
  ctx.fillStyle = "#F3F7FB"; // 背景颜色
  //加入icon
  var img = new Image();
  img.src = "user.jpg";
  ctx.drawImage(img, cardX + 10, cardY + 10, 80, 80);

  // 绘制卡片的边框
  ctx.strokeStyle = "#808F97"; // 边框颜色
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(
    cardX + cardWidth / 2, // 椭圆的X坐标（中心点）
    cardY + cardHeight / 2, // 椭圆的Y坐标（中心点）
    cardWidth / 2, // X轴半径
    cardHeight / 2, // Y轴半径
    0, // 旋转角度
    0, // 起始角度
    2 * Math.PI // 结束角度（完整的椭圆）
  );
  ctx.closePath();
  ctx.fill(); // 填充椭圆形背景
  ctx.stroke(); // 绘制椭圆形边框

  // 添加用户信息
  ctx.font = "10px Arial";
  ctx.fillStyle = "#000000";
  ctx.fillText("User Name", cardX + 10, cardY + 13);
}

// Process local video stream
async function processVideo(video, pose) {
  await pose.send({ image: video });
  requestAnimationFrame(() => processVideo(video, pose));
}

// Start the local video stream
webcamVideo.onloadeddata = () => {
  processVideo(webcamVideo, localPose);
};

remoteVideo.onloadeddata = () => {
  processVideo(remoteVideo, remotePose);
};
