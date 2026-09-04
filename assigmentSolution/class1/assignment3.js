const os = require('os');

function getSystemHealth() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    const totalMemoryMB = Math.round(
        totalMemory / (1024 * 1024)
    );

    const freeMemoryMB = Math.round(
        freeMemory / (1024 * 1024)
    );

    const usedMemoryPercent = Number(
        (((totalMemory - freeMemory) / totalMemory) * 100)
            .toFixed(2)
    );

    const uptimeHours = Number(
        (os.uptime() / 3600).toFixed(2)
    );

    return {
        platform: os.platform(),
        cpuCores: os.cpus().length,
        totalMemoryMB,
        freeMemoryMB,
        usedMemoryPercent,
        uptimeHours,
        homeDir: os.homedir()
    };
}

module.exports = { getSystemHealth };