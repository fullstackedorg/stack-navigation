globalThis.back = function () {
    return StackNavigation.singleton?.back();
};

export default class StackNavigation {
    static singleton: StackNavigation;
    private views: {
        element: HTMLElement;
        onDestroy?: () => void;
    }[] = [];

    lock = false;

    leftInit = 50;
    velocityThreshold = 1;

    behindViewOffset = 0.3;

    constructor() {
        StackNavigation.singleton = this;

        window.addEventListener("touchstart", this.onStart.bind(this));
        window.addEventListener("touchmove", this.onMove.bind(this));
        window.addEventListener("touchend", this.onEnd.bind(this));

        document.body.style.margin = "0px";
        document.body.style.padding = "0px";
        document.body.style.overflow = "hidden";
    }

    private drag: {
        id: number;
        start: {
            x: number;
            timestamp: number;
        };
        end: {
            x: number;
            timestamp: number;
        };
    } = null;
    onStart(e: TouchEvent) {
        if (this.views.length <= 1 || e.touches.length > 1 || this.lock) return;

        const start = e.touches.item(0).clientX;

        if (start > this.leftInit) return;

        this.drag = {
            id: e.touches.item(0).identifier,
            start: {
                x: start,
                timestamp: Date.now()
            },
            end: {
                x: start,
                timestamp: Date.now()
            }
        };
        const currentView = this.views.at(-1);
        currentView.element.style.transition = "none";
        currentView.element.style.transform = `translate3d(0px, 0px, 0px)`;
        currentView.element.classList.add("navigating");
        (currentView.element.children[0] as HTMLElement).style.overflow =
            "hidden";

        this.views.at(-2).element.style.transition = "none";
    }
    onMove(e: TouchEvent) {
        if (this.drag === null) return;

        let draggingTouch: Touch;
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches.item(i);
            if (touch.identifier === this.drag.id) {
                draggingTouch = touch;
                break;
            }
        }

        if (!draggingTouch) {
            this.onEnd(e);
            return;
        }

        this.drag.end = {
            x: draggingTouch.clientX,
            timestamp: Date.now()
        };
        let deltaX = this.drag.end.x - this.drag.start.x;

        this.views.at(-1).element.style.transform =
            `translate3d(${deltaX > 0 ? deltaX : 0}px, 0px, 0px)`;

        const percentX = deltaX / window.innerWidth;
        const deltaBehindViewPercent = this.behindViewOffset * percentX;
        const translationX =
            (this.behindViewOffset - deltaBehindViewPercent) * 100;
        this.views.at(-2).element.style.transform =
            `translate3d(-${translationX > 0 ? translationX : 0}%, 0px, 0px)`;
    }
    onEnd(e: TouchEvent) {
        if (this.drag === null) return;

        let stillDragging = false;
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches.item(i);
            if (touch.identifier === this.drag.id) {
                stillDragging = true;
                break;
            }
        }

        if (stillDragging) return;

        const deltaTime = this.drag.end.timestamp - this.drag.start.timestamp;
        const deltaX = this.drag.end.x - this.drag.start.x;

        const velocity = deltaX / deltaTime;

        if (
            velocity > this.velocityThreshold ||
            this.drag.end.x > window.innerWidth * 0.5
        ) {
            this.back();
        } else {
            const currentView = this.views.at(-1);
            currentView.element.style.transition = "0.3s transform";
            currentView.element.style.transform = `translate3d(0px, 0px, 0px)`;
            currentView.element.classList.remove("navigating");
            (currentView.element.children[0] as HTMLElement).style.overflow =
                "auto";

            const behindView = this.views.at(-2);
            behindView.element.style.transition = "0.3s transform";
            behindView.element.style.transform = `translate3d(-${this.behindViewOffset * 100}%, 0px, 0px)`;
        }

        this.drag = null;
    }

    navigate(e: HTMLElement, options?: Partial<ViewOptions>) {
        const view = document.createElement("div");
        view.style.cssText = `
            position: fixed;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            overflow: hidden;`;

        // DEPRECATING string options for bgColor (2024-10-09)
        if (typeof options === "string") {
            options = {
                bgColor: options
            };
        }

        if (options?.bgColor) {
            view.style.backgroundColor = options.bgColor;
        }
        view.style.transition = `0.3s transform`;
        view.style.transform = `translate3d(100%, 0px, 0px)`;

        const inner = document.createElement("div");
        inner.style.cssText = `
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            overflow: auto;`;

        inner.append(e);
        view.append(inner);

        this.views.forEach((v) => {
            v.element.style.pointerEvents = "none";
            v.element.style.transition = `0.3s 1ms transform`;
            v.element.style.transform = `translate3d(-${this.behindViewOffset * 100}%, 0px, 0px)`;
        });

        this.views.push({
            element: view,
            ...(options || {})
        });
        document.body.append(view);

        setTimeout(() => {
            if (this.views.at(-1).element === view)
                view.style.transform = `translate3d(0%, 0px, 0px)`;
        }, 1);
    }

    // return if did go back
    back() {
        if (this.views.length <= 1) {
            return false;
        }

        const lastView = this.views.pop();
        lastView.onDestroy?.();
        lastView.element.style.transition = "0.3s transform";
        lastView.element.style.transform = `translate3d(${window.innerWidth}px, 0px, 0px)`;
        setTimeout(() => lastView.element.remove(), 400);

        const currentView = this.views.at(-1);
        currentView.element.style.transition = "0.3s transform";
        currentView.element.style.pointerEvents = "all";
        currentView.element.style.transform = `translate3d(0%, 0px, 0px)`;

        return true;
    }

    reset() {
        while (this.back()) {}
    }
}

type ViewOptions = {
    bgColor: string;
    onDestroy: () => void;
};
