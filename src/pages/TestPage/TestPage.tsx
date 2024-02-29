import {useSignal} from "@preact/signals-react";
import {Signal} from "@preact/signals-core";

function Displayyy({num}: {num: Signal<{num: number}>[]}) {
    return <p>{num[0].value.num}</p>
}

export function TestPage() {
    const s = useSignal({num: 0});

    async function generate() {
        // eslint-disable-next-line no-constant-condition
        for (let i=0; i<5000000; i++) {
            s.value = {...s.value, num: s.value.num + 1};
            await new Promise((resolve) => {
                setTimeout(resolve, 1)
            })
        }
    }

    return (
        <div>
            <Displayyy num={[s]}/>
            <button onClick={generate}>Click</button>
        </div>
    )
}