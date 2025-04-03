import StackNavigation from "./stack-navigation";

const stackNavigation = new StackNavigation();

const randColor = () => {
    let color = "";
    while (color?.length !== 6) {
        color = Math.floor(Math.random() * 16777215).toString(16);
    }
    return "#" + color;
};

const main = document.createElement("main");
main.id = "grid";
const elementCount = 30;

const inputContainer = document.createElement("div");
inputContainer.innerHTML = `<input />`
main.append(inputContainer);

for (let i = 0; i < elementCount; i++) {
    const element = document.createElement("div");
    const color = randColor();
    element.style.backgroundColor = color;
    main.append(element);
    element.addEventListener("click", () => navigateToColorView(color));
}

stackNavigation.navigate(main);

function getColorByBgColor(bgColor: string) {
    if (!bgColor) {
        return "";
    }
    return parseInt(bgColor.replace("#", ""), 16) > 0xffffff / 2
        ? "#000"
        : "#fff";
}

function navigateToColorView(bgColor: string) {
    const view = document.createElement("div");
    view.classList.add("color-view");
    view.style.color = getColorByBgColor(bgColor);
    view.innerText = bgColor;

    const back = document.createElement("div");
    back.classList.add("back-btn");
    back.addEventListener("click", () => stackNavigation.back());
    view.append(back);

    const input = document.createElement("input");
    view.append(input);

    stackNavigation.navigate(view, {
        bgColor,
        onDestroy: () => {
            Toast(`Removed view with bg ${bgColor}`);
        },
    });
}

const toastDuration = 2000;
function Toast(text: string) {
    const container = document.createElement("div");
    container.classList.add("toast");

    const inner = document.createElement("div");
    inner.innerText = text;
    container.append(inner);

    const destroy = () => container.remove();
    const hide = () => {
        container.classList.remove("show");
        setTimeout(destroy, 400);
    };
    const show = () => {
        container.classList.add("show");
        setTimeout(hide, toastDuration);
    };

    setTimeout(show, 1);
    document.body.append(container);
}
