
const os = require('os');

/**
 * @returns {{
 *   platform: string,
 *   cpuCores: number,
 *   totalMemoryMB: number,
 *   freeMemoryMB: number,
 *   usedMemoryPercent: number,
 *   uptimeHours: number,
 *   homeDir: string
 * }}
 */
function getSystemHealth() {
  // TODO: gather system stats via os module and format as specified
}

module.exports = { getSystemHealth };