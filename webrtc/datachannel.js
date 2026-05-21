// WebRTC
import {
  pc,
  pcInit,
  getOffer,
  getAnswer,
  addIceCandidate,
} from "./peerconnection.js";

const messagelog = document.getElementById("messagelog");
let offer;
let answer;
let candidates = [];
export let datachannel;

await pcInit(); // intitiate offering RTCPeerConnection

export const socket = new WebSocket(
  `wss://free.blr2.piesocket.com/v3/1?api_key=vSgcFnP2aeRO0EZs8GLpJcUrTjM0d9MCRXFA5dyF&notify_self=0`,
);

const opensocket = async (event) => {
  console.log("===4.0 socket open", event);
};
socket.addEventListener("open", await opensocket);

const socketmessage = async (event) => {
  console.log("===9.0 socket event.data received", event.data);
  const message = JSON.parse(event.data);
  console.log("===9.1 socket message received", message);
  switch (message.type) {
    case "offer":
      if (!offer) {
        console.log("===9.2 offer received", message);
        await pc.setRemoteDescription(message);
        answer = await getAnswer();
        socket.send(JSON.stringify(answer));
        console.log("===9.3 answer", answer);
      }
      break;
    case "answer":
      if (!answer) {
        console.log("===9.3 answer received", message);
        answer = message;
        await pc.setRemoteDescription(message);
      }
      break;
    default:
      console.log("===9.4 candidate", message);
      if (Object.hasOwn(message, "candidate")) {
        candidates.push(new RTCIceCandidate(message));
        if (pc.remoteDescription)
          while (candidates.length) await addIceCandidate(candidates.pop());
      }
  }
};
socket.addEventListener("message", await socketmessage);

export const setDataChannel = (dc) => (datachannel = dc);

const datachannelopen = (event) => {
  console.log("==11.0 dc open: ", event);
  messagelog.innerHTML += "connected: ";
  messagelog.innerHTML += event.srcElement.label;
  messagelog.innerHTML += "<br />";
};

const datachannelmessage = (message) => {
  console.log("===9.7 dc message received: ", message);
  messagelog.innerHTML += message.data;
  messagelog.innerHTML += "<br />";
  console.log("===9.0 dc message received: ", message.data);
};

datachannel = pc.createDataChannel("dc");
datachannel.addEventListener("open", datachannelopen);
datachannel.addEventListener("message", datachannelmessage);
console.log("===3.0 datachannel: ", datachannel);

const buttonsend = document.getElementById("buttonsend");

const buttonsendclick = async () => {
  const message = document.getElementById("inputmessage").value;
  if (datachannel && datachannel.readyState === "open") {
    try {
      datachannel.send(message);
      console.log("==12.0 inputmessage sent: ", message);
    } catch (err) {
      console.log("error: " + err);
    }
  } else {
    offer = await getOffer();
    console.log("===6.0 socket send offer", offer);
    socket.send(JSON.stringify(offer));
  }
};

buttonsend.addEventListener("click", await buttonsendclick);
