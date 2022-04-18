//Audio Recorder

function startAudioRecorder() {
  let audioRecorderSection = document.querySelector("section.audio-recorder");

  const recordBtn = audioRecorderSection.querySelector(".record");
  const pauseBtn = audioRecorderSection.querySelector(".pause");
  const stopBtn = audioRecorderSection.querySelector(".stop");
  const soundClips = audioRecorderSection.querySelector(".sound-clips");

  const startStopRequestBtn = audioRecorderSection.querySelector(
    ".start-stop-request"
  );

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia(
        // constraints - only audio needed for this app
        {
          audio: true,
          video: false,
        }
      )

      // Success callback
      .then(function (stream) {
          console.dir(stream)
        stream.stop = function () {
          this.getAudioTracks().forEach(function (track) {
            track.stop();
          });
          this.getVideoTracks().forEach(function (track) {
            //in case... :)
            track.stop();
          });
        };

        const mediaRecorder = new MediaRecorder(stream);

        recordBtn.onclick = function () {
          mediaRecorder.start();
          console.log({ state: mediaRecorder.state });
          console.log("recorder started");
          recordBtn.style.background = "red";
          recordBtn.style.color = "black";
        };

        let chunks = [];

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };

        stopBtn.onclick = function () {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("recorder stopped");
          recordBtn.style.background = "";
          recordBtn.style.color = "";
        };

        mediaRecorder.onstop = function (e) {
            stream.stop();
          console.log("recorder stopped");

          const clipName = prompt("Enter a name for your sound clip");

          const clipContainer = document.createElement("article");
          const clipLabel = document.createElement("p");
          const audio = document.createElement("audio");
          const deleteButton = document.createElement("button");

          clipContainer.classList.add("clip");
          audio.setAttribute("controls", "");
          audio.setAttribute("preload", "auto");
          deleteButton.innerHTML = "Delete";
          clipLabel.innerHTML = clipName;

          clipContainer.appendChild(audio);
          clipContainer.appendChild(clipLabel);
          clipContainer.appendChild(deleteButton);
          soundClips.appendChild(clipContainer);

          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          chunks = [];
          const audioURL = window.URL.createObjectURL(blob);
          audio.src = audioURL;

          deleteButton.onclick = function (e) {
            let evtTgt = e.target;
            evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
          };
        };
      })

      // Error callback
      .catch(function (err) {
        console.log("The following getUserMedia error occurred: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
}

startAudioRecorder();
