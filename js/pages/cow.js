const embedHTML = `
  <div style="width: 100%; height: 0px; position: relative; padding-bottom: 55.000%;">
    <iframe src="https://streamable.com/e/y2xzxy?quality=highest" 
            frameborder="0" 
            width="100%" 
            height="100%" 
            allowfullscreen 
            style="width: 100%; height: 100%; position: absolute;">
    </iframe>
  </div>
`;

document.getElementById("video-container").innerHTML = embedHTML;
