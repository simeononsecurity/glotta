function withRetries(func) {
    return async function () {
        let numRetries = 0;
        const maxRetries = 10;
        const initialDelayMs = 5000;
        const backoffFactor = 2;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await func(...arguments);
                return result;
            }
            catch (err) {
                if (!isRetryable(err)) {
                    throw err;
                }
                numRetries++;
                const delayMs = initialDelayMs * Math.pow(backoffFactor, numRetries);
                console.warn(`Error during request. Retrying in ${delayMs} ms.`, err);
                await sleep(delayMs);
            }
        }
    }
}


async function isRetryable(err) {
    return (err.code === 429 || err.code >= 500) && numRetries < maxRetries;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    withRetries
}
