// Ephemeral in-memory store (per server instance)
const globalKey = '__BUYBOT_EVENTS__';
if (!global[globalKey]) {
  global[globalKey] = [];
}

export function addEvent(event) {
  try {
    global[globalKey].push(event);
  } catch (_) {}
}

export function getEvents() {
  try {
    return [...global[globalKey]];
  } catch (_) {
    return [];
  }
}
