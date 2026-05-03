import { MutableRefObject, useEffect } from 'react';

const FRAME_MS = 34;
const MIN_STEP = 2;
const MAX_STEP = 18;
const WORD_LOOKAHEAD = 14;

function nextWhitespaceBoundary(text: string, fromIndex: number, maxIndex: number) {
    for (let index = fromIndex; index <= maxIndex; index += 1) {
        if (/\s/.test(text[index] ?? '')) {
            return index + 1;
        }
    }

    return -1;
}

function nextBufferedText(target: string, current: string) {
    if (!target || target.length <= current.length) {
        return target;
    }

    const remaining = target.length - current.length;
    if (remaining <= MAX_STEP) {
        return target;
    }

    const step = Math.max(MIN_STEP, Math.min(MAX_STEP, Math.ceil(remaining / 10)));
    const desiredEnd = current.length + step;
    const boundaryEnd = nextWhitespaceBoundary(
        target,
        desiredEnd,
        Math.min(target.length - 1, desiredEnd + WORD_LOOKAHEAD),
    );

    return target.slice(0, boundaryEnd === -1 ? desiredEnd : boundaryEnd);
}

export function useBufferedStream(
    targetRef: MutableRefObject<string>,
    isActive: boolean,
    setVisibleText: (value: string | ((previous: string) => string)) => void,
) {
    useEffect(() => {
        if (!isActive) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setVisibleText((previous) => nextBufferedText(targetRef.current, previous));
        }, FRAME_MS);

        return () => window.clearInterval(intervalId);
    }, [isActive, setVisibleText, targetRef]);
}
