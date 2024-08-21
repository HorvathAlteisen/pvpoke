function createWritable(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    function subscribe(callback) {
        subscribers.add(callback);
        callback(value); // Immediately invoke callback with the current value

        // Return a function to unsubscribe
        return () => {
            subscribers.delete(callback);
        };
    }

    function set(newValue) {
        if (newValue !== value) {
            value = newValue;
            subscribers.forEach(callback => callback(value));
        }
    }

    function update(updater) {
        set(updater(value));
    }

    return { subscribe, set, update };
}

const defaults = {
    'language': 'en'
}

function pageStore() {
    const { subscribe, update } = createWritable(defaults)

    function setValue(key, value) {
        localStorage.setItem(key, value);
        update(old => { return { ...old, [key]: value } });
    }

    function getValue(key) {
        return localStorage.getItem(key);
    }

    Object.entries(defaults).forEach(([key, value]) => {
        const item = localStorage.getItem(key);
        item === null || item === undefined ? localStorage.setItem(key, value) : setValue(key, value)
    });

    return {
        set: setValue,
        get: getValue,
        subscribe
    }
}