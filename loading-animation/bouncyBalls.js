let boundings = document.querySelector("#loadingAnimation").getBoundingClientRect();
var vTop = 0;
var vLeft = 0;
var vBottom = boundings.height-30;
var vRight = boundings.width-30;
for (let i = 0; i < boundings.height * boundings.width; i += 20000) {
    let span = document.createElement("span");
    span.classList.add("ball");
    document.querySelector("#loadingAnimation").appendChild(span);
}
var balls = document.querySelectorAll(".ball");
var xValues = [], yValues = [], xSpeeds = [], ySpeeds = [];
balls.forEach((ball, i) => {
    xValues[i] = vLeft + Math.random() * (vRight - vLeft);
    yValues[i] = vTop + Math.random() * (vBottom - vTop);
    xSpeeds[i] = (((Math.random() * boundings.width) / 35) + 5) * (Math.random() - 0.5);
    ySpeeds[i] = (((Math.random() * boundings.height) / 35) + 5) * (Math.random() - 0.5);
    ball.style["background-color"] = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
});
function moveX() {
    balls.forEach((ball, i) => {
        xValues[i] += xSpeeds[i];
        ball.style["left"] = `${xValues[i]}px`;
        if (xValues[i] <= vLeft || xValues[i] >= vRight) {
            xSpeeds[i] *= -1;
            ball.style["background-color"] = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        }
    });
}
function moveY() {
    balls.forEach((ball, i) => {
        yValues[i] += ySpeeds[i];
        ball.style["top"] = `${yValues[i]}px`;
        if (yValues[i] <= vTop || yValues[i] >= vBottom) {
            ySpeeds[i] *= -1;
            ball.style["background-color"] = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        }
    });
}
setInterval(moveX, 10);
setInterval(moveY, 10);
