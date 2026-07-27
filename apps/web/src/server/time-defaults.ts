import "server-only";

export function getAskTimeDefaults() {
  const minimum = new Date();
  minimum.setMinutes(0, 0, 0);
  minimum.setHours(minimum.getHours() + 1);
  const suggested = new Date(minimum.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    minimumNeededAt: minimum.toISOString(),
    suggestedNeededAt: suggested.toISOString(),
  };
}
