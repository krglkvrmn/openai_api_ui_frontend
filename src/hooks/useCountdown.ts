import {batch, Signal, useSignal} from "@preact/signals-react";

type TuseCountdownReturn = {
    count: Signal<number>,
    startCountdown: (totalSeconds: number, stepSeconds: number) => void,
    resetCountdown: () => void,
    isFinished: Signal<boolean>
};

export function useCountdown(): TuseCountdownReturn {
    const count = useSignal(0);
    const isFinished = useSignal(true);
    const intervals = useSignal<(NodeJS.Timeout | null)[]>([null, null]);

    function startCountdown(totalSeconds: number, stepSeconds: number): void {
        batch(() => {
            count.value = totalSeconds;
            isFinished.value = false;
        });
        const interval = setInterval(() => {
            count.value = count.value - 1;
        }, stepSeconds * 1000);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            isFinished.value = true;
        }, totalSeconds * 1000);
        intervals.value = [interval, timeout];
    }

    function resetCountdown(): void {
        const [interval, timeout] = intervals.value;
        interval !== null && clearInterval(interval);
        timeout !== null && clearTimeout(timeout);
        batch(() => {
            intervals.value = [null, null];
            isFinished.value = false;
            count.value = 0;
        });
    }

    return {count, startCountdown, resetCountdown, isFinished};
}