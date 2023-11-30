import { Signal, useSignal } from "@preact/signals-react";

type TuseSignalStateReturn<T> = [
    Signal<T>,
    (value: T) => void
]

export function useSignalState<T>(value: T): TuseSignalStateReturn<T> {
    const signal = useSignal<T>(value);
    const setSignal = (value: T) => {signal.value = value};
    return [signal, setSignal];
}