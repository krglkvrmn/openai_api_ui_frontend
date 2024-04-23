import React from "react";

export function scrollToBottom(containerRef: React.RefObject<HTMLElement>) {
    containerRef?.current?.lastElementChild?.scrollIntoView(false);
}