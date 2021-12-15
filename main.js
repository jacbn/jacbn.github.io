var collapsibles = document.getElementsByClassName("collapsible");

for (var c of collapsibles) {
    c.addEventListener("click", function() {
        this.classList.toggle("active");
        this.style.borderRadius = (this.classList.contains("active")) ? "10px 10px 0 0" : "10px";
        var content = this.nextElementSibling;
        content.style.maxHeight = (content.style.maxHeight) ? null : content.scrollHeight + "px";
    })
}