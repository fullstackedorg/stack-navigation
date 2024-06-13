import StackNavigation from "./index.ts";

const stackNavigation = new StackNavigation();

const randColor = () => {
    let color = "";
    while(color?.length !== 6) {
        color = Math.floor(Math.random() * 16777215).toString(16)
    }
    return "#" + color;
};

const view1 = document.createElement("div");
view1.id = "grid";
const elementCount = 30;

for (let i = 0; i < elementCount; i++) {
    const element = document.createElement("div");
    const color = randColor();
    element.style.backgroundColor = color;
    view1.append(element);
    element.addEventListener("click", () => navigateToColorView(color));
}

stackNavigation.navigate(view1);

function getColorByBgColor(bgColor) {
    if (!bgColor) {
        return "";
    }
    return parseInt(bgColor.replace("#", ""), 16) > 0xffffff / 2
        ? "#000"
        : "#fff";
}

function navigateToColorView(color) {
    const view = document.createElement("div");
    view.classList.add("color-view");
    view.style.color = getColorByBgColor(color);
    view.innerText = color;

    const back = document.createElement("div");
    back.classList.add("back-btn");
    back.addEventListener("click", () => stackNavigation.back());
    view.append(back);

    stackNavigation.navigate(view, color);
}
