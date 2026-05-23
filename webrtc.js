// WebRTC
import { pc, pcInit, getOffer, getAnswer } from "./peerconnection.js";

let offer;
let answer;
let candidates = [];
export let datachannel;

// const messagelog = document.getElementById("messagelog");
// const buttonsend = document.getElementById("buttonsend");
// const inputmessage = document.getElementById("inputmessage");

export let socket;

try {
  socket = new WebSocket(
    `wss://free.blr2.piesocket.com/v3/1?api_key=vSgcFnP2aeRO0EZs8GLpJcUrTjM0d9MCRXFA5dyF&notify_self=0`,
  );
} catch (err) {
  console.log("xxx error: " + err);
}

const opensocket = async (event) => {
  console.log("===4.0 socket open", event);
  await init();
};
socket.addEventListener("open", await opensocket);

const init = async () => {
//   buttonsend.disabled = false;
//   inputmessage.disabled = true;
//   buttonsend.textContent = "connect";
  offer = null;
  answer = null;
  candidates = [];

  await pcInit(); // intitiate offering RTCPeerConnection
  datachannel = pc.createDataChannel("dc");
  datachannel.addEventListener("open", datachannelopen);
  datachannel.addEventListener("message", datachannelmessage);
  datachannel.addEventListener("close", datachannelclose);
  console.log("===3.0 datachannel: ", datachannel);
};

const socketmessage = async (event) => {
  console.log("===9.0 socket event.data received", event.data);
  const message = JSON.parse(event.data);
  console.log("===9.1 socket message received", message);
  switch (message.type) {
    case "offer":
      if (!offer) {
        console.log("===9.2 offer received", message);
        try {
          await pc.setRemoteDescription(message);
        } catch (err) {
          console.log("xxx error: " + err);
        }
        offer = message;
        answer = await getAnswer();
        socket.send(JSON.stringify(answer));
        console.log("===9.3 answer sent", answer);
      }
      break;
    case "answer":
      if (!answer) {
        console.log("===9.4 answer received", message);
        answer = message;
        try {
          await pc.setRemoteDescription(message);
        } catch (err) {
          console.log("xxx error: " + err);
        }
      }
      break;
    default:
      if (Object.hasOwn(message, "candidate")) {
        console.log("===9.5 candidate", message);
        candidates.push(new RTCIceCandidate(message));
      }
  }
  if (candidates.length && pc.remoteDescription) {
    while (candidates.length) {
      console.log("===9.6 addIceCandidate queue", candidates.length);
      try {
        const candidate = candidates.pop();
        await pc.addIceCandidate(candidate);
        console.log("==10.0 pc.addIceCandidate: ", candidate);
      } catch (err) {
        console.log("xxx error: " + err);
      }
    }
  }
};
socket.addEventListener("message", await socketmessage);

export const setDataChannel = (dc) => (datachannel = dc);

const datachannelopen = (event) => {
  console.log("==11.0 dc open: ", event);
//   buttonsend.textContent = "send";
//   inputmessage.disabled = false;
//   messagelog.innerHTML += "connected: ";
//   messagelog.innerHTML += event.srcElement.label;
//   messagelog.innerHTML += "<br />";
};

const datachannelmessage = (message) => {
  console.log("===9.7 dc message received: ", message.data);
//   messagelog.innerHTML += message.data;
//   messagelog.innerHTML += "<br />";
};

const datachannelclose = async (event) => {
  console.log("===9.7 datachannelclose  ", event);
  await init();
};

// const buttonsendclick = async () => {
await new Promise(r => setTimeout(r, 2000));
  if (datachannel && datachannel.readyState === "open") {
    try {
      datachannel.send("inputmessage.value");
      console.log("==12.0 inputmessage sent: ", "inputmessage.value");
    } catch (err) {
      console.log("xxx error: " + err);
    }
  } else {
    offer = await getOffer();
    console.log("===6.0 socket send offer", offer);
    socket.send(JSON.stringify(offer));
  }
// };

// buttonsend.addEventListener("click", await buttonsendclick);
