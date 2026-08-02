/**
 * Mobile Device & Native PWA Capabilities Utility
 */

/**
 * Triggers native haptic vibration feedback if supported
 * @param {number|number[]} pattern - Vibration duration in ms or pattern array
 */
export function triggerHaptic(pattern = 20) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore security errors on un-user-gestured vibration
    }
  }
}

/**
 * Shares content using Native Web Share API on mobile devices,
 * falling back to copying the link to clipboard on desktop/unsupported browsers.
 * @param {Object} data - { title, text, url }
 * @returns {Promise<{ shared: boolean, copied: boolean }>}
 */
export async function shareNativeContent({ title, text, url }) {
  triggerHaptic(25);
  const shareUrl = url || window.location.href;
  const shareTitle = title || 'CampusConnect';
  const shareText = text || 'Check this out on CampusConnect!';

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return { shared: true, copied: false };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back to clipboard:', err);
      } else {
        return { shared: false, copied: false };
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { shared: false, copied: true };
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return { shared: false, copied: false };
  }
}

/**
 * Checks if current environment is a touch/mobile device
 */
export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
