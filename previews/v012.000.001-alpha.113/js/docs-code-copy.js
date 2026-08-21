(function () {
    "use strict";

    var resetDelayMs = 1800;

    function fallbackCopy(text) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.inset = "0 auto auto -9999px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();

        var copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (err) {}

        field.remove();
        return copied;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return fallbackCopy(text)
            ? Promise.resolve()
            : Promise.reject(new Error("Clipboard access is unavailable."));
    }

    function setButtonState(button, state) {
        var icon = button.querySelector("i");
        var label = button.querySelector("span");

        button.classList.toggle("is-copied", state === "copied");
        button.classList.toggle("is-copy-error", state === "error");

        if (state === "copied") {
            icon.className = "fa-solid fa-check";
            label.textContent = "Copied";
            button.setAttribute("aria-label", "Code copied to clipboard");
            return;
        }

        if (state === "error") {
            icon.className = "fa-solid fa-triangle-exclamation";
            label.textContent = "Select code";
            button.setAttribute("aria-label", "Unable to copy; select the code manually");
            return;
        }

        icon.className = "fa-regular fa-copy";
        label.textContent = "Copy";
        button.setAttribute("aria-label", "Copy code to clipboard");
    }

    function addCopyControl(card, index) {
        var code = card.querySelector("pre code");
        var pre = code ? code.closest("pre") : null;
        var label = null;
        var children;
        var button;

        if (!code || !pre || card.querySelector("[data-docs-copy-code]")) return;

        children = Array.prototype.slice.call(card.children);
        label = children.find(function (child) {
            return child.classList && child.classList.contains("docs-code-label");
        });

        if (!label) {
            label = document.createElement("div");
            label.className = "docs-code-label";
            label.textContent = "Code example";
            card.insertBefore(label, pre);
        }

        label.classList.add("docs-code-toolbar");

        button = document.createElement("button");
        button.className = "docs-copy-button";
        button.type = "button";
        button.setAttribute("data-docs-copy-code", "");
        button.setAttribute("aria-describedby", "docs-code-block-" + index);
        button.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i><span>Copy</span>';
        setButtonState(button, "ready");

        if (!code.id) code.id = "docs-code-block-" + index;
        label.appendChild(button);

        button.addEventListener("click", function () {
            window.clearTimeout(button._copyResetTimer);
            copyText(code.textContent).then(function () {
                setButtonState(button, "copied");
            }).catch(function () {
                setButtonState(button, "error");
            }).finally(function () {
                button._copyResetTimer = window.setTimeout(function () {
                    setButtonState(button, "ready");
                }, resetDelayMs);
            });
        });
    }

    function init() {
        Array.prototype.slice.call(document.querySelectorAll(".page-docs .code-card")).forEach(addCopyControl);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
