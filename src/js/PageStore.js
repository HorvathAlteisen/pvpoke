function writable(initialValue) {

    const subscribers = new Set();

    function subscribe(subscriber) {
        subscribers.add(subscriber);
    }

    function set(newValue) {
        initialValue = newValue;
        subscribers.forEach(subscriber => subscriber(initialValue));
    }

    function update(updater) {
        set(updater(initialValue));
    }

    return { subscribe, set, update };
}

const defaults = {
    'language': 'en',
    'localization': ''
}

function pageStore() {
    const finalValues = { ...defaults };
    
    Object.entries(defaults).forEach(([key, value]) => {
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null && storedValue !== undefined) {
            finalValues[key] = storedValue;
        } else {
            localStorage.setItem(key, value);
        }
    });

    const { subscribe, update } = writable(finalValues);

    function setValue(key, value) {
        localStorage.setItem(key, value);
        update(old => ({ ...old, [key]: value }));
    }

    function getValue(key) {
        return localStorage.getItem(key);
    }

    return {
        set: setValue,
        get: getValue,
        subscribe
    };
}