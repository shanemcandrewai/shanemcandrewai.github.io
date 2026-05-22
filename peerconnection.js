// RTCPeerConnection
import { socket, setDataChannel } from "./webrtc.js";

export const configuration = {
  iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
};
console.log("===1.0 STUN configuration", configuration);

export let pc; // offering RTCPeerConnection

export const pcInit = async () => {
  try {
    pc = new RTCPeerConnection(configuration);
    console.log("===2.0 pc: ", pc);
  } catch (err) {
    console.log("xxx error: " + err);
  }
  pc.addEventListener("icecandidate", icecandidatefn);
  pc.addEventListener("datachannel", datachannelfn);
};

export const getOffer = async () => {
  let offer;
  try {
    offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  } catch (err) {
    console.log("xxx error: " + err);
  }
  console.log("===5.0 offer: ", offer);
  return offer;
};

export const getAnswer = async () => {
  let answer;
  try {
    answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
  } catch (err) {
    console.log("xxx error: " + err);
  }
  console.log("===9.5 answer: ", answer);
  return answer;
};

const icecandidatefn = (event) => {
  if (event.candidate !== null) {
    const candidate = JSON.stringify(event.candidate.toJSON());
    try {
      socket.send(candidate);
      console.log("===7.0 candidate sent", candidate);
    } catch (err) {
      console.log("xxx error: " + err);
    }
  } else {
    console.log("===8.0 pc all ice candidates sent");
  }
};

const datachannelfn = (event) => {
  console.log("==12.0 setDataChannel: ", event.channel);
  setDataChannel(event.channel);
};
