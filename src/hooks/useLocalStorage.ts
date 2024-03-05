import { useState } from 'react';

type TuseLocalStorageReturn<T> = [T, (value: T) => void
]

export function useLocalStorage<T>(key: string, initialValue: T): TuseLocalStorageReturn<T> {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    function setValue(value: T): void {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
    }

  return [storedValue, setValue];
}
