import {RefObject, useEffect, useRef, useState} from "react";

type TuseDialogReturn = {
    isOpened: boolean,
    dialogRef: RefObject<HTMLDialogElement>,
    openDialog: () => void,
    closeDialog: () => void,
}

export function useDialog(type: "modal" | "popup" = "modal", timeout?: number): TuseDialogReturn {
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    function detectOutsidePopupClick(event: MouseEvent) {
        const rect = dialogRef.current?.getBoundingClientRect();
        if (isOpened && rect && (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
        )) {
            closeDialog();
        }
    }

    useEffect(() => {
        if (isOpened) {
            const closeTimeout = timeout ? setTimeout(() => {
                closeDialog();
            }, timeout) : undefined;
            // Without timeout the listener immediately receives a click that triggered popup show, which should be avoided
            setTimeout(() => document.addEventListener('click', detectOutsidePopupClick), 0);
            return () => {
                document.removeEventListener('click', detectOutsidePopupClick)
                clearTimeout(closeTimeout);
            };
        }
    }, [isOpened]);

    function openDialog() {
        if (!isOpened) {
            dialogRef.current && type === "popup" && dialogRef.current?.show();
            dialogRef.current && type === "modal" && dialogRef.current?.showModal();
            setIsOpened(true);
        }
    }

    function closeDialog() {
        if (isOpened) {
            dialogRef.current && dialogRef.current?.blur();   // Required for smooth fade-out transitions
            dialogRef.current && dialogRef.current?.close();
            setIsOpened(false);
        }
    }

    return { isOpened, dialogRef, openDialog, closeDialog }
}