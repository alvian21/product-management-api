module.exports = (fields) => {
  const missingKeys = [];
  Object.keys(fields).forEach((key) => {
    const value = fields[key];

    const isValueMissing = (val) => {
      // Allow numbers (like 0) and booleans (like false)
      if (typeof val === "number" || typeof val === "boolean") return false;
      // Consider null, undefined, empty string, and empty objects as missing
      if (!val) return true;
      if (
        typeof val === "object" &&
        !Array.isArray(val) &&
        Object.keys(val).length === 0
      )
        return true;
      return false;
    };

    if (Array.isArray(value)) {
      if (value.length === 0) {
        missingKeys.push(key);
      } else {
        // If it's an array, it's missing if ALL items are missing
        const allMissing = value.every((item) => isValueMissing(item));
        if (allMissing) missingKeys.push(key);
      }
    } else {
      if (isValueMissing(value)) {
        missingKeys.push(key);
      }
    }
  });
  return missingKeys;
};
