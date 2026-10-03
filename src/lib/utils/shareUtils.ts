import toast from 'react-hot-toast';

export const CHAMPION_SLOGAN = "Join Champion Footballer and play with friends like a true Champion! ⚽🏆";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  slogan?: string;
  customFullText?: string;
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
  } else {
    if (!fullText.includes(slogan)) {
      fullText = `${fullText}\n\n${slogan}`;
    }
    if (!fullText.includes(shareUrl)) {
      fullText = `${fullText}\n${shareUrl}`;
    }
  }

  const shareTitle = options.title || 'Champion Footballer';

  // 1. Try Native Web Share API first
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: fullText,
        url: shareUrl,
      });
      return;
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.warn('Native share error or dismissed:', error);
    }
  }

  // 2. Fallback: Copy full text to clipboard
  let copySuccess = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullText);
      toast.success('Link & invite copied to clipboard!');
      copySuccess = true;
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
  }

  // 3. Fallback for desktop browser without share API: Open WhatsApp directly
  if (!copySuccess && typeof window !== 'undefined') {
    try {
      const encoded = encodeURIComponent(fullText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    } catch {}
  }
}
