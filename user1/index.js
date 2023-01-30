let options = 
{
    // Pass your App ID here.
    appId: '',
    // Set the channel name.
    channel: '',
    // Pass your temp token here.
    token: '',
    
    // Set the user ID.
    uid: "",
};


// var socket = io("https://chat.itecknologi.com:443");
// socket.on("connect",()=>{
//   console.log("Connect Session id: "+socket.id)
//   sessionid = socket.id
//   console.log("connection")
//   // alert("Connection socket: "+sessionid)

//   agent = {"_id":"359","role":"agent","name":"omar"}
//   socket.emit("addAgent",agent);

//   // token
  
//   // takeUser()
// });




var encryptionKey = "";
var encryptionSaltBase64 = "";
var encryptionMode = "";
var isMuteAudio = false;

let channelParameters =
{
  // A variable to hold a local audio track.
  localAudioTrack: null,
  // A variable to hold a remote audio track.
  remoteAudioTrack: null,
    // A variable to hold the remote user id.
  remoteUid: null,
};


var stram_data;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    /* use the stream */
    stram_data = stream
    alert(stram_data)
  })
  .catch((err) => {
    alert(err)
    /* handle the error */
  });



async function startBasicCall()
{
  // Create an instance of the Agora Engine
  const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // encryptionSaltBase64 = base64ToUint8Array(encryptionSaltBase64);
  // // Convert the encryptionKey string to hex2ascii.
  // encryptionKey = hex2ascii(encryptionKey);
  // // Set an encryption mode.
  // encryptionMode = "aes-256-gcm2";
  // // Start channel encryption
  // agoraEngine.setEncryptionConfig(encryptionMode, encryptionKey, encryptionSaltBase64);

  agoraEngine.on("connection-state-change", (curState, prevState, reason) => {

    // The sample code uses debug console to show the connection state. In a real-world application, you can add
    // a label or a icon to the user interface to show the connection state. 
    
    // Display the current connection state.
    console.log("Connection state has changed to:" + curState);
    // Display the previous connection state.
    console.log("Connection state was: " + prevState);
    // Display the connection state change reason.
    console.log("Connection state change reason: " + reason);
  });

  AgoraRTC.onAutoplayFailed = () => {
    // Create button for the user interaction.
    const btn = document.createElement("button");
    // Set the button text.
    btn.innerText = "Click me to resume playback";
    // Remove the button when onClick event occurs.
    btn.onClick = () => {
        btn.remove();
    };
    // Append the button to the UI.
    document.body.append(btn);
  }

  document.getElementById("localAudioVolume").addEventListener("change", function(evt) {
      console.log("Volume of local audio :" + evt.target.value);
      // Set the local audio volume.
      channelParameters.localAudioTrack.setVolume(parseInt(evt.target.value));
  });
  // Set an event listener on the range slider.
  document.getElementById("remoteAudioVolume").addEventListener("change", function(evt) {
    console.log("Volume of remote audio :" + evt.target.value);
    // Set the remote audio volume.
    channelParameters.remoteAudioTrack.setVolume(parseInt(evt.target.value));
  });
  
  // Listen for the "user-published" event to retrieve an AgoraRTCRemoteUser object.
  agoraEngine.on("user-published", async (user, mediaType) =>
  {
    // Subscribe to the remote user when the SDK triggers the "user-published" event.
    await agoraEngine.subscribe(user, mediaType);
    console.log("subscribe success");
    alert(mediaType)

    // Subscribe and play the remote audio track.
    if (mediaType == "audio")
    {
      channelParameters.remoteUid=user.uid;
      // Get the RemoteAudioTrack object from the AgoraRTCRemoteUser object.
      channelParameters.remoteAudioTrack = user.audioTrack;
      // Play the remote audio track. 
      channelParameters.remoteAudioTrack.play();
      showMessage("Remote user connected: " + user.uid);
    }

    // Listen for the "user-unpublished" event.
    agoraEngine.on("user-unpublished", user =>
    {
      console.log(user.uid + "has left the channel");
      showMessage("Remote user has left the channel");
    });
  });

  window.onload = function ()
  {

    agoraEngine.on("network-quality", (quality) => {
      if(quality.uplinkNetworkQuality == 1)
      {
          document.getElementById("upLinkIndicator").innerHTML = "Excellent";
          document.getElementById("upLinkIndicator").style.color = "green";
      }
      else if(quality.uplinkNetworkQuality == 2)
      {
          document.getElementById("upLinkIndicator").innerHTML = "Good";
          document.getElementById("upLinkIndicator").style.color = "yellow";
      }
      else (quality.uplinkNetworkQuality >= 4)
      {
          document.getElementById("upLinkIndicator").innerHTML = "Poor";
          document.getElementById("upLinkIndicator").style.color = "red";
      }
    });
      
      // Get the downlink network condition
    agoraEngine.on("network-quality", (quality) => {
      if(quality.downlinkNetworkQuality == 1)
      {
          document.getElementById("downLinkIndicator").innerHTML = "Excellent";
          document.getElementById("downLinkIndicator").style.color = "green";
      }
      else if(quality.downlinkNetworkQuality == 2)
      {
          document.getElementById("downLinkIndicator").innerHTML = "Good";
          document.getElementById("downLinkIndicator").style.color = "yellow";
      }
      else if(quality.downlinkNetworkQuality >= 4)
      {
          document.getElementById("downLinkIndicator").innerHTML = "Poor";
          document.getElementById("downLinkIndicator").style.color = "red";
      }
    });
    // Listen to the Join button click event.
    document.getElementById("join").onclick = async function ()
    {

      console.log(options.appId)
      console.log(options.channel)
      console.log(options.token)
      console.log(options.uid)
      // Join a channel.
      await agoraEngine.join(options.appId, options.channel, options.token, options.uid);
      showMessage("Joined channel: " + options.channel);

      var audioTracks = stram_data.getAudioTracks();
      console.log('Using video device: ' + audioTracks[0].label);
      // Create a local audio track from the microphone audio.
      // channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      channelParameters.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(
        {encoderConfig: "high_quality_stereo",mediaStreamTrack: audioTracks[0],});
      // Publish the local audio track in the channel.
      await agoraEngine.publish(channelParameters.localAudioTrack);
      console.log("Publish success!");
      // var startcall = { senderId:"359", receiverId:"oa4307629@gmail.com", type:"audio", role:"agent", channelName:options.channel, uid:"359" }
      // socket.emit("startCall", (startcall))
      // console.log("Start Calling...........!");
    }

    document.getElementById('muteAudio').onclick = async function ()
      {
      if(isMuteAudio == false)
      {
          // Mute the local audio.
          channelParameters.localAudioTrack.setEnabled(false);
          // Update the button text.
          document.getElementById(`muteAudio`).innerHTML = "Unmute Audio";
          isMuteAudio = true;
      }
      else
      {
          // Unmute the local audio.
          channelParameters.localAudioTrack.setEnabled(true);
          // Update the button text.
          document.getElementById(`muteAudio`).innerHTML = "Mute Audio";
          isMuteAudio = false;
      }
    }
    
    // Listen to the Leave button click event.
    document.getElementById('leave').onclick = async function ()
    {
      // Destroy the local audio track.
      channelParameters.localAudioTrack.close();
      // Leave the channel
      await agoraEngine.leave();
      console.log("You left the channel");
      // Refresh the page for reuse
      window.location.reload();
    }

    document.getElementById("statistics").onclick = async function ()
    {
      var stats;

      // Collect the call quality statistics.
      var localAudioStats = agoraEngine.getLocalAudioStats();
      if (localAudioStats !== undefined) {
          stats = "Local audio stats = { sendBytes: " + localAudioStats.sendBytes + ", sendBitrate: " 
          + localAudioStats.sendBitrate + ", sendPacketsLost: "
          + localAudioStats.sendPacketsLost + " }";
      }

      var remoteAudioStats = agoraEngine.getRemoteAudioStats()[channelParameters.remoteUid];
      if (remoteAudioStats !== undefined) {
          stats = stats + "<br>" + "Remote audio stats = { receiveBytes: " + remoteAudioStats.receiveBytes 
          + ", receiveBitrate: " + remoteAudioStats.receiveBitrate +
          ", receivePacketsLost: " + remoteAudioStats.receivePacketsLost + "}";
      }

      var rtcStats = agoraEngine.getRTCStats();
      if (rtcStats !== undefined) {
          stats = stats + "<br>" + "Channel statistics = { UserCount: " + rtcStats.UserCount 
          + ", OutgoingAvailableBandwidth: " + rtcStats.OutgoingAvailableBandwidth 
          + ", RTT: " + rtcStats.RTT + " }";
      }

      // Show the statistics
      document.getElementById("stats").innerHTML = stats;
    }

  }
}

function showMessage(text){
  document.getElementById("message").textContent = text;
}

function base64ToUint8Array(base64Str)
{
  const raw = window.atob(base64Str);
  const result = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1)
  {
    result[i] = raw.charCodeAt(i);
  }
  return result;
}


function hex2ascii(hexx)
{
  const hex = hexx.toString();//force conversion
  let str = '';
  for (let i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

startBasicCall();