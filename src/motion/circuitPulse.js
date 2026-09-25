/**
 * Circuit Signal Pulse Motion Graphics
 * Adds animated electrical current pulses to circuit lines and telemetry badges
 */
export function initCircuitPulses() {
  const pulseTracks = document.querySelectorAll('.pulse-track');

  pulseTracks.forEach((track) => {
    // Generate pulsating spark bead
    const spark = document.createElement('span');
    spark.className = 'pulse-spark';
    track.appendChild(spark);
  });
}
