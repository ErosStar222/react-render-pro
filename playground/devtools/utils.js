import {
  ElementTypeClass,
  ElementTypeForwardRef,
  ElementTypeFunction,
  ElementTypeMemo,
} from "./constants";

let uidCounter = 0;

export function getUID() {
  return ++uidCounter;
}

const cachedDisplayNames = new WeakMap();

export function getDisplayName(type, fallbackName) {
  const nameFromCache = cachedDisplayNames.get(type);

  if (nameFromCache != null) {
    return nameFromCache;
  }

  let displayName = fallbackName;

  // The displayName property is not guaranteed to be a string.
  // It's only safe to use for our purposes if it's a string.
  // github.com/facebook/react-devtools/issues/803
  if (typeof type.displayName === "string") {
    displayName = type.displayName;
  } else if (typeof type.name === "string" && type.name !== "") {
    displayName = type.name;
  }

  cachedDisplayNames.set(type, displayName);
  return displayName;
}

export function format(maybeMessage, ...inputArgs) {
  const args = inputArgs.slice();

  // Symbols cannot be concatenated with Strings.
  let formatted =
    typeof maybeMessage === "symbol"
      ? maybeMessage.toString()
      : "" + maybeMessage;

  // If the first argument is a string, check for substitutions.
  if (typeof maybeMessage === "string") {
    if (args.length) {
      const REGEXP = /(%?)(%([jds]))/g;

      formatted = formatted.replace(REGEXP, (match, escaped, ptn, flag) => {
        let arg = args.shift();
        switch (flag) {
          case "s":
            arg += "";
            break;
          case "d":
          case "i":
            arg = parseInt(arg, 10).toString();
            break;
          case "f":
            arg = parseFloat(arg).toString();
            break;
        }
        if (!escaped) {
          return arg;
        }
        args.unshift(arg);
        return match;
      });
    }
  }

  // Arguments that remain after formatting.
  if (args.length) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Symbols cannot be concatenated with Strings.
      formatted += " " + (typeof arg === "symbol" ? arg.toString() : arg);
    }
  }

  // Update escaped %% values.
  formatted = formatted.replace(/%{2,2}/g, "%");

  return "" + formatted;
}

export function utfDecodeString(array) {
  return String.fromCodePoint(...array);
}

export function utfEncodeString(string) {
  const encoded = new Array(string.length);

  for (let i = 0; i < string.length; i++) {
    encoded[i] = string.codePointAt(i);
  }

  return encoded;
}

export function copyWithDelete(obj, path, index) {
  const key = path[index];
  const updated = isArray(obj) ? obj.slice() : { ...obj };
  if (index + 1 === path.length) {
    if (isArray(updated)) {
      updated.splice(key, 1);
    } else {
      delete updated[key];
    }
  } else {
    // $FlowFixMe number or string is fine here
    updated[key] = copyWithDelete(obj[key], path, index + 1);
  }
  return updated;
}

export function renamePathInObject(object, oldPath, newPath) {
  const length = oldPath.length;
  if (object != null) {
    const parent = getInObject(object, oldPath.slice(0, length - 1));
    if (parent) {
      const lastOld = oldPath[length - 1];
      const lastNew = newPath[length - 1];
      parent[lastNew] = parent[lastOld];
      if (Array.isArray(parent)) {
        parent.splice(lastOld, 1);
      } else {
        delete parent[lastOld];
      }
    }
  }
}

export function copyWithRename(obj, oldPath, newPath, index = 0) {
  const oldKey = oldPath[index];
  const updated = Array.isArray(obj) ? obj.slice() : { ...obj };
  if (index + 1 === oldPath.length) {
    const newKey = newPath[index];
    // $FlowFixMe number or string is fine here
    updated[newKey] = updated[oldKey];
    if (Array.isArray(updated)) {
      updated.splice(oldKey, 1);
    } else {
      delete updated[oldKey];
    }
  } else {
    // $FlowFixMe number or string is fine here
    updated[oldKey] = copyWithRename(obj[oldKey], oldPath, newPath, index + 1);
  }
  return updated;
}

export function copyWithSet(obj, path, value, index = 0) {
  if (index >= path.length) {
    return value;
  }
  const key = path[index];
  const updated = Array.isArray(obj) ? obj.slice() : { ...obj };
  // $FlowFixMe number or string is fine here
  updated[key] = copyWithSet(obj[key], path, value, index + 1);
  return updated;
}

export function setInObject(object, path, value) {
  const length = path.length;
  const last = path[length - 1];
  if (object != null) {
    const parent = getInObject(object, path.slice(0, length - 1));
    if (parent) {
      parent[last] = value;
    }
  }
}

export function deletePathInObject(object, path) {
  const length = path.length;
  const last = path[length - 1];
  if (object != null) {
    const parent = getInObject(object, path.slice(0, length - 1));
    if (parent) {
      if (Array.isArray(parent)) {
        parent.splice(last, 1);
      } else {
        delete parent[last];
      }
    }
  }
}

export function cleanForBridge(data, isPathAllowed, path = []) {
  return;
  if (data !== null) {
    const cleanedPaths = [];
    const unserializablePaths = [];
    const cleanedData = dehydrate(
      data,
      cleanedPaths,
      unserializablePaths,
      path,
      isPathAllowed
    );

    return {
      data: cleanedData,
      cleaned: cleanedPaths,
      unserializable: unserializablePaths,
    };
  } else {
    return null;
  }
}

export function getInObject(object, path) {
  return path.reduce((reduced, attr) => {
    if (reduced) {
      if (hasOwnProperty.call(reduced, attr)) {
        return reduced[attr];
      }
      if (typeof reduced[Symbol.iterator] === "function") {
        // Convert iterable to array and return array[index]
        //
        // TRICKY
        // Don't use [...spread] syntax for this purpose.
        // This project uses @babel/plugin-transform-spread in "loose" mode which only works with Array values.
        // Other types (e.g. typed arrays, Sets) will not spread correctly.
        return Array.from(reduced)[attr];
      }
    }

    return null;
  }, object);
}

export function getEffectDurations(root) {
  // Profiling durations are only available for certain builds.
  // If available, they'll be stored on the HostRoot.
  let effectDuration = null;
  let passiveEffectDuration = null;
  const hostRoot = root.current;
  if (hostRoot != null) {
    const stateNode = hostRoot.stateNode;
    if (stateNode != null) {
      effectDuration =
        stateNode.effectDuration != null ? stateNode.effectDuration : null;
      passiveEffectDuration =
        stateNode.passiveEffectDuration != null
          ? stateNode.passiveEffectDuration
          : null;
    }
  }
  return { effectDuration, passiveEffectDuration };
}

export function sessionStorageGetItem(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function separateDisplayNameAndHOCs(displayName, type) {
  if (displayName === null) {
    return [null, null];
  }

  let hocDisplayNames = null;

  switch (type) {
    case ElementTypeClass:
    case ElementTypeForwardRef:
    case ElementTypeFunction:
    case ElementTypeMemo:
      if (displayName.indexOf("(") >= 0) {
        const matches = displayName.match(/[^()]+/g);
        if (matches != null) {
          displayName = matches.pop();
          hocDisplayNames = matches;
        }
      }
      break;
    default:
      break;
  }

  if (type === ElementTypeMemo) {
    if (hocDisplayNames === null) {
      hocDisplayNames = ["Memo"];
    } else {
      hocDisplayNames.unshift("Memo");
    }
  } else if (type === ElementTypeForwardRef) {
    if (hocDisplayNames === null) {
      hocDisplayNames = ["ForwardRef"];
    } else {
      hocDisplayNames.unshift("ForwardRef");
    }
  }

  return [displayName, hocDisplayNames];
}
