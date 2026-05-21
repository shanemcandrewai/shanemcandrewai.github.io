// RTCPeerConnection
import { socket, setDataChannel } from "./datachannel.js";

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
    console.log("error: " + err);
  }
  pc.addEventListener("icecandidate", icecandidatefn);
  pc.addEventListener("datachannel", datachannelfn);
};

export const getOffer = async () => {
  const offer = await pc.createOffer();
  console.log("===5.0 offer: ", offer);
  await pc.setLocalDescription(offer);
  return offer;
};

export const getAnswer = async () => {
  const answer = await pc.createAnswer();
  console.log("===9.5 answer: ", answer);
  await pc.setLocalDescription(answer);
  return answer;
};

export const addIceCandidate = async (candidate) => {
  try {
    await pc.addIceCandidate(candidate);
    console.log("==10.0 pc.addIceCandidate: ", candidate);
  } catch (err) {
    console.log("error: " + err);
  }
};

export const icecandidatefn = (event) => {
  if (event.candidate !== null) {
    const candidate = JSON.stringify(event.candidate.toJSON());
    try {
      socket.send(candidate);
      console.log("===7.0 pc candidate", candidate);
    } catch (err) {
      console.log("error: " + err);
    }
  } else {
    console.log("===8.0 pc all ice candidates");
  }
};

const datachannelfn = (event) => {
  console.log("==12.0 setDataChannel: ", event.channel);
  setDataChannel(event.channel);
};
