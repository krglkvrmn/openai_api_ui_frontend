export function selectElementContent(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    if (selection !== null) {
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export function resetSelections(): void {
    const selection = window.getSelection();
    if (selection !== null) {
        selection.removeAllRanges();
    }
}