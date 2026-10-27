import toast from 'react-hot-toast';
import { toBlob } from 'html-to-image';

export const CHAMPION_SLOGAN = "Join Champion Footballer and play with friends like a true Champion! ⚽🏆";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  slogan?: string;
  customFullText?: string;
  files?: File[];
}

export interface WhatsAppShareOptions {
  title?: string;
  message: string;
  file?: File | null;
  fileName?: string;
}

/**
 * Universal WhatsApp sharing helper.
 * On mobile (Android/iOS) and supported desktop browsers, uses Web Share API to pass the actual image file directly to WhatsApp.
 * On desktop browsers where WhatsApp Web opens via URL (which cannot accept local files), it:
 * 1) Copies the card image to the clipboard so the user can immediately paste (Ctrl+V) in WhatsApp Web.
 * 2) Automatically downloads the card image so the user has the file readily available to drag/attach.
 * 3) Opens WhatsApp Web with the pre-filled text.
 * 4) Shows a clear toast notification instructing the user to paste (Ctrl+V) or attach the image.
 */
export async function shareToWhatsApp({
  title,
  message,
  file,
  fileName = 'player-card.png',
}: WhatsAppShareOptions): Promise<void> {
  const shareTitle = title || 'Champion Footballer';

  // 1. Try Native Web Share API with files first (Mobile Android/iOS, Windows Edge/Chrome)
  if (file && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    let canShareFiles = false;
    try {
      canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
    } catch {}

    if (canShareFiles) {
      try {
        await navigator.share({
          title: shareTitle,
          text: message,
          files: [file],
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.warn('Native share with file failed or dismissed:', err);
      }
    }
  }

  // 2. Desktop fallback (WhatsApp Web via URL):
  if (file) {
    try {
      await copyImageToClipboard(file);
    } catch {}
    downloadBlob(file, fileName);
    toast.success('Card image downloaded & copied! In WhatsApp, press Ctrl+V or attach the image.', {
      duration: 6000,
    });
  }

  if (typeof window !== 'undefined') {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }
}

/**
 * Universal Share Helper for Champion Footballer.
 * Uses native Web Share API (WhatsApp, Telegram, etc.) with automatic fallback to Clipboard & WhatsApp Web URL.
 * Automatically appends the professional English slogan and website link.
 */
export async function shareContent(options: ShareOptions): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://championfootballer.com';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : origin;
  const shareUrl = options.url || currentUrl;
  const slogan = options.slogan || CHAMPION_SLOGAN;

  let fullText = options.customFullText;
  if (!fullText) {
    const mainText = options.text ? options.text.trim() : '';
    fullText = mainText
      ? `${mainText}\n\n${slogan}\n${shareUrl}`
      : `${slogan}\n${shareUrl}`;
  }

  const shareTitle = options.title || 'Champion Footballer';

  // Proactively copy text or try to copy
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && (!options.files || options.files.length === 0)) {
      navigator.clipboard.writeText(fullText).catch(() => {});
    }
  } catch {}

  // 1. Try Native Web Share API first
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const shareData: ShareData = {
        title: shareTitle,
        text: fullText,
      };

      if (options.files && options.files.length > 0) {
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: options.files })) {
          shareData.files = options.files;
        }
      }

      if (!shareData.files && shareUrl) {
        shareData.url = shareUrl;
      }

      await navigator.share(shareData);
      return;
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.warn('Native share error or dismissed:', error);
    }
  }

  // 2. Fallback when native share is unavailable (e.g. desktop):
  if (options.files && options.files.length > 0) {
    const file = options.files[0];
    await copyImageToClipboard(file);
    downloadBlob(file, file.name);
    toast.success('Card image downloaded & copied! In WhatsApp, press Ctrl+V or attach the image.', { duration: 6000 });
  } else {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
        toast.success('Details copied to clipboard!');
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  }

  // 3. Fallback for desktop browser: Open WhatsApp directly
  if (typeof window !== 'undefined') {
    try {
      const encoded = encodeURIComponent(fullText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    } catch {}
  }
}

/**
 * Capture an HTMLElement as an image File ready for sharing.
 * Uses skipFonts: true and cacheBust: false for high-speed reliable rendering.
 */
export async function captureElementAsFile(
  element: HTMLElement,
  fileName: string = 'player-card.png'
): Promise<File | null> {
  try {
    // Wait for any pending images in element to finish loading
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 800);
        });
      })
    );

    const blob = await toBlob(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      filter: (node) => {
        if ((node as HTMLElement)?.dataset?.shareExclude === 'true') {
          return false;
        }
        return true;
      },
    });

    if (!blob) return null;
    const safeName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    return new File([blob], safeName, { type: 'image/png' });
  } catch (err) {
    console.warn('Failed to capture element as file:', err);
    return null;
  }
}

/**
 * Download a Blob/File directly to user's device
 */
export function downloadBlob(blobOrFile: Blob | File, fileName: string = 'player-card.png'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const url = URL.createObjectURL(blobOrFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }, 1500);
  } catch (err) {
    console.warn('Download error:', err);
  }
}

/**
 * Copy image directly to clipboard for WhatsApp Web / desktop rich-paste
 */
export async function copyImageToClipboard(blobOrFile: Blob | File): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
    return false;
  }
  try {
    let pngBlob: Blob;
    if (blobOrFile instanceof Blob && blobOrFile.type === 'image/png' && !(blobOrFile instanceof File)) {
      pngBlob = blobOrFile;
    } else {
      const buffer = await blobOrFile.arrayBuffer();
      pngBlob = new Blob([buffer], { type: 'image/png' });
    }
    const item = new ClipboardItem({ 'image/png': pngBlob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (e) {
    console.warn('Failed writing image to clipboard:', e);
    return false;
  }
}

/**
 * Copy both image blob/file and text to the clipboard simultaneously
 */
export async function copyImageAndTextToClipboard(
  blobOrFile: Blob | File | null,
  text: string
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;

  let pngBlob: Blob | null = null;
  if (blobOrFile) {
    try {
      if (blobOrFile instanceof Blob && blobOrFile.type === 'image/png') {
        pngBlob = blobOrFile;
      } else {
        const buffer = await blobOrFile.arrayBuffer();
        pngBlob = new Blob([buffer], { type: 'image/png' });
      }
    } catch {}
  }

  // 1. Try writing BOTH image and text in a single ClipboardItem
  if (pngBlob && typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    try {
      const item = new ClipboardItem({
        'image/png': pngBlob,
        'text/plain': new Blob([text], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch (e) {
      console.warn('Dual image+text ClipboardItem failed, falling back to image only:', e);
      try {
        const item = new ClipboardItem({ 'image/png': pngBlob });
        await navigator.clipboard.write([item]);
        return true;
      } catch (e2) {
        console.warn('Image-only ClipboardItem failed:', e2);
      }
    }
  }

  // 2. Fallback to writing text
  if (navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  // 3. Last fallback execCommand
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {}
  }

  return false;
}
