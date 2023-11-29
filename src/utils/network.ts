export default async function* fetchEvents<T>(response: Response): AsyncGenerator<T, any, any> {
    if (!response.ok || response.body === null) {
        throw new Error("Network response was not ok " + response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let incompleteChunk = '';
    try {
        while (true) {
            const {done, value} = await reader.read();
            let chunkContent = incompleteChunk + decoder.decode(value);
            if (done && chunkContent.startsWith('data: [DONE]')) {break};
            while (true) {
                const matchResult = chunkContent.match(/^data: (\{(?:.|\s)+?\})\n\n/m);
                if (matchResult !== null) {
                    yield JSON.parse(matchResult[1]);
                    chunkContent = chunkContent.substring(matchResult[0].length);
                } else {
                    incompleteChunk = chunkContent;
                    break;
                }

            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}