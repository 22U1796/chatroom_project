(function () {
    const app = document.querySelector(".app");
    const socket = io();

    let uname;

    // Switch screens
    app.querySelector("#go-to-register").addEventListener("click", () => {
        app.querySelector(".login-screen").classList.remove("active");
        app.querySelector(".register-screen").classList.add("active");
    });

    app.querySelector("#go-to-login").addEventListener("click", () => {
        app.querySelector(".register-screen").classList.remove("active");
        app.querySelector(".login-screen").classList.add("active");
    });

    // Register
    app.querySelector("#register-user").addEventListener("click", () => {
        const username = app.querySelector("#register-username").value.trim();
        const password = app.querySelector("#register-password").value.trim();

        if (!username || !password) return alert("Fill in all fields");

        socket.emit("register", { username, password }, (response) => {
            alert(response.message);
            if (response.success) {
                app.querySelector(".register-screen").classList.remove("active");
                app.querySelector(".login-screen").classList.add("active");
            }
        });
    });

    // Login
    app.querySelector("#login-user").addEventListener("click", () => {
        const username = app.querySelector("#login-username").value.trim();
        const password = app.querySelector("#login-password").value.trim();

        if (!username || !password) return alert("Fill in all fields");

        socket.emit("login", { username, password }, (response) => {
            if (response.success) {
                uname = username;
                app.querySelector(".login-screen").classList.remove("active");
                app.querySelector(".chat-screen").classList.add("active");
            } else {
                alert(response.message);
            }
        });
    });

    // Send message
    app.querySelector("#send-message").addEventListener("click", () => {
        const message = app.querySelector("#message-input").value.trim();
        if (!message) return;

        socket.emit("send_message", { username: uname, message });
        displayMessage("my-message", { name: "You", text: message });
        app.querySelector("#message-input").value = "";
    });

    // Receive message
    socket.on("receive_message", (data) => {
        displayMessage("other-message", { name: data.username, text: data.message });
    });

    // Display message
    function displayMessage(type, { name, text }) {
        const msgContainer = document.createElement("div");
        msgContainer.classList.add("message", type);
        msgContainer.innerHTML = `<div><strong>${name}</strong>: ${text}</div>`;
        app.querySelector(".messages").appendChild(msgContainer);
    }
})();
