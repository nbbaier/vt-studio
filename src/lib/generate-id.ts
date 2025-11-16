export function generateId() {
  // Use window.crypto if available (browser), otherwise fall back to global crypto
  const cryptoObj =
    typeof window !== "undefined" && window.crypto
      ? window.crypto
      : typeof crypto !== "undefined"
        ? crypto
        : null;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
  // Use getRandomValues for cryptographically secure random numbers
  const getRandomValue = (arr: Uint8Array) => {
    if (cryptoObj?.getRandomValues) {
      return cryptoObj.getRandomValues(arr);
    }
    // Fallback for environments without getRandomValues (shouldn't happen in browsers)
    // This is a last resort fallback
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  };

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (getRandomValue(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(
      16,
    ),
  );
}
