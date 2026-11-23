function withRetries(func, { maxAttempts = 3, initialDelayMs = 250 } = {}) {
    return async (...args) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await func(...args);
            } catch (error) {
                const status = Number(error.code || error.status);
                if (attempt === maxAttempts || (status !== 429 && status < 500) || !Number.isFinite(status)) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, initialDelayMs * (2 ** (attempt - 1))));
            }
        }
    };
}

module.exports = { withRetries };
